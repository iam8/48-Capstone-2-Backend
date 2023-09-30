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
//     > GET /[id] - get info on a collection by ID, of current user (DONE)
//     > GET / - get all collections (DONE)
//     > GET /users/[username] - get all collections by a user (DONE)
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
        return res.status(201).json({collection});
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


/** GET /[id] - get info on a collection by ID.
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


/** GET / - get all collections.
 *
 * Returns: {collections: [{id, title, username}]}.
 *
 * Authorization required: admin
 */
router.get("/", ensureAdmin, async (req, res, next) => {
    try {
        const collections = await Collection.getAll();
        return res.json({collections});
    } catch(err) {
        return next(err);
    }
})


/** GET /users/[username] - get all collections by a user.
 *
 * Returns: {collections: [id, title, username]}.
 *
 * Authorization required: admin or corresponding user (to given username)
 */
router.get("/users/:username", ensureCorrectUserOrAdmin, async(req, res, next) => {
    try {
        const { username } = req.params;
        const collections = await Collection.getAllByUser(username);
        return res.json({collections});
    } catch(err) {
        return next(err);
    }
})


/** PATCH /[id] - rename a collection by ID.
 *
 * Accepts data: {newTitle}.
 *
 * Returns: {updated: {id, title, username}}.
 *
 * Authorization required: logged in, and current user must be owner of the collection or an admin.
 */
router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const {newTitle} = req.body;

        // Check that user is the collection owner
        // TODO: put this code in a helper function
        const collection = await Collection.getSingle(id);
        const { username, isAdmin } = res.locals.user;
        if (!isAdmin && collection.username !== username) {
            throw new UnauthorizedError("Unauthorized: current user does not own this collection");
        }

        const updated = await Collection.rename({id, newTitle});
        return res.json({updated});
    } catch(err) {
        return next(err);
    }
})


/** DELETE /[id] - delete a collection by ID.
 *
 * Returns: {deleted: {id}}.
 *
 * Authorization required: logged in, and current user must be owner of the collection or an admin.
 */
router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check that user is the collection owner
        // TODO: put this code in a helper function
        const collection = await Collection.getSingle(id);
        const { username, isAdmin } = res.locals.user;
        if (!isAdmin && collection.username !== username) {
            throw new UnauthorizedError("Unauthorized: current user does not own this collection");
        }

        const deleteRes = await Collection.remove(id);
        return res.json(deleteRes);
    } catch(err) {
        return next(err);
    }
})
































module.exports = router;
