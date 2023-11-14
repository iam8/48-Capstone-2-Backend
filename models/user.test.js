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
describe("Tests for register()", () => {
    test("Returns correct user data and adds correct user data to database", async () => {
        const newAdmin = {
            username: "newAdmin",
            firstName: "ADMINFIRST",
            lastName: "ADMINLAST",
            isAdmin: true
        };

        const regResult = await User.register({...newAdmin, password: "newPassword"});
        expect(regResult).toEqual(newAdmin);

        const dbResult = await db.query(`SELECT * FROM users WHERE username = 'newAdmin'`);
        const dbUser = dbResult.rows[0];
        expect(dbResult.rows).toHaveLength(1);
        expect(dbUser.password.startsWith("$2b$")).toBe(true);
        expect(dbUser.is_admin).toBe(true);
    })

    // test("New user defaults to non-admin", async () => {

    // })

    // test("Throws BadRequestError on duplicate username", async () => {

    // })
})

//-------------------------------------------------------------------------------------------------


// Tests for findAll() ----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for get() --------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for update() -----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for remove() -----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
