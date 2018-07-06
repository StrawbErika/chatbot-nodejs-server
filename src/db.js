import mysql from "mysql";

export default callback => {
  let mysql = require("mysql");

  const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "tomhiddleston",
    database: "library"
  });

  db.connect(err => {
    if (err) {
      console.log("Error in connecting to database");
      console.log(err.message);
    } else {
      console.log("Success in connecting to database");
    }
  });

  db.query("USE library");

  callback(db);
};
