"use strict";


const {sqlForPartialUpdate} = require("./sql");
const {BadRequestError} = require("../expressError");


describe("sqlForPartialUpdate", () => {
    test("Throws an error if given an empty data argument", () => {
        expect.assertions(1);

        expect(() => {
            sqlForPartialUpdate({}, {"jsCol": "sql_col"});
        }).toThrow(new BadRequestError("No data"));
    });

    test("Works for data with 1 field and empty jsToSql argument", () => {
        expect.assertions(1);

        const result = sqlForPartialUpdate({propertyOne: "Prop-1-value"}, {});
        expect(result).toEqual({
            setCols: '"propertyOne"=$1',
            values: ["Prop-1-value"]
        });
    });

    test("Works for data with 3 fields and non-empty jsToSql argument", () => {
        expect.assertions(1);

        const data = {
            propertyOne: "Prop-1-value",
            propertyTwo: "Prop-2-value",
            propertyThree: "Prop-3-value"
        };

        const jsToSql = {
            "propertyThree": "property_three"
        };

        const result = sqlForPartialUpdate(data, jsToSql);
        expect(result).toEqual({
            setCols: '"propertyOne"=$1, "propertyTwo"=$2, "property_three"=$3',
            values: ["Prop-1-value", "Prop-2-value", "Prop-3-value"]
        });
    });
});
