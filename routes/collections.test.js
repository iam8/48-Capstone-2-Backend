"use strict";

const request = require("supertest");
const util = require('node:util');

const app = require("../app");
const {
    commonBeforeAllAlt,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    userData,
    passwords,
    tokens
} = require("./_testCommon");


beforeAll(commonBeforeAllAlt);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for POST /collections --------------------------------------------------------------------
describe("POST /collections", () => {
    const url = "/collections";

    test("Returns correct data for logged-in, non-admin", async () => {
        const data = {
            title: "New Collection"
        };

        const resp = await request(app)
            .post(url)
            .send(data)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            collection: {
                id: expect.any(Number),
                title: data.title,
                username: userData[1].username
            }
        });
    })

    test("Returns correct data for logged-in admin", async () => {
        const data = {
            title: "New Collection"
        };

        const resp = await request(app)
            .post(url)
            .send (data)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            collection: {
                id: expect.any(Number),
                title: data.title,
                username: userData[0].username
            }
        });
    })

    test("Unauthorization (code 401) for logged-out user", async () => {
        const data = {
            title: "New Collection"
        };

        const resp = await request(app).post(url).send(data);
        expect(resp.statusCode).toBe(401);
    })

    test("Bad request (code 400) for missing request data", async () => {
        const data = {};

        const resp = await request(app)
            .post(url)
            .send(data)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for invalid request data type", async () => {
        const data = {
            title: true
        };

        const resp = await request(app)
            .post(url)
            .send(data)
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(400);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for POST /collections/[id]/colors --------------------------------------------------------
describe("POST /collections/[id]/colors", () => {
    const urlTemp = "/collections/%d/colors";

    // test("Returns correct data for logged-in admin", async () => {

    // })

    // test("Returns correct data for corresponding user (owner of collection)", async () => {

    // })

    // test("Unauthorized (code 401) for logged-out user", async () => {

    // })

    // test("Not found (code 404) for nonexistent collection ID", async () => {

    // })

    // test("Bad request (code 400) for missing or invalid request data", async () => {
    //     const badData = ["123", "1234567", true];
    // })

    test.each(
        ["123", "1234567", true]
    )("Bad request (code 400) for invalid hex input: %s", async (badHex) => {
        const id = userData[0].collections[0].id;
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({colorHex: badHex})
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(400);
    })

})
//-------------------------------------------------------------------------------------------------


// Tests for DELETE /collections/[id]/colors/[hex] ------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for GET /collections/[id] ----------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for GET /collections ---------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for GET /collections/users/[username] ----------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for PATCH /collections/[id] --------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for DELETE /collections/[id] -------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
