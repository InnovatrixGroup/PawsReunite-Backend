const request = require("supertest");
const mongoose = require("mongoose");

const { app } = require("../server");

const { describe, afterAll, it, expect } = require("@jest/globals");

describe("Get all posts route working...", () => {
  it("...Server responds with all posts.", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
  });

  it("...Server responds with postId = 64adee6a0d2a0ebeac8a887e.", async () => {
    const response = await request(app).get("/posts?postId=64adee6a0d2a0ebeac8a887e");
    expect(response.statusCode).toBe(200);
    expect(response.body.data._id).toBe("64adee6a0d2a0ebeac8a887e");
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

  it("...Server return posts in ascending order.", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    const posts = response.body.data;
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].createdAt <= posts[i + 1].createdAt).toBe(true);
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

afterAll(async () => {
  await mongoose.connection.close();
});
