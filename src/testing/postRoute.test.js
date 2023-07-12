const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../models/UserModel");
const fs = require("fs");

const { app } = require("../server");

const { describe, afterAll, it, expect } = require("@jest/globals");
const { generateUserJWT } = require("../services/auth_services");

describe("Get all posts route working...", () => {
  it("...Server responds with all posts.", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
  });

  it("...Server responds with specfic postId.", async () => {
    // Make the request to get a specific post
    const postResponse = await request(app).get("/posts");

    // Retrieve the ID from the response body
    const postId = postResponse.body.data[0]._id;

    // Make another request using the retrieved ID
    const response = await request(app).get(`/posts?postId=${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data._id).toBe(postId);
  });

  it("...Server responds with error message for a non-existent postId.", async () => {
    const response = await request(app).get("/posts?postId=64adee6a0d2a0ebeac8a8cdf");
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Post not found");
  });

  it("...Server return posts filtered by specific field (species).", async () => {
    const response = await request(app).get("/posts?species=dog");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (const post of posts) {
      expect(post.species).toBe("dog");
    }
  });

  it("...Server return posts filtered by specific field (status).", async () => {
    const response = await request(app).get("/posts?status=lost");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (const post of posts) {
      expect(post.status).toBe("lost");
    }
  });

  it("...Server return posts filtered by multiple field (status, color).", async () => {
    const response = await request(app).get("/posts?status=lost&color=cream");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (const post of posts) {
      expect(post.status).toBe("lost");
      expect(post.color).toBe("cream");
    }
  });

  it("...Server return posts in descending order.", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].createdAt >= posts[i + 1].createdAt).toBe(true);
    }
  });
});

describe("Get all distinct status...", () => {
  it("...Server responds with all distinct status.", async () => {
    const response = await request(app).get("/posts/filter?status=color");
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
  });
});

describe("Get all posts from specific user route", () => {
  it("...Server responds with all posts from a specific user", async () => {
    // Create a new user or fetch an existing user
    const user = await User.findOne({ username: "ji" }).exec();

    // Generate a JWT token with the user ID
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // Make the request with the JWT token in the headers
    const response = await request(app).get("/posts/user").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (const post of posts) {
      expect(post.userId).toBe(user._id.toString());
    }
  });
});

describe("Create post route", () => {
  it("...Server creates a new post", async () => {
    // Create a new user or fetch an existing user
    const user = await User.findOne({ username: "ji" }).exec();

    // Generate a JWT token with the user ID
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // Read the file from the file system
    const fileBuffer = fs.readFileSync("./src/image/dog.jpg");

    // Make the request with the JWT token and file attachment
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .attach("photos", fileBuffer, { filename: "dog.jpg" })
      .field("title", "Example")
      .field("status", "lost")
      .field("color", "cream")
      .field("breed", "Poodle")
      .field("species", "Dog")
      .field("suburb", "2088")
      .field("contactInfo", "0412345678")
      .field("description", "This is an example post");

    console.log(response.body);
    expect(response.statusCode).toBe(200);
    const createdPost = response.body.data;
    expect(createdPost.title).toBe("Example");
    expect(createdPost.species).toBe("Dog");
    expect(createdPost.description).toBe("This is an example post");
    expect(createdPost.userId).toBe(user._id.toString());
    expect(createdPost.photos.length).toBe(1);
    expect(createdPost.photos[0]).toContain("dog.jpg");
    expect(createdPost.status).toBe("lost");
    expect(createdPost.color).toBe("cream");
    expect(createdPost.breed).toBe("Poodle");
    expect(createdPost.suburb).toBe("2088");
    expect(createdPost.contactInfo).toBe("0412345678");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
