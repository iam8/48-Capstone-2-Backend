/** Color collection model. */

const db = require("../colors-db");
const {NotFoundError, BadRequestError} = require("../expressError");


/** Related functions for color collections. */
class Collection {

    /**
     * Create a color collection, update database, and return new collection data.
     *
     * @param {object} data - Collection data
     * @param {string} data.title Collection title
     * @param {string} data.username Username of user that will own this collection
     * @returns {Promise<object>} `{id, title, username}` for the created collection, if successful
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
     * @param {number} id Target collection ID
     * @returns {Promise<object>} `{id, title, username, colors}`, where `colors` is a list of color hex
     * values in this collection.
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

        return {id: row0.id, title, username, colors};
    }

    /**
     * Get list of data on all collections by a given user.
     *
     * @param {string} username Target user's username
     * @returns {Promise<object []>} List of collection data: `[{id, title, username}, ...]`.
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
     * @returns {Promise<object []>} List of collection data: `[{id, title, username}, ...]`.
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
     * @param {number} id Target collection ID
     * @param {string} newTitle New collection title
     * @returns {Promise<object>} `{id, title, username}`, where `title` is the updated title.
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
     * @param {number} id Target collection ID
     * @param {string} colorHex 6-character hex representation of the new color
     * @returns {Promise<object>} `{id, colorHex}` upon success
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
     * @param {number} id Target collection ID
     * @param {string} colorHex 6-character hex representation of the target color
     * @returns {Promise<object>} `{deleted: {id, colorHex}}` upon success
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

        return {"deleted": result.rows[0]};
    }

    /**
     * Remove a collection by ID.
     *
     * @param {number} id Target collection ID
     * @returns {Promise<object>} `{deleted: {id}}` upon success
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

        return {"deleted": result.rows[0]};
    }
}


module.exports = Collection;
