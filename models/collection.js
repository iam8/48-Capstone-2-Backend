"use strict";

const db = require("../colors-db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");


/** Related functions for color collections. */
class Collection {
    /**
     * Create a color collection, update database, and return new collection data.
     */
    static async create({title, username, colorList=[]}) {

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
        const result = await db.query(`
            INSERT INTO collections (title, creator_username)
            VALUES ($1, $2)
            RETURNING id, title, creator_username AS "username"`,
            [title, username]
        );

        return result.rows[0];
    }

    /**
     * Get all data on a single collection by ID.
     */
    static async getSingle(id) {
        const result = await db.query(`
            SELECT id, title, creator_username AS "username"
            FROM collections
            WHERE id = $1`,
            [id]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(`No collection: ${id}`);
        }

        return result.rows[0];
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

    }

    /**
     * Remove a color from a collection.
     */
    static async removeColor({collectionId, colorHex}) {

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

        return {"deleted": id};
    }
}


module.exports = Collection;
