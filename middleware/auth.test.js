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

    // test("Works: no header", () => {

    // });

    // test("Works: invalid token in header", () => {

    // });
});


// describe("Tests for ensureLoggedIn", () => {

// })


// describe("Tests for ensureAdmin", () => {

// })


// describe("Tests for ensureCorrectUserOrAdmin", () => {

// })


afterAll(() => {
    db.end();
});
