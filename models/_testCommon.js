const bcrypt = require("bcrypt");

const db = require("../colors-db.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

const usernames = [];
const collIds = [];


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
    console.log("USERNAME LIST:", usernames);

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
        console.log("COLLECTIONS ID LIST:", collIds);

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
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    usernames,
    collIds
};
