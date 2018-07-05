import * as fb from "./fbFunctions";

export function checkUser(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  const name = req.body.queryResult.parameters.name;
  const queryString = `SELECT uid, name from user where uid like '%${id}%'`;
  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      if (!rows.length) {
        return addUser(db, req, res);
      } else {
        if (name === rows[0].name) {
          return res.json({
            fulfillmentText: `Welcome back, ${
              rows[0].name
            }! What do you want to do?`
          });
        } else {
          var text = `That's not your name, ${
            rows[0].name
          }! But I'll change it into ${name} for you! What do you want to do?`;
          return updateUser(db, req, res, text);
        }
      }
    }
  });
}

export function addUser(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  const name = req.body.queryResult.parameters.name;
  const queryString = `INSERT INTO user VALUES ('${id}','${name}')`;
  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      return res.json({
        fulfillmentText: `Hi ${name}! What do you want to do?`
      });
    }
  });
}

export function updateUser(db, req, res, text) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  const name = req.body.queryResult.parameters.name;
  const queryString = `UPDATE user SET name = '${name}' WHERE uid = '${id}' `;
  db.query(queryString, (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      return res.json({ fulfillmentText: text });
    }
  });
}

export function help(db, req, res) {
  const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
  const msg = `Or you can click on any of these too!`;
  const qr = [
    `what did i borrow`,
    `show all books`,
    `show available books`,
    `unavailable books`,
    `all categories`
  ];
  setTimeout(() => {
    fb.pushQuickReplies(id, msg, qr);
  }, 1000);
  return res.json({
    fulfillmentText: `borrow <title> \ni'm returning <title> \nwhat books are in <category> \nshow me <title> \nbooks by <author>`
  });
}
