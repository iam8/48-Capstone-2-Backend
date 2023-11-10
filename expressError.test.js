"use strict";

/** Tests for custom express error classes. */

const {
    ExpressError,
    NotFoundError,
    UnauthorizedError,
    BadRequestError,
    ForbiddenError} = require("./expressError");


describe("ExpressError tests", () => {
    const expressErr = new ExpressError("Custom error message", 501);

    test("Is an instance of base Error class", () => {
        expect(expressErr).toBeInstanceOf(Error);
    })
})

// describe("ExpressError tests", () => {

// })

// describe("ExpressError tests", () => {

// })

// describe("ExpressError tests", () => {

// })

// describe("ExpressError tests", () => {

// })
