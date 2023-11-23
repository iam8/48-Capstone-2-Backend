"use strict";

const request = require("supertest");

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
