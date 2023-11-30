"use strict";

/** Routes for users.
 *
 * Base URL: /users
*/

const express = require("express");

const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

const { validateJson } = require("../helpers/jsonValidation");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user } => {user: { username, firstName, lastName, isAdmin }, token }, where token is
 * a newly created authentication token.
 *
 * Add a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * Accepts user data: { username, password, firstName, lastName, isAdmin }.
 *
 * Authorization required: admin
 **/
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        validateJson(req.body, userNewSchema);

        const user = await User.register(req.body);
        const token = createToken(user);
        return res.status(201).json({ user, token });
    } catch (err) {
        return next(err);
    }
});


/** GET / => { users: [ {username, firstName, lastName, isAdmin }, ... ] }
 *
 * Return list of all users.
 *
 * Authorization required: admin
 **/
router.get("/", ensureAdmin, async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});


/** GET /[username] => { user: { username, firstName, lastName, isAdmin, collections }},
 *  where collections is { id, title }.
 *
 * Authorization required: admin or same user-as-:username
 **/
router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[username] { user } => { user: { username, firstName, lastName, isAdmin }}.
 *
 * Update a user's data.
 *
 * User data can include (all optional): { firstName, lastName, password, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        validateJson(req.body, userUpdateSchema);

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /[username] => { deleted: username }
 *
 * Remove a user.
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
