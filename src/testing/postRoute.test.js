// import necessary modules and dependencies for the tests.
// import testing libraries
const request = require("supertest");
const { describe, afterAll, it, expect } = require("@jest/globals");

// import mongoose for database disconnect
const mongoose = require("mongoose");

// import database models
const { User } = require("../models/UserModel");
const { Post } = require("../models/PostModel");

// import file system module for creating the test image
const fs = require("fs");

const { app } = require("../server");

// import authentication services
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

    // Make another request using the retrieved ID to make sure the server responds with the correct post
    const response = await request(app).get(`/posts?postId=${postId}`);
    expect(response.statusCode).toBe(200);
    // Check if the server responds with the correct post
    expect(response.body.data._id).toBe(postId);
  });

  it("...Server responds with error message for a non-existent postId.", async () => {
    // Make the request to get post from an invalid ID
    const response = await request(app).get("/posts?postId=64adee6a0d2a0ebeac8a8cdf");
    // Check if the server responds with the correct error message
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Post not found");
  });

  it("...Server return posts filtered by specific field (species).", async () => {
    // Make the request to get posts filtered by species
    const response = await request(app).get("/posts?species=dog");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    // check if the server responds with correct posts (all posts should be dogs)
    // loop through all the posts and check if the species is dog
    for (const post of posts) {
      expect(post.species).toBe("dog");
    }
  });

  it("...Server return posts filtered by specific field (status).", async () => {
    // Make the request to get posts filtered by status
    const response = await request(app).get("/posts?status=lost");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    // check if the server responds with correct posts (all posts should be lost)
    // loop through all the posts and check if the status is lost
    for (const post of posts) {
      expect(post.status).toBe("lost");
    }
  });

  it("...Server return posts filtered by multiple field (status, color).", async () => {
    // Make the request to get posts filtered by multiple fields  (status and color)
    const response = await request(app).get("/posts?status=lost&color=cream");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (const post of posts) {
      // check if the server responds with correct posts (all posts should be lost and cream)
      expect(post.status).toBe("lost");
      expect(post.color).toBe("cream");
    }
  });

  it("...Server return posts in descending order.", async () => {
    // Make the request to get posts in descending order
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    // use a for loop to check if the posts are in descending order
    for (let i = 0; i < posts.length - 1; i++) {
      // check if the createdAt date of the current post is greater than or equal to the createdAt date of the next post
      expect(posts[i].createdAt >= posts[i + 1].createdAt).toBe(true);
    }
  });
});

describe("Get all distinct status...", () => {
  it("...Server responds with all distinct status.", async () => {
    // Make the request to get all distinct status from posts collection
    const response = await request(app).get("/posts/filter?status=color");
    // Check if the server responds with the correct status code
    expect(response.statusCode).toBe(200);
  });
});

describe("Get all posts from specific user route", () => {
  it("...Server responds with all posts from a specific user", async () => {
    // Fetch an existing user from the database
    const user = await User.findOne({ username: "ji" }).exec();

    // Generate a JWT token with the user ID
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // Make the request with the JWT token in the headers to get all posts from the user
    const response = await request(app).get("/posts/user").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    // Using a for loop, check if all the posts are from the user
    for (const post of posts) {
      expect(post.userId).toBe(user._id.toString());
    }
  });

  // Test for none JWT provided
  it("...Server responds with error message for none JWT provide", async () => {
    const response = await request(app).get("/posts/user");
    expect(response.statusCode).toBe(400);
    // Check if the server responds with the correct error message
    expect(response.body.errors).toContain("Unauthorized");
  });

  // Test for invalid JWT provided
  it("...Server responds with error message for invalid JWT", async () => {
    const invalidToken = "invalidToken";
    const response = await request(app)
      .get("/posts/user")
      .set("Authorization", `Bearer ${invalidToken}`);
    expect(response.statusCode).toBe(400);
    // Check if the server responds has "errors" in the response body
    expect(response.body).toHaveProperty("errors");
  });
});

