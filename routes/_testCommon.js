const bcrypt = require("bcrypt");

const db = require("../colors-db.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const {createToken} = require("../helpers/tokens.js");

const usernames = [];
const collIds = [];
const userData = [];
const passwords = ["password0", "password1", "password2"];
const tokens = [];


async function commonBeforeAll() {
    await db.query("DELETE FROM users");

    // ADD USER DATA
    const userRes = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, is_admin)
        VALUES
            ('u1', $1, 'FN1', 'LN1', true),
            ('u2', $2, 'FN2', 'LN2', false),
            ('u3', $3, 'FN3', 'LN3', false)
        RETURNING username`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password3", BCRYPT_WORK_FACTOR)
        ]);

    usernames.push(...userRes.rows.map(entry => entry.username));

    // ADD COLLECTIONS DATA
    const collRes = await db.query(`
        INSERT INTO collections (title, creator_username)
        VALUES
            ('coll-u1-1', $1),
            ('coll-u1-2', $2),
            ('coll-u1-3', $3),
            ('coll-u2-1', $4)
        RETURNING id`,
        [
            usernames[0],
            usernames[0],
            usernames[0],
            usernames[1]
        ]);

        collIds.push(...collRes.rows.map(entry => entry.id));

    // ADD COLORS TO COLLECTIONS
    await db.query(`
        INSERT INTO collections_colors (collection_id, color_hex)
        VALUES
            ($1, '000000'),
            ($2, '111111'),
            ($3, '222222'),
            ($4, 'aaaaaa'),
            ($5, 'bbbbbb'),
            ($6, 'a1b1c1')`,
        [
            collIds[0],
            collIds[0],
            collIds[0],
            collIds[1],
            collIds[1],
            collIds[2]
        ]);
}


async function commonBeforeAllAlt() {
    await db.query("DELETE FROM users");

    // ADD USER DATA
    const userRes = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, is_admin)
        VALUES
            ('u0', $1, 'FN0', 'LN0', true),
            ('u1', $2, 'FN1', 'LN1', false),
            ('u2', $3, 'FN2', 'LN2', false)
        RETURNING
            username,
            password,
            first_name AS "firstName",
            last_name AS "lastName",
            is_admin AS "isAdmin"`,
        [
            await bcrypt.hash(passwords[0], BCRYPT_WORK_FACTOR),
            await bcrypt.hash(passwords[1], BCRYPT_WORK_FACTOR),
            await bcrypt.hash(passwords[2], BCRYPT_WORK_FACTOR)
        ]
    );

    userData[0] = userRes.rows[0];
    userData[1] = userRes.rows[1];
    userData[2] = userRes.rows[2];

    userData[0].collections = [];
    userData[1].collections = [];
    userData[2].collections = [];

    // ADD COLLECTIONS DATA
    const collRes = await db.query(`
        INSERT INTO collections (title, creator_username)
        VALUES
            ('coll-u0-1', $1),
            ('coll-u0-2', $2),
            ('coll-u0-3', $3),
            ('coll-u1-1', $4)
        RETURNING id, title, creator_username AS "username"`,
        [
            userData[0].username,
            userData[0].username,
            userData[0].username,
            userData[1].username
        ]);

    userData[0].collections.push(collRes.rows[0], collRes.rows[1], collRes.rows[2]);
    userData[1].collections.push(collRes.rows[3]);

    userData[0].collections[0].colors = [];
    userData[0].collections[1].colors = [];
    userData[0].collections[2].colors = [];
    userData[1].collections[0].colors = [];

    // ADD COLORS TO COLLECTIONS
    const colorRes = await db.query(`
        INSERT INTO collections_colors (collection_id, color_hex)
        VALUES
            ($1, '000000'),
            ($2, '111111'),
            ($3, '222222'),
            ($4, 'aaaaaa'),
            ($5, 'bbbbbb'),
            ($6, 'a1b1c1')
        RETURNING color_hex AS "colorHex"`,
        [
            userData[0].collections[0].id,
            userData[0].collections[0].id,
            userData[0].collections[0].id,
            userData[0].collections[1].id,
            userData[0].collections[1].id,
            userData[1].collections[0].id,
        ]);

    userData[0].collections[0].colors.push(
        colorRes.rows[0].colorHex,
        colorRes.rows[1].colorHex,
        colorRes.rows[2].colorHex
    );
    userData[0].collections[1].colors.push(
        colorRes.rows[3].colorHex,
        colorRes.rows[4].colorHex
    );
    userData[1].collections[0].colors.push(
        colorRes.rows[5].colorHex
    );

    // CREATE USER AUTH TOKENS
    tokens.push(
        createToken({
            username: userData[0].username, isAdmin: userData[0].isAdmin
        }),
        createToken({
            username: userData[1].username, isAdmin: userData[1].isAdmin
        }),
        createToken({
            username: userData[2].username, isAdmin: userData[2].isAdmin
        }),
    );

    console.log("TEST DATA OBJECT:");
    console.dir(userData, {depth: null});
}


async function commonBeforeEach() {
    await db.query("BEGIN");
}


async function commonAfterEach() {
    await db.query("ROLLBACK");
}


async function commonAfterAll() {
    await db.query("DELETE FROM users");
    await db.end();
}


module.exports = {
    commonBeforeAll,
    commonBeforeAllAlt,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    usernames,
    collIds,
    userData,
    passwords,
    tokens
};
