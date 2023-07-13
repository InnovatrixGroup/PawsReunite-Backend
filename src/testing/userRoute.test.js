/**
 To run the test:
 1. 'npm run start-test' to start the test server
 2. set 'NODE_ENV=test, WIPE=true' in .env file
 3. 'node src/seeds.js' to seed the database
 4. 'npm run test' to run the test
 */
const request = require("supertest");
const mongoose = require("mongoose");
const { hashPassword } = require("../services/auth_services");
const { app } = require("../server");
const { User } = require("../models/UserModel");
const { Role } = require("../models/RoleModel");
const { describe, beforeAll, afterAll, it, expect } = require("@jest/globals");

const databaseURL = "mongodb://127.0.0.1:27017/PawsReunite_Test";

let regularUserJWTtoken;
let regularUserId;
let adminUserJWTtoken;
let adminUserId;

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(databaseURL, {});

  // set up an admin user
  let password = await hashPassword("123456aB!");
  const adminUser = new User({
    username: "admin",
    email: "admin@test.com",
    password: password
  });
  await adminUser.save();
  adminUserId = adminUser._id;
  let adminRole = await Role.findOne({ name: "admin" });
  await User.findByIdAndUpdate(adminUser._id, { roleId: adminRole._id });

  // admin user log in to get JWT
  const res = await request(app).post("/users/signin").send({
    email: adminUser.email,
    password: "123456aB!"
  });
  adminUserJWTtoken = res.body.JWTtoken;
});

afterAll(async () => {
  await User.findByIdAndDelete(adminUserId);
  await mongoose.connection.close();
});

// test signup route
describe("User signup", () => {
  it("User can signup successfully if providing correct info", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "tester1",
      email: "tester1@test.com",
      password: "123456aB!"
    });
    regularUserJWTtoken = res.body.JWTtoken;

    // check if user is created successfully
    regularUserId = res.body.userId;
    let user = await User.findById(res.body.userId);
    let userRole = await Role.findById(user.roleId);
    expect(user).not.toBeNull();
    expect(userRole.name).toBe("regular");

    // signup success should return 200 and a JWT token
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("JWTtoken");
  });

  it("User cannot signup successfully if providing an invalid email", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "tester2",
      email: "tester2.com",
      password: "123456aB!"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("User cannot signup successfully if providing an invalid password", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "tester3",
      email: "tester3@test.com",
      password: "123456a"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("User cannot signup successfully if providing an existing email", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "tester4",
      email: "tester1@test.com",
      password: "123456aB!"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("User cannot signup successfully if providing an existing username", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "tester1",
      email: "tester5@test.com",
      password: "123456aB!"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("User cannot signup successfully if not providing email", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "tester6",
      password: "123456aB!"
    });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});

// test signin route
describe("User signin", () => {
  it("User can sign in successfully if providing correct info", async () => {
    const res = await request(app).post("/users/signin").send({
      email: "tester1@test.com",
      password: "123456aB!"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("JWTtoken");
  });

  it("User cannot sign in successfully if providing incorrect info", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "tester1@test.com",
      password: "123456aB"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

// test user edit profile route
describe("User edit profile", () => {
  it("User can edit profile successfully if providing correct info", async () => {
    const res = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + regularUserJWTtoken)
      .send({
        email: "tester1@test.com",
        password: "123456aBC!"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("newJWT");
  });

  it("User cannot edit profile successfully if updating to an existing email address", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "admin@test.com"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

// test get all user route
describe("Get all users", () => {
  it("Admin user can view all account details", async () => {
    const res = await request(app)
      .get("/users/all")
      .set("Authorization", "Bearer " + adminUserJWTtoken);

    expect(res.statusCode).toBe(200);
  });

  it("Non-admin user cannot view all account details", async () => {
    const res = await request(app)
      .get("/users/all")
      .set("Authorization", "Bearer " + regularUserJWTtoken);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

// test get user details route
describe("Get user details", () => {
  it("A user can view personal account details given the user has been authenticated", async () => {
    const res = await request(app)
      .get(`/users/${regularUserId}`)
      .set("Authorization", "Bearer " + regularUserJWTtoken);

    expect(res.body).toHaveProperty("username");
    expect(res.body).toHaveProperty("email");
  });

  it("A user can view personal account details given the user has been authenticated", async () => {
    const res = await request(app)
      .get(`/users/${adminUserId}`)
      .set("Authorization", "Bearer " + regularUserJWTtoken);

    expect(res.statusCode).toBe(401);
  });
});

// test delete user route
describe("delete user", () => {
  it("Non-admin user cannot delete account", async () => {
    const res = await request(app)
      .delete(`/users/${adminUserId}`)
      .set("Authorization", "Bearer " + regularUserJWTtoken);

    expect(res.statusCode).toBe(400);
  });

  it("Admin user can delete account", async () => {
    const res = await request(app)
      .delete(`/users/${regularUserId}`)
      .set("Authorization", "Bearer " + adminUserJWTtoken);

    let user = await User.findById(regularUserId);
    expect(res.statusCode).toBe(200);
    expect(user).toBeNull();
  });
});
