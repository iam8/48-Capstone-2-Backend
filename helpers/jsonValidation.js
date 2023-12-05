/** Helpers for JSON validation. */

const {validate} = require("jsonschema");
const {BadRequestError} = require("../expressError");


/**
 * Helper function that handles JSON web schema validation.
 *
 * Accepts a request body and validates it against a given JSON web schema.
 *
 * If validation fails, throws a BadRequestError.
 *
 * Otherwise, returns undefined.
 */
function validateJson(reqBody, schema) {
    const validator = validate(reqBody, schema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.replaceAll(`"`, `'`));
        throw new BadRequestError(errs);
    }
}


module.exports = {validateJson};
