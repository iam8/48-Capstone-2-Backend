"use strict";


/** Express app for Colors project. */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");

// TODO: import routes here

const { NotFoundError } = require("./expressError");


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);


/** Handle 404 errors. */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});


/** Generic error handler. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});


module.exports = app;
