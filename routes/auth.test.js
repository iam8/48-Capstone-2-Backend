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
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: userData[0].username,
                password: passwords[0]
            });

        expect(resp.body).toEqual({
            token: expect.any(String)
        });
    })

    test("Unauthorization (code 401) for nonexistent username", async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "nonexistent",
                password: passwords[0]
            });

        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorization (code 401) for wrong password", async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: userData[0].username,
                password: "wrong-password"
            });

        expect(resp.statusCode).toBe(401);
    })

    test("Bad request (code 400) for missing request data", async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: userData[0].username
            });

        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for invalid request data types", async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: 13,
                password: true
            });

        expect(resp.statusCode).toBe(400);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for POST /auth/register ------------------------------------------------------------------
describe("POST /auth/register", () => {
    const url = "/auth/register";

    test("Returns correct data for valid non-admin user", async () => {
        const data = {
            username: "non-admin",
            password: "password",
            firstName: "NonAdminFN",
            lastName: "NonAdminLN"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            token: expect.any(String)
        });
    })

    // test("Returns correct data for valid admin user", async () => {

    // })

    // test("Bad request (code 400) for duplicate user", async () => {

    // })

    // test("Bad request (code 400) for missing request data", async () => {

    // })

    // test("Bad request (code 400) for invalid request data types", async () => {

    // })
})
//-------------------------------------------------------------------------------------------------
