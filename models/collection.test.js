"use strict";

const db = require("../colors-db");
const Collection = require("./collection");
const {NotFoundError, BadRequestError} = require("../expressError");

const {
    commonBeforeAllAlt,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    userData,
} = require("./_testCommon");


beforeAll(commonBeforeAllAlt);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for create() -----------------------------------------------------------------------------
describe("create()", () => {
    test("Inserts new collection into database and returns collection data", async () => {
        const {username} = userData[0];
        const newColl = {
            title: "NewColl",
            username
        }

        const createRes = await Collection.create(newColl);
        expect(createRes).toEqual({
            id: expect.any(Number),
            title: newColl.title,
            username
        });

        const dbRes = await db.query(`
            SELECT * FROM collections
            WHERE id = $1`,
            [createRes.id]
        );

        expect(dbRes.rows[0]).toEqual({
            id: createRes.id,
            title: newColl.title,
            creator_username: username
        });
    })

    test("Throws NotFoundError for nonexistent username", async () => {
        expect.assertions(1);

        try {
            await Collection.create({title: "NewColl", username: "nonexistent"});
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for getSingle() --------------------------------------------------------------------------
describe("getSingle()", () => {
    test("Returns data on existing collection that has colors", async () => {
        const result = await Collection.getSingle(userData[0].collections[0].id);
        expect(result).toEqual(userData[0].collections[0]);
    })

    test("Returns data on existing collection that has no colors", async () => {
        const result = await Collection.getSingle(userData[0].collections[2].id);
        expect(result).toEqual(userData[0].collections[2]);
    })

    test("Throws NotFoundError for a nonexistent collection", async () => {
        expect.assertions(1);

        try {
            await Collection.getSingle(0);
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for getAllByUser() -----------------------------------------------------------------------
describe("getAllByUser()", () => {
    test("Returns data on all collections by a user that has collections", async () => {
        const result = await Collection.getAllByUser(userData[0].username);
        const expected = [];

        for (let coll of userData[0].collections) {
            const {id, title, username} = coll;
            expected.push({id, title, username});
        }

        expect(result).toEqual(expected);
    })

    test("Returns empty list for a user that has no collections", async () => {
        const result = await Collection.getAllByUser(userData[2].username);
        expect(result).toEqual([]);
    })

    test("Throws NotFoundError for a nonexistent user", async () => {
        expect.assertions(1);

        try {
            await Collection.getAllByUser("nonexistent");
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for getAll() -----------------------------------------------------------------------------
describe("getAll()", () => {
    test("Returns list of data on all collections", async () => {
        const result = await Collection.getAll();
        const expected = [];

        userData.forEach((user) => {
            user.collections.forEach((coll) => {
                const {id, title, username} = coll;
                expected.push({id, title, username});
            });
        });

        expect(result).toEqual(expected);
    })

    test("Returns empty list if no collections", async () => {
        await db.query(`DELETE FROM collections`);

        const result = await Collection.getAll();
        expect(result).toEqual([]);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for rename() -----------------------------------------------------------------------------
describe("rename()", () => {
    test("Successfully renames a given collection and returns correct data", async () => {
        const coll = userData[0].collections[0];
        const newTitle = "NewTitle";
        // const rnData = {id: coll.id, newTitle: "NewTitle"};

        const rnRes = await Collection.rename(coll.id, newTitle);
        expect(rnRes).toEqual({
            id: coll.id,
            title: newTitle,
            username: coll.username
        });

        const dbRes = await db.query(`
            SELECT * FROM collections WHERE id = $1`,
            [coll.id]
        );

        expect(dbRes.rows[0]).toEqual({
            id: coll.id,
            title: newTitle,
            creator_username: coll.username
        });
    })

    test("Throws NotFoundError for a nonexistent collection", async () => {
        expect.assertions(1);

        try {
            await Collection.rename(0, "NewTitle");
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for addColor() ---------------------------------------------------------------------------
describe("addColor()", () => {
    test("Successfully adds a new color to a collection and returns correct data", async () => {
        const coll = userData[0].collections[0];
        const origColors = coll.colors;
        const newColor = "ffffff";

        const addRes = await Collection.addColor(coll.id, newColor);
        expect(addRes).toEqual({
            id: coll.id,
            colorHex: newColor
        });

        const dbRes = await db.query(`
            SELECT id, color_hex FROM collections
            JOIN collections_colors
                ON collections.id = collections_colors.collection_id
            WHERE collections.id = $1`,
            [coll.id]);

        const idRes = dbRes.rows[0].id;
        const colorsRes = dbRes.rows.map(entry => entry.color_hex);

        expect(idRes).toBe(coll.id);
        expect(colorsRes).toEqual([...origColors, newColor]);
    })

    test("Throws NotFoundError for a nonexistent collection", async () => {
        expect.assertions(1);

        try {
            await Collection.addColor(0, "ffffff");
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })

    test("Throws BadRequestError if color already exists in collection", async () => {
        expect.assertions(2);

        const coll = userData[0].collections[0];
        const oldColor = coll.colors[0];

        try {
            await Collection.addColor(coll.id, oldColor);
        } catch(err) {
            expect(err).toBeInstanceOf(BadRequestError);
        }

        const dbRes = await db.query(`
            SELECT color_hex FROM collections
            JOIN collections_colors
                ON collections.id = collections_colors.collection_id
            WHERE collections.id = $1
            AND color_hex = $2`,
            [coll.id, oldColor]
        );

        expect(dbRes.rows).toHaveLength(1);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for removeColor() ------------------------------------------------------------------------
describe("removeColor()", () => {
    test("Successfully removes color from collection and returns correct data", async () => {
        const coll = userData[0].collections[0];
        const color = coll.colors[0];
        const toRemove = {id: coll.id, colorHex: color};

        const rmRes = await Collection.removeColor(toRemove.id, toRemove.colorHex);
        expect(rmRes).toEqual({"deleted": toRemove});

        const dbRes = await db.query(`
            SELECT color_hex FROM collections
            JOIN collections_colors
                ON collections.id = collections_colors.collection_id
            WHERE collections.id = $1
            AND color_hex = $2`,
            [toRemove.id, toRemove.colorHex]
        );

        expect(dbRes.rows).toHaveLength(0);
    })

    test("Throws NotFoundError for nonexistent collection-color associations", async () => {
        expect.assertions(4);

        const coll0 = userData[0].collections[0];
        const coll1 = userData[1].collections[0];
        const color0 = coll0.colors[0];

        const toRemove = [
            {id: 0, colorHex: color0},
            {id: 0, colorHex: "abcdef"},
            {id: coll0.id, colorHex: "abcdef"},
            {id: coll1.id, colorHex: color0}
        ];

        for (let data of toRemove) {
            try {
                await Collection.removeColor(data.id, data.colorHex);
            } catch(err) {
                expect(err).toBeInstanceOf(NotFoundError);
            }
        }
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for remove() -----------------------------------------------------------------------------
describe("remove()", () => {
    test("Successfully removes collection and returns correct data", async () => {
        const coll = userData[0].collections[0];

        const rmRes = await Collection.remove(coll.id);
        expect(rmRes).toEqual({
            deleted: {
                id: coll.id
            }
        });

        const dbRes = await db.query(`SELECT * FROM collections WHERE id = $1`, [coll.id]);
        expect(dbRes.rows).toHaveLength(0);
    })

    test("Throws NotFoundError for a nonexistent collection", async () => {
        expect.assertions(1);

        try {
            await Collection.remove(0);
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})
//-------------------------------------------------------------------------------------------------
