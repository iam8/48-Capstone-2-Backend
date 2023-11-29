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

})
//-------------------------------------------------------------------------------------------------


// Tests for GET /users ---------------------------------------------------------------------------
describe("GET /users - get data on all users", () => {

})
//-------------------------------------------------------------------------------------------------


// Tests for GET /users/[username] ----------------------------------------------------------------
describe("GET /users/[username] - get data on given user", () => {

})
//-------------------------------------------------------------------------------------------------


// Tests for PATCH /users/[username] --------------------------------------------------------------
describe("PATCH /users/[username] - update data on given user", () => {

})
//-------------------------------------------------------------------------------------------------


// Tests for DELETE /users/[username] -------------------------------------------------------------
describe("DELETE /users/[username] - delete given user", () => {

})
//-------------------------------------------------------------------------------------------------
