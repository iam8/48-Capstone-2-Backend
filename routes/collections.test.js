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
    tokens
} = require("./_testCommon");


beforeAll(commonBeforeAllAlt);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for POST /collections --------------------------------------------------------------------
describe("POST /collections - add new collection for current user", () => {
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
describe("POST /collections/[id]/colors - add new color to given collection", () => {
    const urlTemp = "/collections/%d/colors";

    test("Returns correct data for logged-in admin", async () => {
        const id = userData[1].collections[0].id;
        const colorHex = "123456";
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({colorHex})
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            collectionId: id,
            colorHex
        });
    })

    test("Returns correct data for non-admin collection owner", async () => {
        const id = userData[1].collections[0].id;
        const colorHex = "123456";
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({colorHex})
            .set("authorization", `Bearer ${tokens[1]}`);

        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            collectionId: id,
            colorHex
        });
    })

    test("Unauthorized (code 401) for logged-in, non-owner of collection", async () => {
        const id = userData[0].collections[0].id;
        const colorHex = "123456";
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({colorHex})
            .set("authorization", `Bearer ${tokens[2]}`);

        expect(resp.statusCode).toBe(401);
    })

    test("Unauthorized (code 401) for logged-out user", async () => {
        const id = userData[0].collections[0].id;
        const colorHex = "123456";
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({colorHex});

        expect(resp.statusCode).toBe(401);
    })

    test("Not found (code 404) for nonexistent collection ID", async () => {
        const id = 0;
        const colorHex = "123456";
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({colorHex});

        expect(resp.statusCode).toBe(401);
    })

    test("Bad request (code 400) for duplicate color", async () => {
        const coll = userData[0].collections[0];
        const colorHex = coll.colors[0];
        const url = util.format(urlTemp, coll.id);

        const resp = await request(app)
            .post(url)
            .send({colorHex})
            .set("authorization", `Bearer ${tokens[0]}`);;

        expect(resp.statusCode).toBe(400);
    })

    test("Bad request (code 400) for missing request data", async () => {
        const id = userData[0].collections[0].id;
        const url = util.format(urlTemp, id);

        const resp = await request(app)
            .post(url)
            .send({})
            .set("authorization", `Bearer ${tokens[0]}`);;

        expect(resp.statusCode).toBe(400);
    })

    test.each(
        ["123", "1234567", true]
    )("Bad request (code 400) for invalid hex input: %s", async (badHex) => {
        expect.assertions(1);

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
describe("DELETE /collections/[id]/colors/[hex] - remove given color from given collection", () => {
    const urlTemp = "/collections/%d/colors/%s";

    test("Returns correct data for logged-in admin", async () => {
        const coll = userData[1].collections[0];
        const colorHex = coll.colors[0];
        const url = util.format(urlTemp, coll.id, colorHex);

        const resp = await request(app)
            .delete(url)
            .set("authorization", `Bearer ${tokens[0]}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            deleted: {
                collectionId: coll.id,
                colorHex
            }
        });
    })

    // test("Returns correct data for non-admin, collection owner", async () => {

    // })

    // test("Unauthorized (code 400) for logged-in, non-owner of collection", async () => {

    // })

    // test("Unauthorized (code 401) for logged-out user", async () => {

    // })

    // test("Not found (code 404) for nonexistent collection-color associations", async () => {

    // })
})
//-------------------------------------------------------------------------------------------------


// Tests for GET /collections/[id] ----------------------------------------------------------------
// describe("GET /collections/[id] - get data on a single given collection", () => {
//     const urlTemp = "/collections/%d";

//     test("Returns correct data for logged-in admin", async () => {

//     })

//     test("Returns correct data for non-admin, collection owner", async () => {

//     })

//     test("Unauthorized (code 400) for logged-in, non-owner of collection", async () => {

//     })

//     test("Unauthorized (code 401) for logged-out user", async () => {

//     })

//     test("Not found (code 404) for nonexistent collection ID", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for GET /collections ---------------------------------------------------------------------
// describe("GET /collections - get data on all collections", () => {
//     test("Returns correct data for logged-in admin", async () => {

//     })

//     test("Returns correct result when no collections exist", async () => {

//     })

//     test("Unauthorized (code 401) for non-admin", async () => {

//     })

//     test("Unauthorized (code 401) for logged-out user", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for GET /collections/users/[username] ----------------------------------------------------
// describe("GET /collections/users/[username] - get collection data for a given user", () => {
//     const urlTemp = "/collections/users/%s";

//     test("Returns correct data for logged-in admin", async () => {

//     })

//     test("Returns correct data for non-admin, corresponding user", async () => {

//     })

//     test("Unauthorized (code 400) for logged-in, non-owner of collection", async () => {

//     })

//     test("Unauthorized (code 400) for logged-out user", async () => {

//     })

//     test("Returns correct result when user has no collections", async () => {

//     })

//     test("Not found (code 404) for nonexistent username", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for PATCH /collections/[id] --------------------------------------------------------------
// describe("PATCH /collections/[id] - update a given collection", () => {
//     const urlTemp = "/collections/%d";

//     test("Returns correct data for logged-in admin", async () => {

//     })

//     test("Returns correct data for non-admin, collection owner", async () => {

//     })

//     test("Unauthorized (code 400) for logged-in, non-owner of collection", async () => {

//     })

//     test("Unauthorized (code 400) for logged-out user", async () => {

//     })

//     test("Not found (code 404) for nonexistent collection ID", async () => {

//     })

//     test("Bad request (code 400) for missing request data", async () => {

//     })

//     test.each()("", (badTitle) => {

//     })
// })
//-------------------------------------------------------------------------------------------------


// Tests for DELETE /collections/[id] -------------------------------------------------------------
// describe("DELETE /collections/[id] - delete a given collection", () => {
//     const urlTemp = "/collections/%d";

//     test("Returns correct data for admin", async () => {

//     })

//     test("Returns correct data for non-admin collection owner", async () => {

//     })

//     test("Unauthorized (code 400) for logged-in, non-owner of collection", async () => {

//     })

//     test("Unauthorized (code 400) for logged-out user", async () => {

//     })

//     test("Not found (code 404) for nonexistent collection ID", async () => {

//     })
// })
//-------------------------------------------------------------------------------------------------
