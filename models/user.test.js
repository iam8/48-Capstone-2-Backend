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
describe("register()", () => {
    test("Returns correct user data and adds correct user data to database", async () => {
        const newUser = {
            username: "newUser",
            firstName: "FIRST",
            lastName: "LAST",
            isAdmin: false
        };

        const regResult = await User.register({...newUser, password: "newPassword"});
        expect(regResult).toEqual(newUser);

        const dbResult = await db.query(`SELECT * FROM users WHERE username = 'newUser'`);
        const dbUser = dbResult.rows[0];
        expect(dbResult.rows).toHaveLength(1);
        expect(dbUser.password.startsWith("$2b$")).toBe(true);
        expect(dbUser.is_admin).toBe(false);
    })

    test("Returns correct admin data and adds correct admin data to database", async () => {
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

    test("Throws BadRequestError on duplicate username", async () => {
        expect.assertions(2);

        const dupUser = {
            username: usernames[0],
            firstName: "FIRST",
            lastName: "LAST",
            isAdmin: false
        };

        try {
            await User.register({...dupUser, password: "newPassword"});
        } catch(err) {
            expect(err).toBeInstanceOf(BadRequestError);
        }

        const dbResult = await db.query(`
            SELECT * FROM users WHERE username = $1`,
            [usernames[0]]
        );

        expect(dbResult.rows).toHaveLength(1);
    })
})

//-------------------------------------------------------------------------------------------------


// Tests for findAll() ----------------------------------------------------------------------------
describe("findAll()", () => {
    test("Successfully returns all user data", async () => {
        const result = await User.findAll();
        expect(result).toEqual([
            {
                username: "u1",
                firstName: "FN1",
                lastName: "LN1",
                isAdmin: true
            },
            {
                username: "u2",
                firstName: "FN2",
                lastName: "LN2",
                isAdmin: false
            },
            {
                username: "u3",
                firstName: "FN3",
                lastName: "LN3",
                isAdmin: false
            }
        ]);
    })

    test("Returns empty array if no users exist", async () => {
        await db.query(`DELETE FROM users`);

        const result = await User.findAll();
        expect(result).toEqual([]);
    })
})

//-------------------------------------------------------------------------------------------------


// Tests for get() --------------------------------------------------------------------------------
describe("get()", () => {
    test("Gets appropriate data on existing user with associated collections", async () => {
        const result = await User.get(usernames[0]);
        expect(result).toEqual({
            username: usernames[0],
            firstName: "FN1",
            lastName: "LN1",
            isAdmin: true,
            collections: [
                {
                    id: collIds[0],
                    title: "coll-u1-1"
                },
                {
                    id: collIds[1],
                    title: "coll-u1-2"
                },
                {
                    id: collIds[2],
                    title: "coll-u1-3"
                }
            ]
        });
    })

    test("Gets appropriate data on existing user with no associated collections", async () => {
        const result = await User.get(usernames[2]);
        expect(result).toEqual({
            username: usernames[2],
            firstName: "FN3",
            lastName: "LN3",
            isAdmin: false,
            collections: []
        });
    })

    test("Throws NotFoundError for nonexistent user", async () => {
        expect.assertions(1);

        try {
            await User.get("nonexistent");
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})

//-------------------------------------------------------------------------------------------------


// Tests for update() -----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------


// Tests for remove() -----------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
