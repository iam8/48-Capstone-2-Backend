"use strict";

/** Routes for collections.
 *
 * Base URL: /collections
 */

const express = require("express");
const jsonschema = require("jsonschema");

const Collection = require("../models/collection");
const {
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUserOrAdmin,
    ensureAdminOrCollectionOwner
} = require("../middleware/auth");

const {BadRequestError} = require("../expressError");
const collNewSchema = require("../schemas/collNewSchema.json");
const collAddColorSchema = require("../schemas/collAddColorSchema.json");
const collRenameSchema = require("../schemas/collRenameSchema.json");

const router = new express.Router();


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
        const validator = jsonschema.validate(req.body, collNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { username } = res.locals.user;
        const { title } = req.body;

        const collection = await Collection.create({title, username});
        return res.status(201).json({collection});
    } catch(err) {
        return next(err);
    }
})


/** POST /[id]/colors - add a color to a collection.
 *
 * Accepts data: {colorHex}, where colorHex is the 6-character hex representation for a new color.
 *
 * Returns: {collectionId, colorHex}.
 *
 * Authorization required: logged in, and current user must be owner of the collection or an admin.
 */
router.post(
    "/:id/colors",
    ensureLoggedIn,
    ensureAdminOrCollectionOwner,
    async (req, res, next) => {
        try {
            const validator = jsonschema.validate(req.body, collAddColorSchema);
            if (!validator.valid) {
                const errs = validator.errors.map(e => e.stack);
                throw new BadRequestError(errs);
            }

            const { id: collectionId } = req.params;
            const {colorHex} = req.body;

            const addResult = await Collection.addColor({collectionId, colorHex});
            return res.status(201).json(addResult);
        } catch(err) {
            return next(err);
        }
    }
)


/** DELETE /[id]/colors/[hex] - remove a color from a collection.
 *
 * Returns: {deleted: {collectionId, colorHex}}.
 *
 * Authorization required: logged in, and current user must be owner of the collection or an admin.
 */
router.delete(
    "/:id/colors/:hex",
    ensureLoggedIn,
    ensureAdminOrCollectionOwner,
    async (req, res, next) => {
        try {
            const { id: collectionId, hex: colorHex } = req.params;

            const deleteRes = await Collection.removeColor({collectionId, colorHex});
            return res.json(deleteRes);
        } catch(err) {
            return next(err);
        }
    }
)


/** GET /[id] - get info on a collection by ID.
 *
 * Returns: {collection: {id, title, username, colors}}.
 *
 * Authorization required: logged in, and current user must be owner of the collection or an admin.
 */
router.get("/:id", ensureLoggedIn, ensureAdminOrCollectionOwner, async (req, res, next) => {
    try {
        const { id } = req.params;

        const collection = await Collection.getSingle(id);
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
router.patch("/:id", ensureLoggedIn, ensureAdminOrCollectionOwner, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, collRenameSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { id } = req.params;
        const {newTitle} = req.body;

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
router.delete("/:id", ensureLoggedIn, ensureAdminOrCollectionOwner, async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleteRes = await Collection.remove(id);
        return res.json(deleteRes);
    } catch(err) {
        return next(err);
    }
})


module.exports = router;
