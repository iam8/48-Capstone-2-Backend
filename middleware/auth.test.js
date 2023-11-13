"use strict";

/** Tests for authentication middleware. */

const jwt = require("jsonwebtoken");

const {UnauthorizedError} = require("../expressError");
const db = require("../colors-db");
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUserOrAdmin,
    ensureAdminOrCollectionOwner
} = require("./auth");

const {SECRET_KEY} = require("../config");
const testJwt = jwt.sign({username: "testuser", isAdmin: false}, SECRET_KEY);
const badJwt = jwt.sign({username: "badtestuser", isAdmin: false}, "wrong-key");

const testUsernames = [];
const testCollIds = [];


beforeAll(async () => {
    await db.query("DELETE FROM users");

    // Add test users
    const resultUsers = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, is_admin)
        VALUES
            ('testuser', 'password1', 'FN1', 'LN1', false),
            ('testadmin', 'password2', 'FN2', 'LN2', true)
        RETURNING username`);

    testUsernames.push(...resultUsers.rows.map(entry => entry.username));

    // Add test collections
    const resultColls = await db.query(`
        INSERT INTO collections (title, creator_username)
        VALUES
            ('coll1', 'testuser'),
            ('coll2', 'testadmin')
        RETURNING id`);

    testCollIds.push(...resultColls.rows.map(entry => entry.id));
});



describe("Tests for authenticateJWT", () => {
    test("Works: valid token in header", () => {
        expect.assertions(2);

        const req = {headers: {authorization: `Bearer ${testJwt}`}};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals.user).toEqual({
            iat: expect.any(Number),
            username: "testuser",
            isAdmin: false
        });
    });

    test("Works: no headers", () => {
        expect.assertions(2);

        const req = {};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("Works: invalid token in header", () => {
        expect.assertions(2);

        const req = {headers: {authorization: `Bearer ${badJwt}`}};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});


describe("Tests for ensureLoggedIn", () => {
    test("Authorization if user is logged in (no error thrown)", () => {
        expect.assertions(1);

        const req = {};
        const res = {locals: {user: {username: "testuser", isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        ensureLoggedIn(req, res, next);
    });

    test("Unauthorization if user is not logged in (error thrown)", () => {
        expect.assertions(1);

        const req = {};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        ensureLoggedIn(req, res, next);
    });
});


describe("Tests for ensureAdmin", () => {
    test("Authorization if admin (no error thrown)", () => {
        expect.assertions(1);

        const req = {};
        const res = {locals: {user: {username: "testadmin", isAdmin: true}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        ensureAdmin(req, res, next);
    });

    test("Unauthorization if not admin (error thrown)", () => {
        expect.assertions(1);

        const req = {};
        const res = {locals: {user: {username: "testuser", isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        ensureAdmin(req, res, next);
    });

    test("Unauthorization if user is not logged in (error thrown)", () => {
        expect.assertions(1);

        const req = {};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        ensureAdmin(req, res, next);
    });
});


describe("Tests for ensureCorrectUserOrAdmin", () => {
    test("Authorization if correct user and admin (no error thrown)", () => {
        expect.assertions(1);

        const req = {params: {username: "testadmin"}};
        const res = {locals: {user: {username: "testadmin", isAdmin: true}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        ensureCorrectUserOrAdmin(req, res, next);
    });

    test("Authorization if incorrect user and admin (no error thrown)", () => {
        expect.assertions(1);

        const req = {params: {username: "testadmin1"}};
        const res = {locals: {user: {username: "testadmin2", isAdmin: true}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        ensureCorrectUserOrAdmin(req, res, next);
    });

    test("Authorization if correct user and not admin (no error thrown)", () => {
        expect.assertions(1);

        const req = {params: {username: "testuser"}};
        const res = {locals: {user: {username: "testuser", isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        ensureCorrectUserOrAdmin(req, res, next);
    });

    test("Unauthorization if incorrect user and not admin (error thrown)", () => {
        expect.assertions(1);

        const req = {params: {username: "testuser1"}};
        const res = {locals: {user: {username: "testuser2", isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        ensureCorrectUserOrAdmin(req, res, next);
    });

    test("Unauthorization if user is not logged in (error thrown)", () => {
        expect.assertions(1);

        const req = {params: {username: "testuser"}};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        ensureCorrectUserOrAdmin(req, res, next);
    });
});


describe("Tests for ensureAdminOrCollectionOwner", () => {
    test("Authorization if user is admin and collection owner", async () => {
        expect.assertions(1);

        const req = {params: {id: testCollIds[1]}};
        const res = {locals: {user: {username: testUsernames[1], isAdmin: true}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        await ensureAdminOrCollectionOwner(req, res, next);
    });

    test("Authorization if user is admin and not collection owner", async () => {
        const req = {params: {id: testCollIds[1]}};
        const res = {locals: {user: {username: testUsernames[0], isAdmin: true}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        await ensureAdminOrCollectionOwner(req, res, next);
    });

    test("Authorization if user is not admin and is collection owner", async () => {
        expect.assertions(1);

        const req = {params: {id: testCollIds[0]}};
        const res = {locals: {user: {username: testUsernames[0], isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        await ensureAdminOrCollectionOwner(req, res, next);
    });

    test("Unauthorization if user is not admin and not collection owner", async () => {
        expect.assertions(1);

        const req = {params: {id: testCollIds[1]}};
        const res = {locals: {user: {username: testUsernames[0], isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        await ensureAdminOrCollectionOwner(req, res, next);
    });

    test("Unauthorization if user is not logged in", async () => {
        expect.assertions(1);

        const req = {params: {id: testCollIds[0]}};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeInstanceOf(UnauthorizedError);
        };

        await ensureAdminOrCollectionOwner(req, res, next);
    });
});


afterAll(async () => {
    await db.query("DELETE FROM users");
    await db.end();
});
