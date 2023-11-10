"use strict";

const request = require("supertest");

const app = require("./app");
const db = require("./colors-db");


test("Not found for site 404", async () => {
    const resp = await request(app).get("/no-such-path");
    expect(resp.status).toEqual(404);
});


test("Not found for site 404 (test stack print)", async () => {
    process.env.NODE_ENV = "";
    const resp = await request(app).get("/no-such-path");
    expect(resp.status).toEqual(404);
    delete process.env.NODE_ENV;
});


afterAll(() => {
    db.end();
});
