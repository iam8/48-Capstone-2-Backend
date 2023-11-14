"use strict";

const db = require("../colors-db");
const User = require("./user");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    usernames,
    collIds
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for authenticate() -----------------------------------------------------------------------
describe("authenticate()", () => {
    test ("Retrieves data for existing user", async () => {
        const result = await User.authenticate(usernames[0], "password1");
        expect(result).toEqual({
            username: "u1",
            firstName: "FN1",
            lastName: "LN1",
            isAdmin: true
        });
    })

    test("Throws UnauthorizedError for existing user + wrong password", async () => {
        expect.assertions(1);

        try {
            await User.authenticate(usernames[0], "wrong-password");
        } catch(err) {
            expect(err).toBeInstanceOf(UnauthorizedError);
        }
    })

    test("Throws UnauthorizedError for nonexistent user", async () => {
        expect.assertions(1);

        try {
            await User.authenticate("nonexistent", "password1");
        } catch(err) {
            expect(err).toBeInstanceOf(UnauthorizedError);
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for register() ---------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for findAll() ----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for get() --------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for update() -----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for remove() -----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
