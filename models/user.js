/** User model. */

const bcrypt = require("bcrypt");

const db = require("../colors-db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");


/** Related functions for users. */
class User {

    /**
     * Authenticate user with username, password.
     *
     * @param {string} username Username
     * @param {string} password Password
     * @returns {Promise<object>} `{username, firstName, lastName, isAdmin}` for authenticated user
     *
     * Throws `UnauthorizedError` is user not found or password is wrong.
     **/
    static async authenticate(username, password) {
        // Try to find the user first
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            // Compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /**
     * Register new user.
     *
     * @param {object} data User data
     * @param {string} data.username
     * @param {string} data.password
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {boolean} data.isAdmin
     * @returns {Promise<object>} `{username, firstName, lastName, isAdmin}` for user after
     * registration
     *
     * Throws `BadRequestError` on duplicate usernames.
     **/
    static async register({ username, password, firstName, lastName, isAdmin }) {
        const duplicateCheck = await db.query(
            `SELECT username
                FROM users
                WHERE username = $1`,
            [username],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
                (username,
                password,
                first_name,
                last_name,
                is_admin)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING username, first_name AS "firstName", last_name AS "lastName",
                is_admin AS "isAdmin"`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                isAdmin,
            ],
        );

        const user = result.rows[0];
        return user;
    }

    /**
     * Find all users, sorted by username (ascending).
     *
     * @returns {Promise<object []>} list of data on all users: `[{ username, firstName, lastName,
     * isAdmin }, ...]`
     *
     **/
    static async findAll() {
        const result = await db.query(
            `SELECT
                username,
                first_name AS "firstName",
                last_name AS "lastName",
                is_admin AS "isAdmin"
            FROM users
            ORDER BY username`,
        );

        return result.rows;
    }

    /**
     * Given a username, return data about user.
     *
     * @param {string} username Target user's username
     * @returns {Promise<object>} `{username, firstName, lastName, isAdmin, collections}`,
     * where `collections` is `[{ id, title, colors }, ...]`
     * and `colors` is an array of hex values.
     *
     * Throws `NotFoundError` if user not found.
     **/
    static async get(username) {
        const userRes = await db.query(
            `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
            [username],
        );

        const user = userRes.rows[0];
        if (!user) throw new NotFoundError(`No user: ${username}`);

        const collectionData = await db.query(
            `SELECT coll.id,
                    coll.title,
                    coll_col.color_hex AS hex
            FROM collections AS coll
            LEFT JOIN collections_colors AS coll_col
                ON coll.id = coll_col.collection_id
            WHERE coll.creator_username = $1
            ORDER BY coll.id`,
            [username]
        );

        // console.log("COLLECTIONS RESULT: ", collectionData.rows);

        // TODO: investigate if indexing + multiple queries might be more efficient
        // Indexing is already done (primary key); do the query way and time it, especially for
        // large datasets (this is to be done much later)

        // Put together final result
        const rows = collectionData.rows;
        const collections = [];
        const seenIds = new Set();

        for (let outer of rows) {
            const {id, title} = outer;

            if (!seenIds.has(outer.id)) {

                // Create new collection entry
                const entry = {id, title, colors: []};

                // Find all colors associated with the current outer loop row
                for (let inner of rows) {
                    if (inner.id === id && inner.hex) {
                        entry.colors.push(inner.hex);
                    }
                }

                collections.push(entry);
            }

            seenIds.add(id);
        }

        user.collections = collections;
        return user;
    }

    /**
     * Update user data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * @param {string} username Target user's username
     * @param {object} data Can include: `{firstName, lastName, password, isAdmin}`
     * @returns {Promise<object>} Updated fields: `{username, firstName, lastName, isAdmin}`
     *
     * Throws `NotFoundError` if user is not found.
     *
     * WARNING: this function can set a new password or make a user an admin.
     * Callers of this function must be certain they have validated inputs to this
     * or a serious security risks are opened.
     */
    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        // Remove invalid fields in the data
        const validFields = new Set(["firstName", "lastName", "password", "isAdmin"]);
        let trimmedData = {...data};
        for (let key of Object.keys(trimmedData)) {
            if (!validFields.has(key)) delete trimmedData[key];
        }

        const { setCols, values } = sqlForPartialUpdate(
            trimmedData,
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            });

        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users
                            SET ${setCols}
                            WHERE username = ${usernameVarIdx}
                            RETURNING username,
                                        first_name AS "firstName",
                                        last_name AS "lastName",
                                        is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }

    /**
     * Delete given user from database.
     *
     * @param {string} username Target user's username
     *
     * Throws `NotFoundError` if user not found.
     */
    static async remove(username) {
        let result = await db.query(
            `DELETE
                FROM users
                WHERE username = $1
                RETURNING username`,
            [username],
        );

        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

}


module.exports = User;
