"use strict";

const db = require("../colors-db");
const User = require("./user");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const {
    // commonBeforeAll,
    commonBeforeAllAlt,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    // usernames,
    // collIds,
    userData,
    passwords
} = require("./_testCommon");


// beforeAll(commonBeforeAll);
beforeAll(commonBeforeAllAlt);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for authenticate() -----------------------------------------------------------------------
describe("authenticate()", () => {
    test ("Retrieves data for existing user", async () => {
        const result = await User.authenticate(userData[0].username, passwords[0]);

        const {username, firstName, lastName, isAdmin} = userData[0];
        expect(result).toEqual({username, firstName, lastName, isAdmin});
    })

    test("Throws UnauthorizedError for existing user + wrong password", async () => {
        expect.assertions(1);

        try {
            await User.authenticate(userData[0].username, "wrong-password");
        } catch(err) {
            expect(err).toBeInstanceOf(UnauthorizedError);
        }
    })

    test("Throws UnauthorizedError for nonexistent user", async () => {
        expect.assertions(1);

        try {
            await User.authenticate("nonexistent", passwords[0]);
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
            username: userData[0].username,
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
            [userData[0].username]
        );

        expect(dbResult.rows).toHaveLength(1);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for findAll() ----------------------------------------------------------------------------
describe("findAll()", () => {
    test("Successfully returns all user data", async () => {
        const result = await User.findAll();
        const expected = [];

        for (let user of userData) {
            const {username, firstName, lastName, isAdmin} = user;
            expected.push({username, firstName, lastName, isAdmin});
        }

        expect(result).toEqual(expected);
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
        const result = await User.get(userData[0].username);

        const {username, firstName, lastName, isAdmin} = userData[0];
        const collections = userData[0].collections.map(coll => {
            const {id, title} = coll;
            return {id, title};
        });

        expect(result).toEqual({username, firstName, lastName, isAdmin, collections});
    })

    test("Gets appropriate data on existing user with no associated collections", async () => {
        const result = await User.get(userData[2].username);

        const {username, firstName, lastName, isAdmin} = userData[2];
        expect(result).toEqual({username, firstName, lastName, isAdmin, collections: []});
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
describe("update()", () => {
    test("Successfully performs full update of an existing user", async () => {
        const data = {
            firstName: "newFN0",
            lastName: "newLN0",
            password: "newPassword0",
            isAdmin: false
        };

        const {username} = userData[0];

        const upResult = await User.update(username, data);
        expect(upResult).toEqual({
            username,
            firstName: data.firstName,
            lastName: data.lastName,
            isAdmin: data.isAdmin
        });

        const dbResult = await db.query(`
            SELECT * FROM users WHERE username = $1`,
            [username]);

        const dbUser = dbResult.rows[0];
        expect(dbUser).toEqual({
            username,
            password: expect.any(String),
            first_name: data.firstName,
            last_name: data.lastName,
            is_admin: data.isAdmin
        });

        expect(dbUser.password.startsWith("$2b$")).toBe(true);
    })

    test("Successfully performs partial update of an existing user", async () => {
        const data = {
            firstName: "newFN1",
        };

        const {
            username,
            lastName: origLastName,
            isAdmin: origisAdmin
        } = userData[0];

        const upResult = await User.update(username, data);
        expect(upResult).toEqual({
            username,
            firstName: data.firstName,
            lastName: origLastName,
            isAdmin: origisAdmin
        });

        const dbResult = await db.query(`
            SELECT * FROM users WHERE username = $1`,
            [username]);

        const dbUser = dbResult.rows[0];
        expect(dbUser).toEqual({
            username,
            password: expect.any(String),
            first_name: data.firstName,
            last_name: origLastName,
            is_admin: origisAdmin
        });

        expect(dbUser.password.startsWith("$2b$")).toBe(true);
    })

    test("Throws BadRequestError if no update data is included", async () => {
        expect.assertions(1);

        try {
            await User.update(userData[0].username, {});
        } catch(err) {
            expect(err).toBeInstanceOf(BadRequestError);
        }
    })

    test("Throws NotFoundError for a nonexistent user", async () => {
        expect.assertions(1);

        try {
            await User.update("nonexistent", {isAdmin: true});
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for remove() -----------------------------------------------------------------------------
describe("remove()", () => {
    test("Successfully removes user from database", async () => {
        await User.remove(userData[0].username);

        const dbResult = await db.query(`
            SELECT * FROM users WHERE username = $1`,
            [userData[0].username]);

        expect(dbResult.rows).toHaveLength(0);
    })

    test("Throws NotFoundError for a nonexistent user", async () => {
        expect.assertions(1);

        try {
            await User.remove("nonexistent");
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------
