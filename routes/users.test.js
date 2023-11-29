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

//-------------------------------------------------------------------------------------------------


// Tests for GET /users ---------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for GET /users/[username] ----------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for PATCH /users/[username] --------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for DELETE /users/[username] -------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
