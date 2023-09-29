"use strict";

const db = require("../colors-db");
const {NotFoundError} = require("../expressError");


/** Related functions for color collections. */
class Collection {

    /**
     * Create a color collection, update database, and return new collection data.
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
     */
    static async getSingle(id) {
        const result = await db.query(`
            SELECT id, title, creator_username AS "username", color_hex as "colorHex"
            FROM collections
                JOIN collections_colors
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
        const colors = result.rows.map(row => row.colorHex);

        return {id, title, username, colors};
    }

    /**
     * Get data on all collections by a given user.
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
     * Get data on all collections.
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
     */
    static async rename({id, newTitle}) {
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
     */
    static async addColor({collectionId, colorHex}) {

        // Check that collection exists
        const collRes = await db.query(`
            SELECT id FROM collections
            WHERE id = $1`,
            [collectionId]
        );

        if (!collRes.rows[0]) {
            throw new NotFoundError(`No collection: ${collectionId}`);
        }

        // Insert color into collection
        const result = await db.query(`
            INSERT INTO collections_colors
                (collection_id, color_hex)
            VALUES
                ($1, $2)
            RETURNING collection_id AS "collectionId", color_hex AS "colorHex"`,
            [collectionId, colorHex]
        );

        return result.rows[0];
    }

    /**
     * Remove a color from a collection.
     */
    static async removeColor({collectionId, colorHex}) {

        const result = await db.query(`
            DELETE FROM collections_colors
            WHERE collection_id = $1
            AND color_hex = $2
            RETURNING collection_id AS "collectionId", color_hex AS "colorHex"`,
            [collectionId, colorHex]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(
                `No collection with ID of ${collectionId} and color ${colorHex}`);
        }

        return {"deleted": {collectionId, colorHex}};
    }

    /**
     * Remove a collection by ID.
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
