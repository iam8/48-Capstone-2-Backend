"use strict";

/** Shared config for application. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const HOSTNAME = "127.0.0.1";
const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or production database
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "postgres:///colors_test"
        : process.env.DATABASE_URL || "postgres:///colors";
}

// Speed up bcrypt during tests
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Colors Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
    SECRET_KEY,
    HOSTNAME,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
};
