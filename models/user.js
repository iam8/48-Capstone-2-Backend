"use strict";

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
     * Returns { username, firstName, lastName, isAdmin }.
     *
     * Throws UnauthorizedError is user not found or password is wrong.
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
     * Register user with data: { username, password, firstName, lastName, isAdmin }.
     *
     * Returns { username, firstName, lastName, isAdmin }.
     *
     * Throws BadRequestError on duplicate usernames.
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
     * Find all users.
     *
     * Returns [{ username, firstName, lastName, isAdmin }, ...].
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
     * Returns { username, firstName, lastName, isAdmin, collections }
     *   where collections is { id, title }.
     *
     * Throws NotFoundError if user not found.
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

        const collectionsRes = await db.query(
            `SELECT coll.id,
                    coll.title
            FROM collections as coll
            WHERE coll.creator_username = $1`,
            [username]
        );

        user.collections = collectionsRes.rows.map(coll => ({
            id: coll.id,
            title: coll.title
        }));

        return user;
    }

    /**
     * Update user data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { firstName, lastName, password, isAdmin }
     *
     * Returns { username, firstName, lastName, isAdmin }.
     *
     * Throws NotFoundError if not found.
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
     * Delete given user (by username) from database.
     *
     * Returns undefined.
     *
     * Throws NotFoundError if user not found.
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
