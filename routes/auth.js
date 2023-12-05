"use strict";

/** Routes for authentication.
 *
 * Base URL: /auth
 */

const express = require("express");

const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const { validateJson } = require("../helpers/jsonValidation");
const authTokenSchema = require("../schemas/authTokenSchema.json");
const authRegisterSchema = require("../schemas/authRegisterSchema.json");

const router = new express.Router();


/** POST /token: `{username, password}` => `{ token }`
 *
 * Returned `token` is a JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/token", async function (req, res, next) {
    try {
        validateJson(req.body, authTokenSchema);

        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});


/** POST /register: `{username, password, firstName, lastName}` => `{ token }`
 *
 * Returned `token` is a JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/register", async function (req, res, next) {
    try {
        validateJson(req.body, authRegisterSchema);

        const newUser = await User.register({ ...req.body, isAdmin: false });
        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
