"use strict";

const request = require("supertest");
const util = require('node:util');

const db = require("../colors-db");
const app = require("../app");
const {
    commonBeforeAllAlt,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    userData,
    tokens,
    passwords
} = require("./_testCommon");


beforeAll(commonBeforeAllAlt);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for POST /users --------------------------------------------------------------------------
describe("POST /users - add a new user", () => {
    const url = "/users";
    const newValidUser = {
        username: "NewUser77",
        password: "password77",
        firstName: "NewFN77",
        lastName: "NewLN77",
        isAdmin: false
    };

    test("Returns correct data for admin", async () => {
        const userRes = {...newValidUser};
        delete userRes.password;

        const resp = await request(app)
            .post(url)
            .send(newValidUser)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            user: userRes,
            token: expect.any(String)
        });
    })

    test("Unauthorized (code 401) for non-admin", async () => {
        const resp = await request(app)
            .post(url)
            .send(newValidUser)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorized (code 401) for logged-out user", async () => {
        const resp = await request(app)
            .post(url)
            .send(newValidUser);

        expect(resp.statusCode).toBe(401);
    })

    test("Bad request (code 400) for adding duplicate user", async () => {
        const dupUser = {
            username: userData[0].username,
            password: "password77",
            firstName: "NewFN77",
            lastName: "NewLN77",
            isAdmin: false
        };

        const resp = await request(app)
            .post(url)
            .send(dupUser)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for missing request data", async () => {
        const badData = {
            username: "NewUser77",
            password: "password77"
        };

        const resp = await request(app)
            .post(url)
            .send(badData)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for invalid request data types", async () => {
        const badData = {
            username: "NewUser77",
            password: 0,
            firstName: 1,
            lastName: true,
            isAdmin: "true"
        };

        const resp = await request(app)
            .post(url)
            .send(badData)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(400);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for GET /users ---------------------------------------------------------------------------
// describe("GET /users - get data on all users", () => {
//     test("Returns correct data for admin", async () => {

//     })

//     test("Returns correct result if no users exist", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for GET /users/[username] ----------------------------------------------------------------
// describe("GET /users/[username] - get data on given user", () => {
//     test("Returns correct data for admin", async () => {

//     })

//     test("Returns correct data for non-admin corresponding user", async () => {

//     })

//     test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

//     })

//     test("Unauthorized (code 401) for logged-out user", async () => {

//     })

//     test("Not found (code 404) for nonexistent username", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for PATCH /users/[username] --------------------------------------------------------------
// describe("PATCH /users/[username] - update data on given user", () => {
//     test("Returns correct data for admin", async () => {

//     })

//     test("Returns correct data for non-admin corresponding user", async () => {

//     })

//     test("Returns correct data when some data fields are missing", async () => {

//     })

//     test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

//     })

//     test("Unauthorized (code 401) for logged-out user", async () => {

//     })

//     test("Not found (code 404) for nonexistent username", async () => {

//     })

//     test("Bad request (code 400) when no data fields are passed in", async () => {

//     })

//     test("Bad request (code 400) for invalid request data types", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for DELETE /users/[username] -------------------------------------------------------------
// describe("DELETE /users/[username] - delete given user", () => {
//     test("Returns correct data for admin", async () => {

//     })

//     test("Returns correct data for non-admin corresponding user", async () => {

//     })

//     test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

//     })

//     test("Unauthorized (code 401) for logged-out user", async () => {

//     })

//     test("Not found (code 404) for nonexistent username", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------
