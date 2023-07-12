const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const { describe, afterAll, it, expect } = require("@jest/globals");

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
    expect(response.body.data.databaseName).toBe("PawsReunite_Test");
    expect(response.body.data.databaseModels).toStrictEqual(["Role", "User", "Post", "Comment"]);
  });
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
