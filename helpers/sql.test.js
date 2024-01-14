const sql = require("./sql");


describe("Converts js to sql", function () {
    test("Setcols and values", function () {
      const data = sql.sqlForPartialUpdate({"first_name": "Andrew", "password":"Test"}, {"last_name": "Dawson"})
      expect(data.setCols).toEqual(
        '"first_name"=$1, "password"=$2'
      );
      expect(data.values).toEqual(
        ["Andrew","Test"]
      );
    })})