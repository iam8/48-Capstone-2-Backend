/** Helpers for creating and handling JSON web tokens for authentication. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/**
 * Return signed JWT from user data.
 *
 * @param {object} user User data: `{username, isAdmin}`
 * @returns {string} The signed JWT
 */
function createToken(user) {
    console.assert(user.isAdmin !== undefined,
        "createToken passed user without isAdmin property");

    let payload = {
        username: user.username,
        isAdmin: user.isAdmin || false,
    };

    return jwt.sign(payload, SECRET_KEY);
}


module.exports = { createToken };
