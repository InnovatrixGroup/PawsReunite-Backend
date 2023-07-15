const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const { Comment } = require("../models/CommentModel");
const { User } = require("../models/UserModel");
const { Post } = require("../models/PostModel");
const { describe, beforeAll, afterAll, it, expect } = require("@jest/globals");
const { generateUserJWT } = require("../services/auth_services");

const databaseURL = "mongodb://127.0.0.1:27017/PawsReunite_Test";

let randomPostId, regularUser1JWT, regularUser2JWT, adminUserJWT, createdCommentId;

// a function to generate a unique and not existing ObjectId in current collection
const generateUniqueObjectId = async () => {
  let unique = false;
  let randomId;

  while (!unique) {
    randomId = new mongoose.Types.ObjectId();
    const existingDoc = await Comment.findOne({ _id: randomId }).exec();
    unique = !existingDoc;
  }

  return randomId;
};

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(databaseURL, {});

  // randomly get a post from the database
  const posts = await Post.find({});
  randomPostId = posts[Math.floor(Math.random() * posts.length)]._id;

  // Fetch existing users from the database
  const adminUser = await User.findOne({ username: "ji" }).exec();
  const regularUser1 = await User.findOne({ username: "tom" }).exec();
  const regularUser2 = await User.findOne({ username: "eddy" }).exec();
  // Generate a JWT token with the user ID
  regularUser1JWT = await generateUserJWT({
    userId: regularUser1._id,
    username: regularUser1.username,
    email: regularUser1.email
  });
  // Generate a JWT token with the user ID
  regularUser2JWT = await generateUserJWT({
    userId: regularUser2._id,
    username: regularUser2.username,
    email: regularUser2.email
  });
  // Generate a JWT token with the user ID
  adminUserJWT = await generateUserJWT({
    userId: adminUser._id,
    username: adminUser.username,
    email: adminUser.email
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

// test get comments route
describe("Get comment", () => {
  it("User can get all comments successfully", async () => {
    const res = await request(app).get("/comments");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // test get specific comments route
  it("User can get a specific comment successfully if providing correct id", async () => {
    // randomly get a comment from the database
    const comments = await Comment.find({});
    let randomCommentId = comments[Math.floor(Math.random() * comments.length)]._id;

    const res = await request(app).get(`/comments/${randomCommentId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toBeInstanceOf(Object);
    expect(res.body.data._id).toEqual(randomCommentId.toString());
  });

  // test get specific comments route
  it("User cannot get a specific comment successfully if providing a not-existing id", async () => {
    // generate a random comment id that doesn't exist in the database
    let nonExistingCommentId = await generateUniqueObjectId();

    const res = await request(app).get(`/comments/${nonExistingCommentId}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toContain("Comment not found");
  });
});

// test create comment route
describe("Create comment", () => {
  it("User cannot create comment without authentication", async () => {
    const res = await request(app).post(`/comments/${randomPostId}`).send({
      content: "This is a test comment"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContain("Unauthorized");
  });

  it("User can create comment if authenticated and providing enough information", async () => {
    // comment is created by regularUser1
    const res = await request(app)
      .post(`/comments/${randomPostId}`)
      .send({
        content: "This is a test comment"
      })
      .set("Authorization", "Bearer " + regularUser1JWT);

    // save the created comment id for later use
    createdCommentId = res.body.data._id;

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toBeInstanceOf(Object);
  });

  it("User cannot create comment if not providing enough information", async () => {
    // test when content is missing
    const res = await request(app)
      .post(`/comments/${randomPostId}`)
      .set("Authorization", "Bearer " + regularUser1JWT);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty("error");
  });
});

// test delete comment route
describe("Delete comment", () => {
  it("User cannot delete comment without authentication", async () => {
    const res = await request(app).delete(`/comments/${createdCommentId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContain("Unauthorized");
  });

  it("User cannot delete comment if the comment author is NOT the same user", async () => {
    // comment is created by regularUser1, but regularUser2 is trying to delete it
    const res = await await request(app)
      .delete(`/comments/${createdCommentId}`)
      .set("Authorization", "Bearer " + regularUser2JWT);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain("not authorized");
  });

  it("User can delete comment successfully if the comment author is the same user", async () => {
    // comment is created by regularUser1, and regularUser1 is trying to delete it
    const res = await request(app)
      .delete(`/comments/${createdCommentId}`)
      .set("Authorization", "Bearer " + regularUser1JWT);

    expect(res.statusCode).toEqual(200);

    // check if the comment is deleted from the database
    let deletedComment = await Comment.findById(createdCommentId);
    expect(deletedComment).toBeNull();
  });

  it("User can delete comment successfully if the user is admin", async () => {
    // recreate the comment because it's been deleted in the previous test
    const res1 = await request(app)
      .post(`/comments/${randomPostId}`)
      .send({
        content: "This is a test comment"
      })
      .set("Authorization", "Bearer " + regularUser1JWT);
    // save the created comment id for later use
    createdCommentId = res1.body.data._id;

    // below is the test
    // comment is created by regularUser1, and admin is trying to delete it
    const res2 = await request(app)
      .delete(`/comments/${createdCommentId}`)
      .set("Authorization", "Bearer " + adminUserJWT);

    expect(res2.statusCode).toEqual(200);

    // check if the comment is deleted from the database
    let deletedComment = await Comment.findById(createdCommentId);
    expect(deletedComment).toBeNull();
  });
});
