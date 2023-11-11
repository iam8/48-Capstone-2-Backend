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
    test("No error is thrown if user is logged in", () => {
        expect.assertions(2);

        const req = {headers: {authorization: `Bearer ${testJwt}`}};
        const res = {locals: {user: {username: "testuser", isAdmin: false}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };

        const result = ensureLoggedIn(req, res, next);
        expect(result).not.toBeDefined();
    });


});


// describe("Tests for ensureAdmin", () => {

// })


// describe("Tests for ensureCorrectUserOrAdmin", () => {

// })


afterAll(() => {
    db.end();
});
