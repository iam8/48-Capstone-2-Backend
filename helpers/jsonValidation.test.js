"use strict";

jest.mock("jsonschema");

const {validate} = require("jsonschema");
const {validateJson} = require("./jsonValidation");
// const {BadRequestError} = require("../expressError");


describe("Tests for validateJson", () => {
    test("Passes correct arguments to jsonschema validator function", () => {
        validate.mockReturnValue({valid: true});

        const args = ["Request Body", "Schema"];
        validateJson(...args);
        expect(validate.mock.calls).toContainEqual(args);
    });

    test("Returns undefined on validation success", () => {
        validate.mockReturnValue({valid: true});

        const result = validateJson("Request Body", "Schema");
        expect(result).not.toBeDefined();
    });

    test("Throws BadRequestError with appropriate error list on validation failure", () => {
        expect.assertions(1);

        const errors = [{stack: 'Error1'}, {stack: 'Error2'}];
        validate.mockReturnValue({valid: false, errors});

        try {
            validateJson("Request Body", "Schema");
        } catch(err) {
            expect(err.message).toEqual(["Error1", "Error2"]);
        }
    });
});
