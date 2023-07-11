const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const { describe, afterAll, it, expect } = require("@jest/globals");

describe("Home page route exists.", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });
  it("Server responds can be viewed.", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});
