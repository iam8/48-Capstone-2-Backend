"use strict";

/** Routes for collections.
 *
 * Base URL: /collections
 */

const express = require("express");

const Collection = require("../models/collection");
const {UnauthorizedError} = require("../expressError");
const {ensureLoggedIn, ensureAdmin, ensureCorrectUserOrAdmin} = require("../middleware/auth");

const router = new express.Router();


// Collections routes (collections.js)
//     > POST / - create new collection for current user (DONE)
//     > POST /[id] - add color to collection of current user
//     > DELETE /[id]/[hex] - remove a color from a collection of current user
//     > GET /[id] - get info on a collection by ID, of current user
//     > GET / - get all collections
//     > GET /[username] - get all collections by a user
//     > PATCH /[id] - rename a collection of current user
//     > DELETE /[id] - delete a collection of current user

// TODO: implement check that a collection with a given ID belongs to the current user (or user is
// admin)

/** Ensure that a retrieved collection belongs to the current user (i.e. the username associated
 * with the collection matches the username of the currently-logged-in user) */


/** POST / - create new collection for the current user.
 *
 * Accepts data: { title }, where 'title' is the name of the new collection.
 *
 * Returns: {collection: {id, title, username}} for the created collection.
 *
 * Authorization required: logged in
 */
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const { username } = res.locals.user;
        const { title } = req.body;

        const collection = await Collection.create({title, username});
        return res.json({collection});
    } catch(err) {
        return next(err);
    }
})


/**
 * Add a color to a collection.
 */
router.post("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
    } catch(err) {
        return next(err);
    }
})


/**
 * Remove a color from a collection.
 */
router.delete("/:id/:hex", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id, hex } = req.params;
    } catch(err) {
        return next(err);
    }
})


/** GET /[id] - get info on a collection by the current user, by ID.
 *
 * Returns: {collection: {id, title, username, colors}}.
 *
 * Authorization required: logged in, and current user must be owner of the collection or an admin.
 */
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const collection = await Collection.getSingle(id);

        // Check that user is the collection owner
        // TODO: put this code in a helper function
        const { username, isAdmin } = res.locals.user;
        if (!isAdmin && collection.username !== username) {
            throw new UnauthorizedError("Unauthorized: current user does not own this collection");
        }

        return res.json({collection});
    } catch(err) {
        return next(err);
    }
})


/**
 * Get all collections.
 */
router.get("/", ensureAdmin, async (req, res, next) => {
    try {
        true;
    } catch(err) {
        return next(err);
    }
})


/**
 * Get all collections by a user.
 */
router.get("/:username", ensureCorrectUserOrAdmin, async(req, res, next) => {
    try {
        const { username } = req.params;
    } catch(err) {
        return next(err);
    }
})


/**
 * Rename a collection.
 */
router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
    } catch(err) {
        return next(err);
    }
})


/**
 * Delete a collection.
 */
router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
    } catch(err) {
        return next(err);
    }
})
































module.exports = router;
