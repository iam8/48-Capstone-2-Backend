"use strict";

const db = require("../colors-db");
const {NotFoundError, BadRequestError} = require("../expressError");


/** Related functions for color collections. */
class Collection {

    /**
     * Create a color collection, update database, and return new collection data.
     *
     * Accepts data: `{title, username}`.
     *
     * Returns: `{id, title, username}`.
     *
     * Throws `NotFoundError` if user not found.
     */
    static async create({title, username}) {

        // Check that username exists
        const userRes = await db.query(`
            SELECT username FROM users
            WHERE username = $1`,
            [username]
        );

        if (!userRes.rows[0]) {
            throw new NotFoundError(`No user: ${username}`);
        }

        // Insert collection
        const collRes = await db.query(`
            INSERT INTO collections
                (title, creator_username)
            VALUES
                ($1, $2)
            RETURNING id, title, creator_username AS "username"`,
            [title, username]
        );

        return collRes.rows[0];
    }

    /**
     * Get all data on a single collection by ID.
     *
     * Returns: `{id, title, username, colors}`, where `colors` is a list of color hex values in
     * this collection.
     *
     * Throws `NotFoundError` if no collection with the given ID exists.
     */
    static async getSingle(id) {
        const result = await db.query(`
            SELECT id, title, creator_username AS "username", color_hex as "colorHex"
            FROM collections
                LEFT JOIN collections_colors
                ON collections.id = collections_colors.collection_id
            WHERE id = $1`,
            [id]
        );

        const row0 = result.rows[0];

        if (!row0) {
            throw new NotFoundError(`No collection: ${id}`);
        }

        // Put together final result
        const {title, username} = row0;
        const colors = row0.colorHex ?
            result.rows.map(row => row.colorHex) : [];

        return {id, title, username, colors};
    }

    /**
     * Get list of data on every collection by a given user (by username).
     *
     * Returns: `[{id, title, username}, ...]`.
     *
     * Throws `NotFoundError` if user is not found.
     */
    static async getAllByUser(username) {

        // Check that username exists
        const userRes = await db.query(`
            SELECT username FROM users
            WHERE username = $1`,
            [username]
        );

        if (!userRes.rows[0]) {
            throw new NotFoundError(`No user: ${username}`);
        }

        const result = await db.query(`
            SELECT id, title, creator_username AS "username"
            FROM collections
            WHERE creator_username = $1`,
            [username]
        );

        return result.rows;
    }

    /**
     * Get list of data on all collections.
     *
     * Returns: `[{id, title, username}, ...]`.
     */
    static async getAll() {
        const result = await db.query(`
            SELECT id, title, creator_username AS "username"
            FROM collections`
        );

        return result.rows;
    }

    /**
     * Rename a given collection.
     *
     * Accepts a collection ID and a new collection title.
     *
     * Returns: `{id, title, username}`, where `title` is the updated title.
     *
     * Throws `NotFoundError` if no collection with the given ID exists.
     */
    static async rename(id, newTitle) {
        const result = await db.query(`
            UPDATE collections
            SET title = $1
            WHERE id = $2
            RETURNING id, title, creator_username AS "username"`,
            [newTitle, id]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(`No collection: ${id}`);
        }

        return result.rows[0];
    }

    /**
     * Add a new color to a collection.
     *
     * Accepts a collection ID and a 6-digit hex representation of a color.
     *
     * Returns: `{id, colorHex}`.
     *
     * Throws `NotFoundError` if no collection with the given ID exists.
     *
     * Throws `BadRequestError` if the given color already exists in the collection.
     */
    static async addColor(id, colorHex) {

        // Check that collection exists
        const collRes = await db.query(`
            SELECT id FROM collections
            WHERE id = $1`,
            [id]
        );

        if (!collRes.rows[0]) {
            throw new NotFoundError(`No collection: ${id}`);
        }

        // Check that color doesn't exist in collection
        const duplicateCheck = await db.query(
            `SELECT color_hex
                FROM collections_colors
                WHERE collection_id = $1
                AND color_hex = $2`,
            [id, colorHex],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate color: ${colorHex}`);
        }

        // Insert color into collection
        const result = await db.query(`
            INSERT INTO collections_colors
                (collection_id, color_hex)
            VALUES
                ($1, $2)
            RETURNING collection_id AS "id", color_hex AS "colorHex"`,
            [id, colorHex]
        );

        return result.rows[0];
    }

    /**
     * Remove a color from a collection.
     *
     * Accepts a collection ID and a 6-digit hex representation of a color.
     *
     * Returns: `{deleted: {id, colorHex}}`.
     *
     * Throws `NotFoundError` if the given collection-color association doesn't exist.
     */
    static async removeColor(id, colorHex) {

        const result = await db.query(`
            DELETE FROM collections_colors
            WHERE collection_id = $1
            AND color_hex = $2
            RETURNING collection_id AS "id", color_hex AS "colorHex"`,
            [id, colorHex]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(
                `No collection with ID of ${id} and color ${colorHex}`);
        }

        return {"deleted": {id, colorHex}};
    }

    /**
     * Remove a collection by ID.
     *
     * Returns: `{deleted: {id}}`.
     *
     * Throws `NotFoundError` if no collection with the given ID exists.
     */
    static async remove(id) {
        const result = await db.query(`
            DELETE FROM collections
            WHERE id = $1
            RETURNING id`,
            [id]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(`No collection: ${id}`);
        }

        return {"deleted": {id}};
    }
}


module.exports = Collection;
