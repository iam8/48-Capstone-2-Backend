"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Collection = require("../models/collection");


/** Middleware: authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }

        return next();
    } catch (err) {
        return next();
    }
}


/** Middleware to use when user must be logged in.
 *
 * If not, raises UnauthorizedError.
 */
function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}


/** Middleware to use when user must be logged in as an admin.
 *
 *  If not, raises UnauthorizedError.
 */
function ensureAdmin(req, res, next) {
    try {
        if (!res.locals.user || !res.locals.user.isAdmin) {
            throw new UnauthorizedError();
        }

        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when user must provide a valid token & be the user matching the username
 * provided as a route param.
 *
 *  If not, raises UnauthorizedError.
 */
function ensureCorrectUserOrAdmin(req, res, next) {
    try {
        const user = res.locals.user;
        if (!(user && (user.isAdmin || user.username === req.params.username))) {
            throw new UnauthorizedError();
        }

        return next();
    } catch (err) {
        return next(err);
    }
}


/**
 * Ensure that current user is an admin and/or is the owner of the collection specified by ID in
 * the URL parameters.
 *
 * If not, raises UnauthorizedError.
 */
async function ensureAdminOrCollectionOwner(req, res, next) {
    try {
        const { id } = req.params;
        const collection = await Collection.getSingle(id);
        const user = res.locals.user;

        if (!(user && (user.isAdmin || collection.username === user.username))) {
            throw new UnauthorizedError("Unauthorized: current user does not own this collection");
        };

        return next();
    } catch(err) {
        return next(err);
    }
}


module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUserOrAdmin,
    ensureAdminOrCollectionOwner
};
