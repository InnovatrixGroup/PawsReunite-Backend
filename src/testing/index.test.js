const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const { describe, afterAll, it, expect, beforeAll } = require("@jest/globals");
const databaseURL = "mongodb://127.0.0.1:27017/PawsReunite_Test";

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(databaseURL, {});
});

describe("Home page route exists.", () => {
  it("Server responds can be viewed.", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBe("Welcome to PawsReunite");
  });
});

describe("Database connected...", () => {
  it("Server responds with database information.", async () => {
    const response = await request(app).get("/databaseHealth");
    expect(response.statusCode).toBe(200);
    const databaseInfo = response.body.data;
    expect(databaseInfo.databaseName).toBe("PawsReunite_Test");
    expect(databaseInfo.databaseModels).toStrictEqual(["Role", "User", "Post", "Comment"]);
    // increase the timeout to 10 seconds, because it takes time to connect to the database and retrieve the information
    // cause sometimes it takes more than 5 seconds to connect to the database
  }, 10000);
});

describe("Invalid routes...", () => {
  it("Server responds with error message.", async () => {
    const response = await request(app).get("/xxxxxxx");
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Invalid Route");
  });
});

// Close the database connection after all tests are done.
afterAll(async () => {
  await mongoose.connection.close();
});
