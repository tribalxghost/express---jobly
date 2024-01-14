const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/** Converts js/ request into SQL statement
 * Seperates the keys and values
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);

  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>{
         if(colName !== "id"){
      `"${jsToSql[colName] || colName}"=$${idx + 1}`
         } else{
          `"${jsToSql[colName] || colName}"=$${idx}`
         }
  }
  );
  console.log(cols)

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
