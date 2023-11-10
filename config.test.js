"use strict";

/** Unit tests for configuration file. */


describe("Config can come from env (environment)", () => {
    test("Works", () => {
        process.env.SECRET_KEY = "abcdefg";
        process.env.HOSTNAME = "0.0.0.0";
        process.env.PORT = "5000";
        process.env.DATABASE_URL = "other";
        process.env.NODE_ENV = "other";

        const config = require("./config");
        expect(config.SECRET_KEY).toEqual("abcdefg");
        expect(config.HOSTNAME).toEqual("0.0.0.0");
        expect(config.PORT).toEqual(5000);
        expect(config.getDatabaseUri()).toEqual("other");
        expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

        delete process.env.SECRET_KEY;
        delete process.env.HOSTNAME;
        delete process.env.PORT;
        delete process.env.DATABASE_URL;
        expect(config.getDatabaseUri()).toEqual("postgres:///colors");

        process.env.NODE_ENV = "test";
        expect(config.getDatabaseUri()).toEqual("postgres:///colors_test");
    });
})
