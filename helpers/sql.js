/** Helpers for SQL queries. */

const { BadRequestError } = require("../expressError");


/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param {object} dataToUpdate Data fields mapped to their updated values
 * @param {object} jsToSql Maps JS-style data fields mapped to database column names
 *
 * @returns {object} `{setCols, values}` - the final SQL prepared statement (string) and its corresponding values (array)
 *
 * @example ({firstName: 'Aliya', age: 32}, {firstName: "first_name", age: "age"}) =>
 *    {setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32]}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}


module.exports = { sqlForPartialUpdate };
