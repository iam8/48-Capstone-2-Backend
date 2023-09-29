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
//     > POST /[username] - create new collection for a user
//     > POST /[id] - add color to collection
//     > DELETE /[id]/[hex] - remove a color from a collection
//     > GET /[id] - get info on a collection by ID
//     > GET / - get all collections
//     > GET /[username] - get all collections by a user
//     > PATCH /[id] - rename a collection
//     > DELETE /[id] - delete a collection

// TODO: implement check that a collection with a given ID belongs to the current user (or user is
// admin)

/** Ensure that a retrieved collection belongs to the current user (i.e. the username associated
 * with the collection matches the username of the currently-logged-in user) */


/**
 * Create new collection for a user.
 */
router.post("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
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


/**
 * Get info on a collection.
 */
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
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