describe("Create post route", () => {
  it("...Server creates a new post", async () => {
    // Fetch an existing user
    const user = await User.findOne({ username: "ji" }).exec();

    // Generate a JWT token with the user ID
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // Read the file from the file system
    // The file is located in the src/image folder
    const fileBuffer1 = fs.readFileSync("./src/image/dog1.jpg");
    const fileBuffer2 = fs.readFileSync("./src/image/dog2.jpg");

    // Make the request with the JWT token and file attachment
    // The file attachment is the photo of the post that we want to create
    // The file attachment is a buffer of the image file that we read from the file system
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .attach("photos", fileBuffer1, { filename: "dog1.jpg" })
      .attach("photos", fileBuffer2, { filename: "dog2.jpg" })
      .field("title", "Example")
      .field("status", "lost")
      .field("color", "cream")
      .field("breed", "Poodle")
      .field("species", "Dog")
      .field("suburb", "2088")
      .field("contactInfo", "0412345678")
      .field("description", "This is an example post");

    expect(response.statusCode).toBe(200);

    const createdPost = response.body.data;
    expect(createdPost.title).toBe("Example");
    expect(createdPost.species).toBe("Dog");
    expect(createdPost.description).toBe("This is an example post");
    // Check if the user ID of the created post is the same as the user ID of the user from JWT token
    expect(createdPost.userId).toBe(user._id.toString());
    // Check if the photos array of the created post has 2 elements
    expect(createdPost.photos.length).toBe(2);
    // Check if the photoUrl of each photo is a valid URL from AWS S3
    for (const photoUrl of createdPost.photos) {
      expect(photoUrl).toMatch(/^https:\/\/pawsreunite.s3.amazonaws.com\/.*/);
    }
    expect(createdPost.status).toBe("lost");
    expect(createdPost.color).toBe("cream");
    expect(createdPost.breed).toBe("Poodle");
    expect(createdPost.suburb).toBe("2088");
    expect(createdPost.contactInfo).toBe("0412345678");
  });

  it("...Server responds with error message for invalid post data (title is more than 10 character)", async () => {
    // Fetch an existing user
    const user = await User.findOne({ username: "ji" }).exec();
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    const fileBuffer1 = fs.readFileSync("./src/image/dog1.jpg");

    // Make the request with the JWT token and file attachment, but title field is more than 10 characters
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .attach("photos", fileBuffer1, { filename: "dog1.jpg" })
      .field("title", "This is a title that is more than 10 characters")
      .field("color", "cream")
      .field("breed", "Poodle")
      .field("species", "Dog")
      .field("suburb", "2088")
      .field("contactInfo", "0412345678")
      .field("description", "This is an example post");

    expect(response.statusCode).toBe(400);
    // Check if the server responds with the correct error message
    expect(response.body.errors).toContain("Title must be less than 10 characters long");
  });

  it("...Server responds with error message for invalid post data (missing required fields)", async () => {
    // Fetch an existing user
    const user = await User.findOne({ username: "ji" }).exec();
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    const fileBuffer1 = fs.readFileSync("./src/image/dog1.jpg");

    // Make the request with the JWT token and file attachment, but missing required fields (species and status)
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .attach("photos", fileBuffer1, { filename: "dog1.jpg" })
      .field("title", "title")
      .field("color", "cream")
      .field("breed", "Poodle")
      .field("suburb", "2088")
      .field("contactInfo", "0412345678")
      .field("description", "This is an example post");

    expect(response.statusCode).toBe(400);

    // Check if the server responds with error messages for missing required fields
    // only can use backtick for template string, can't use single quote
    expect(response.body.error).toContain("Path `species` is required.");
    expect(response.body.error).toContain("Path `status` is required.");
  });
});

describe("Delete post route...", () => {
  it("...when user is not authorised to delete this post", async () => {
    // Fetch an existing user1 and user2
    const user1 = await User.findOne({ username: "ji" }).exec();
    const user2 = await User.findOne({ username: "eddy" }).exec();

    // Generate a JWT token with the user ID
    const token1 = await generateUserJWT({
      userId: user1._id,
      username: user1.username,
      email: user1.email
    });

    // Generate a JWT token with the user ID
    const token2 = await generateUserJWT({
      userId: user2._id,
      username: user2.username,
      email: user2.email
    });

    // Get the last post of user1
    const posts = await request(app).get("/posts/user").set("Authorization", `Bearer ${token1}`);
    const lastElementindex = posts.body.data.length - 1;
    const postId = posts.body.data[lastElementindex]._id;

    // Make the request with the JWT token in the headers, user2 is not authorised to delete this post
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(403);
    // Check if the server responds with the correct error message
    expect(response.body.error).toBe("You are not authorized to delete this post.");
  });

  it("...when user is authorised to delete this post", async () => {
    const user = await User.findOne({ username: "ji" }).exec();

    // Generate a JWT token with the user ID
    const token = await generateUserJWT({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // Get the last post of user
    const posts = await request(app).get("/posts/user").set("Authorization", `Bearer ${token}`);
    const lastElementindex = posts.body.data.length - 1;
    const postId = posts.body.data[lastElementindex]._id;

    // Find the post in the database before deleting it
    const deletedPost = await Post.findById(postId).exec();

    // Make the request with the JWT token in the headers, user is authorised to delete this post
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    // Check if the response post data is the same as the deleted post data
    expect(response.body.data._id).toBe(deletedPost._id.toString());
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
