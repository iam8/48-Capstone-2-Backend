"use strict";

/** Tests for custom express error classes. */

const {
    ExpressError,
    NotFoundError,
    UnauthorizedError,
    BadRequestError,
    ForbiddenError} = require("./expressError");


const expressErr = new ExpressError("ExpressError msg", 100);
const notFoundErr = new NotFoundError("NotFoundError msg", 200);
const unauthErr = new UnauthorizedError("UnauthorizedError msg", 300);
const badReqErr = new BadRequestError("BadRequestError msg", 400);
const forbiddenErr = new ForbiddenError("ForbiddenError msg", 500);

const errTable = [[expressErr], [notFoundErr], [unauthErr], [badReqErr], [forbiddenErr]];

describe("Instance classes and properties", () => {
    test.each(errTable)(
        "Test input %# is an instance of base Error class: %p",
        (errObj) => {
            expect(errObj).toBeInstanceOf(Error)
        }
    );
})

// describe("ExpressError tests", () => {

// })

// describe("ExpressError tests", () => {

// })

// describe("ExpressError tests", () => {

// })

// describe("ExpressError tests", () => {

// })
