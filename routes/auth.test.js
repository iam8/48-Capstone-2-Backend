"use strict";

const request = require("supertest");

const app = require("../app");
const {
    // commonBeforeAll,
    commonBeforeAllAlt,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    // usernames,
    // collIds,
    userData,
    passwords
} = require("./_testCommon");


beforeAll(commonBeforeAllAlt);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for POST /auth/token ---------------------------------------------------------------------
describe("POST /auth/token", () => {
    const url = "/auth/token";

    test("Returns correct JSON for valid username + password", async () => {
        const data = {
            username: userData[0].username,
            password: passwords[0]
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.body).toEqual({
            token: expect.any(String)
        });
    })

    test("Unauthorization (code 401) for nonexistent username", async () => {
        const data = {
            username: "nonexistent",
            password: passwords[0]
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorization (code 401) for wrong password", async () => {
        const data = {
            username: userData[0].username,
            password: "wrong-password"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(401);
    })

    test("Bad request (code 400) for missing request data", async () => {
        const data = {
            username: userData[0].username
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for invalid request data types", async () => {
        const data = {
            username: 13,
            password: true
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(400);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for POST /auth/register ------------------------------------------------------------------
describe("POST /auth/register", () => {
    const url = "/auth/register";

    test("Returns correct data for valid user", async () => {
        const data = {
            username: "newUser",
            password: "password",
            firstName: "First",
            lastName: "Last"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            token: expect.any(String)
        });
    })

    test("Bad request (code 400) for duplicate user", async () => {
        const data = {
            username: userData[0].username,
            password: "password",
            firstName: "first",
            lastName: "last"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for missing request data", async () => {
        const data = {
            username: "newUser",
            password: "password"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for invalid request data types", async () => {
        const data = {
            username: 13,
            password: true,
            firstName: false,
            lastName: "Ok data type"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(400);
    })
})
//-------------------------------------------------------------------------------------------------
