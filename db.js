"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "Christopher#0160",
    database: `${getDatabaseUri()}`,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "Christopher#0160",
    database: `${getDatabaseUri()}`,
  });
}

db.connect();

module.exports = db;