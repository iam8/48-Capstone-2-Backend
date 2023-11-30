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
describe("GET /users - get data on all users", () => {
    const url = "/users";

    test("Returns correct data for admin", async () => {
        const users = userData.map((user) => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin
        }));

        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({users});
    })

    test("Returns correct result if no users exist", async () => {
        await db.query(`DELETE FROM users`);

        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({users: []});
    })

    test("Unauthorized (code 401) for non-admin", async () => {
        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorized (code 401) for logged-out user", async () => {
        const resp = await request(app)
            .get(url);

        expect(resp.statusCode).toBe(401);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for GET /users/[username] ----------------------------------------------------------------
describe("GET /users/[username] - get data on given user", () => {
    const urlTemp = "/users/%s";

    test("Returns correct data for admin", async () => {
        const user = userData[0];
        const colls = user.collections.map((coll) => ({
            id: coll.id,
            title: coll.title
        }));
        const url = util.format(urlTemp, user.username);

        const expected = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            collections: colls
        };

        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            user: expected
        });
    })

    test("Returns correct data for non-admin corresponding user", async () => {
        const user = userData[1];
        const colls = user.collections.map((coll) => ({
            id: coll.id,
            title: coll.title
        }));
        const url = util.format(urlTemp, user.username);

        const expected = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            collections: colls
        };

        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            user: expected
        });
    })

    test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {
        const user = userData[0];
        const url = util.format(urlTemp, user.username);

        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorized (code 401) for logged-out user", async () => {
        const user = userData[0];
        const url = util.format(urlTemp, user.username);

        const resp = await request(app)
            .get(url);

        expect(resp.statusCode).toBe(401);
    })

    test("Not found (code 404) for nonexistent username", async () => {
        const url = util.format(urlTemp, "nonexistent");
        const resp = await request(app)
            .get(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(404);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for PATCH /users/[username] --------------------------------------------------------------
// describe("PATCH /users/[username] - update data on given user", () => {
    // test("Returns correct data for admin", async () => {

    // })

    // test("Returns correct data for non-admin corresponding user", async () => {

    // })

    // test("Returns correct data when some data fields are missing", async () => {

    // })

    // test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

    // })

    // test("Unauthorized (code 401) for logged-out user", async () => {

    // })

    // test("Not found (code 404) for nonexistent username", async () => {

    // })

    // test("Bad request (code 400) when no data fields are passed in", async () => {

    // })

    // test("Bad request (code 400) for invalid request data types", async () => {

    // })
// })
//-------------------------------------------------------------------------------------------------


// Tests for DELETE /users/[username] -------------------------------------------------------------
describe("DELETE /users/[username] - delete given user", () => {
    const urlTemp = "/users/%s";

    test("Returns correct data for admin", async () => {
        const username = userData[1].username;
        const url = util.format(urlTemp, username);

        const resp = await request(app)
            .delete(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({deleted: username});
    })

    test("Returns correct data for non-admin corresponding user", async () => {
        const username = userData[1].username;
        const url = util.format(urlTemp, username);

        const resp = await request(app)
            .delete(url)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({deleted: username});
    })

    test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {
        const username = userData[0].username;
        const url = util.format(urlTemp, username);

        const resp = await request(app)
            .delete(url)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorized (code 401) for logged-out user", async () => {
        const username = userData[0].username;
        const url = util.format(urlTemp, username);

        const resp = await request(app)
            .delete(url);

        expect(resp.statusCode).toBe(401);
    })

    test("Not found (code 404) for nonexistent username", async () => {
        const url = util.format(urlTemp, "nonexistent");

        const resp = await request(app)
            .delete(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(404);
    })
})
//-------------------------------------------------------------------------------------------------
