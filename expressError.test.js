"use strict";

/** Tests for custom express error classes. */

const {
    ExpressError,
    NotFoundError,
    UnauthorizedError,
    BadRequestError,
    ForbiddenError} = require("./expressError");


const expressErr = new ExpressError("ExpressError msg", 100);
const notFoundErr = new NotFoundError("NotFoundError msg");
const unauthErr = new UnauthorizedError("UnauthorizedError msg");
const badReqErr = new BadRequestError("BadRequestError msg");
const forbiddenErr = new ForbiddenError("ForbiddenError msg");

const errTable = [[expressErr], [notFoundErr], [unauthErr], [badReqErr], [forbiddenErr]];


describe("Error object instance classes", () => {
    test.each(errTable)(
        "Test input %# is an instance of base Error class: %p",
        (errObj) => {
            expect(errObj).toBeInstanceOf(Error)
        }
    );
})


describe("Error object properties", () => {
    test("ExpressError has expected message and status properties", () => {
        expect(expressErr.message).toBe("ExpressError msg");
        expect(expressErr.status).toBe(100);
    });

    test("NotFoundError has expected message and status properties", () => {
        expect(notFoundErr.message).toBe("NotFoundError msg");
        expect(notFoundErr.status).toBe(404);
    });

    test("UnauthorizedError has expected message and status properties", () => {
        expect(unauthErr.message).toBe("UnauthorizedError msg");
        expect(unauthErr.status).toBe(401);
    });

    test("BadRequestError has expected message and status properties", () => {
        expect(badReqErr.message).toBe("BadRequestError msg");
        expect(badReqErr.status).toBe(400);
    });

    test("ForbiddenError has expected message and status properties", () => {
        expect(forbiddenErr.message).toBe("ForbiddenError msg");
        expect(forbiddenErr.status).toBe(403);
    });
})


describe("Error object default message property", () => {
    const notFoundDefault = new NotFoundError();
    const unauthDefault = new UnauthorizedError();
    const badReqDefault = new BadRequestError();
    const forbiddenDefault = new ForbiddenError();

    test("NotFoundError has expected default message", () => {
        expect(notFoundDefault.message).toBe("Not Found");
    });

    test("UnauthorizedError has expected default message", () => {
        expect(unauthDefault.message).toBe("Unauthorized");
    });

    test("BadRequestError has expected default message", () => {
        expect(badReqDefault.message).toBe("Bad Request");
    });

    test("ForbiddenError has expected default message", () => {
        expect(forbiddenDefault.message).toBe("Forbidden");
    });
})
