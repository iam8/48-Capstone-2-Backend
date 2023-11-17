"use strict";

const db = require("../colors-db");
const Collection = require("./collection");
const {NotFoundError, BadRequestError} = require("../expressError");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    usernames,
    collIds
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// Tests for create() -----------------------------------------------------------------------------
describe("create()", () => {
    test("Inserts new collection into database and returns collection data", async () => {
        const createRes = await Collection.create({title: "NewColl", username: usernames[0]});
        expect(createRes).toEqual({
            id: expect.any(Number),
            title: "NewColl",
            username: usernames[0]
        });

        const collId = createRes.id;

        const dbRes = await db.query(`
            SELECT * FROM collections
            WHERE id = $1`,
            [collId]
        );

        expect(dbRes.rows[0]).toEqual({
            id: collId,
            title: "NewColl",
            creator_username: usernames[0]
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
        const result = await Collection.getSingle(collIds[0]);
        expect(result).toEqual({
            id: collIds[0],
            title: "coll-u1-1",
            username: "u1",
            colors: ["000000", "111111", "222222"]
        });
    })

    test("Returns data on existing collection that has no colors", async () => {
        const result = await Collection.getSingle(collIds[3]);
        expect(result).toEqual({
            id: collIds[3],
            title: "coll-u2-1",
            username: "u2",
            colors: []
        });
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
        const result = await Collection.getAllByUser(usernames[0]);
        expect(result).toEqual([
            {
                id: expect.any(Number),
                title: "coll-u1-1",
                username: usernames[0]
            },
            {
                id: expect.any(Number),
                title: "coll-u1-2",
                username: usernames[0]
            },
            {
                id: expect.any(Number),
                title: "coll-u1-3",
                username: usernames[0]
            }
        ]);
    })

    test("Returns empty list for a user that has no collections", async () => {
        const result = await Collection.getAllByUser(usernames[2]);
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
        expect(result).toEqual([
            {
                id: expect.any(Number),
                title: "coll-u1-1",
                username: "u1"
            },
            {
                id: expect.any(Number),
                title: "coll-u1-2",
                username: "u1"
            },
            {
                id: expect.any(Number),
                title: "coll-u1-3",
                username: "u1"
            },
            {
                id: expect.any(Number),
                title: "coll-u2-1",
                username: "u2"
            }
        ]);
    })

    test("Returns empty list if no collections", async () => {
        await db.query(`DELETE FROM collections`);

        const result = await Collection.getAll();
        expect(result).toEqual([]);
    })
})
//-------------------------------------------------------------------------------------------------


// Tests for rename() -----------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for addColor() ---------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for removeColor() ------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------


// Tests for remove() -----------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
