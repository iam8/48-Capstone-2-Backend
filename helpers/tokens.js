
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/**
 * Return signed JWT from user data.
 *
 * Accepts: `{username, isAdmin}`.
 * */
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
