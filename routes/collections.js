/** Routes for collections.
 *
 * Base URL: /collections
 */

const express = require("express");

const Collection = require("../models/collection");
const {
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUserOrAdmin,
    ensureAdminOrCollectionOwner
} = require("../middleware/auth");

const { validateJson } = require("../helpers/jsonValidation");
const collNewSchema = require("../schemas/collNewSchema.json");
const collAddColorSchema = require("../schemas/collAddColorSchema.json");
const collRenameSchema = require("../schemas/collRenameSchema.json");

const router = new express.Router();


/** POST / - create new collection for the current user.
 *
 * Accepts data: `{ title }`, where `title` is the name of the new collection.
 *
 * Returns: `{collection: {id, title, username}}` for the created collection.
 *
 * Authorization required: logged in
 */
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        validateJson(req.body, collNewSchema);

        const { username } = res.locals.user;
        const { title } = req.body;

        const collection = await Collection.create({title, username});
        return res.status(201).json({collection});
    } catch(err) {
        return next(err);
    }
})


/** POST /[id]/colors - add a color to a collection with the ID specified in URL.
 *
 * Accepts data: `{colorHex}`, where `colorHex` is the 6-character hex representation for a new
 * color.
 *
 * Returns: `{collectionId, colorHex}`.
 *
 * Authorization required: logged in & admin or collection owner
 */
router.post(
    "/:id/colors",
    ensureLoggedIn,
    ensureAdminOrCollectionOwner,
    async (req, res, next) => {
        try {
            validateJson(req.body, collAddColorSchema);

            const { id } = req.params;
            const {colorHex} = req.body;

            const addRes = await Collection.addColor(id, colorHex);
            return res.status(201).json({
                collectionId: addRes.id,
                colorHex: addRes.colorHex
            });

        } catch(err) {
            return next(err);
        }
    }
)


/** DELETE /[id]/colors/[hex] - remove a color from a collection with collection ID and color hex
 * value specified in URL.
 *
 * Returns: `{deleted: {collectionId, colorHex}}`.
 *
 * Authorization required: logged in & admin or collection owner
 */
router.delete(
    "/:id/colors/:hex",
    ensureLoggedIn,
    ensureAdminOrCollectionOwner,
    async (req, res, next) => {
        try {
            const { id, hex } = req.params;
            const deleteRes = await Collection.removeColor(id, hex);
            const {id: collectionId, colorHex} = deleteRes.deleted;

            return res.json({
                deleted: {collectionId, colorHex}
            });

        } catch(err) {
            return next(err);
        }
    }
)


/** GET /[id] - get info on a collection by ID specified in URL.
 *
 * Returns: `{collection: {id, title, username, colors}}`.
 *
 * Authorization required: logged in & admin or collection owner
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
 * Returns: `{collections: [{id, title, username}, ...]}`.
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


/** GET /users/[username] - get all collections by the username specified in URL.
 *
 * Returns: `{collections: [{id, title, username}, ...]}`.
 *
 * Authorization required: admin or user corresponding to given username
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


/** PATCH /[id] - rename a collection by ID specified in URL.
 *
 * Accepts data: `{newTitle}`, where `newTitle` is the updated title.
 *
 * Returns: `{updated: {id, title, username}}`.
 *
 * Authorization required: logged in & admin or collection owner
 */
router.patch("/:id", ensureLoggedIn, ensureAdminOrCollectionOwner, async (req, res, next) => {
    try {
        validateJson(req.body, collRenameSchema);

        const { id } = req.params;
        const {newTitle} = req.body;

        const updated = await Collection.rename(id, newTitle);
        return res.json({updated});
    } catch(err) {
        return next(err);
    }
})


/** DELETE /[id] - delete a collection by ID specified in URL.
 *
 * Returns: `{deleted: {id}}`.
 *
 * Authorization required: logged in & admin or collection owner
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
