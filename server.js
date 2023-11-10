"use strict";

const app = require("./app");
const { HOSTNAME, PORT } = require("./config");

app.listen(PORT, HOSTNAME, () => {
    console.log(`Started on http://${HOSTNAME}:${PORT}`);
});

// Here is a change made on the branch named 'tests'
// Another comment to test upstream branch creation
