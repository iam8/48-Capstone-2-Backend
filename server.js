"use strict";

/** Server startup for Express app. */

const app = require("./app");
const { HOSTNAME, PORT } = require("./config");

app.listen(PORT, HOSTNAME, () => {
    console.log(`Started on http://${HOSTNAME}:${PORT}`);
});
