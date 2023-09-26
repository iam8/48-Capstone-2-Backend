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

    }

    /**
     * Get all data on a single collection by ID.
     */
    static async getSingle(id) {

    }

    /**
     * Get data on all collections by a given user.
     */
    static async getAllByUser(username) {

    }

    /**
     * Get data on all collections.
     */
    static async getAll() {

    }

    /**
     * Rename a given collection.
     */
    static async rename({id, newTitle}) {

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

    }
}


module.exports = Collection;
