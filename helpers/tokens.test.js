"use strict";


const {verify} = require("jsonwebtoken");
const {createToken} = require("./tokens");
const {SECRET_KEY} = require("../config");

// Practicing mocking
jest.mock("../config", () => ({
    SECRET_KEY: "test-key-value"
}));


describe("Tests for createToken", () => {
    const adminData = {username: "testadmin", isAdmin: true};
    const userData = {username: "testuser", isAdmin: false};

    test("Token has correct data for non-admin", () => {
        const token = createToken(userData);
        const payload = verify(token, SECRET_KEY);

        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "testuser",
            isAdmin: false
        });
    });

    test("Token has correct data for admin", () => {
        const token = createToken(adminData);
        const payload = verify(token, SECRET_KEY);

        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "testadmin",
            isAdmin: true
        });
    });

    test("Token has correct data (defaults) when no isAdmin property is passed in", () => {
        const token = createToken({username: "no-admin-prop"});
        const payload = verify(token, SECRET_KEY);

        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "no-admin-prop",
            isAdmin: false
        });
    });
});
