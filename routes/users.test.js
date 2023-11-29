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
    test("Returns correct data for admin", async () => {

    })

    test("Unauthorized (code 401) for non-admin", async () => {

    })

    test("Unauthorized (code 401) for logged-out user", async () => {

    })

    test("Bad request (code 400) for adding duplicate user", async () => {

    })

    test("Bad request (code 400) for missing request data", async () => {

    })

    test("Bad request (code 400) for invalid request data types", async () => {

    })
})
//-------------------------------------------------------------------------------------------------


// Tests for GET /users ---------------------------------------------------------------------------
describe("GET /users - get data on all users", () => {
    test("Returns correct data for admin", async () => {

    })

    test("Returns correct result if no users exist", async () => {

    })
})
//-------------------------------------------------------------------------------------------------


// Tests for GET /users/[username] ----------------------------------------------------------------
describe("GET /users/[username] - get data on given user", () => {
    test("Returns correct data for admin", async () => {

    })

    test("Returns correct data for non-admin corresponding user", async () => {

    })

    test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

    })

    test("Unauthorized (code 401) for logged-out user", async () => {

    })

    test("Not found (code 404) for nonexistent username", async () => {

    })
})
//-------------------------------------------------------------------------------------------------


// Tests for PATCH /users/[username] --------------------------------------------------------------
describe("PATCH /users/[username] - update data on given user", () => {
    test("Returns correct data for admin", async () => {

    })

    test("Returns correct data for non-admin corresponding user", async () => {

    })

    test("Returns correct data when some data fields are missing", async () => {

    })

    test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

    })

    test("Unauthorized (code 401) for logged-out user", async () => {

    })

    test("Not found (code 404) for nonexistent username", async () => {

    })

    test("Bad request (code 400) when no data fields are passed in", async () => {

    })

    test("Bad request (code 400) for invalid request data types", async () => {

    })
})
//-------------------------------------------------------------------------------------------------


// Tests for DELETE /users/[username] -------------------------------------------------------------
describe("DELETE /users/[username] - delete given user", () => {
    test("Returns correct data for admin", async () => {

    })

    test("Returns correct data for non-admin corresponding user", async () => {

    })

    test("Unauthorized (code 401) for non-admin non-corresponding user", async () => {

    })

    test("Unauthorized (code 401) for logged-out user", async () => {

    })

    test("Not found (code 404) for nonexistent username", async () => {

    })
})
//-------------------------------------------------------------------------------------------------
