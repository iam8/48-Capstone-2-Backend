"use strict";

const app = require("./app");
const { HOSTNAME, PORT } = require("./config");

app.listen(PORT, HOSTNAME, () => {
    console.log(`Started on http://${HOSTNAME}:${PORT}`);
});
