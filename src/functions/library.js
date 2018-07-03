import * as fb from './fbFunctions';
import * as search from './searchFunctions';

export function borrowBook(db, req, res) {
	const borrowed = req.body.queryResult.parameters.borrowed;
	var queryString = `SELECT title, author, img, uid FROM book WHERE title like '%${borrowed}%'`;
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `There is no such ${borrowed}️` });
		}

		if(rows[0].uid){
			if(rows[0].uid === id){
				return res.json({ fulfillmentText: `You already have ${rows[0].title}!` }); 
			}
			else{	
				var num = parseInt(rows[0].uid, 10);
				const notification = `Someone wants to borrow, ${rows[0].title}. \nType I'm returning ${rows[0].title}`;
				fb.pushMessage(num, notification);
				return res.json({ fulfillmentText: `${rows[0].title} is already borrowed` }); 
			}
		}
		if(rows.length > 1){
			if(rows.length > 20){
				var len = 20;
				var msg = `There are more than 20 instances of a book with title ${borrowed}. Here are the first 20 similar entries. \n`;
			}
			else{
				len = rows.length;
				var msg = `There are more than 1 instances of a book with title ${borrowed}. Here are similar entries. \n`;
			}
				var books = '';
				for(var i = 0; i < len; i++) {
					books += '\n' + rows[i].title;
				}
				return res.json({ fulfillmentText: msg +books });
 
		}
		updateBorrowBook(db, res, rows[0].title.slice(1,-1), id, search.sliceTitleAuthorImg(rows[0].title, rows[0].author, rows[0].img));
	});
}

export function updateBorrowBook(db, res, title, id, card){
	const queryString = `UPDATE book SET uid = '${id}' WHERE title like '%${title}%' ORDER BY title LIMIT 1`;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}
		var msg = `Here's` + " " + title;
		fb.pushMessage(id, msg);	
		return res.json({"fulfillmentMessages" : [card]});
	});
}


export function returnBook(db, req, res) {
	const returned = req.body.queryResult.parameters.returned;
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	var queryString = `SELECT uid, title FROM book WHERE title like '%${returned}%' AND uid like '%${id}%'`;

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `You have no such book! ` });
		}

		if(!rows[0].uid){
			return res.json({ fulfillmentText: `${rows[0].title} has already been returned` });
		}

		return updateReturnBook(db, req, res, rows[0].title.slice(1,-1));
	});
}

export function updateReturnBook(db, req, res, title){
	var queryString = `UPDATE book SET uid = NULL WHERE title like '%${title}%' ORDER BY title LIMIT 1`;
		
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}
		return res.json({ fulfillmentText: `Thank you for returning, ${title}` });
	});
}

export function broadcast(db, req, res){
	var text = "Hello customers of Book Rental! This is a broadcasted message!"
	var queryString = `Select uid from user`;
	
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: `There are no customers ` });
		}
		for(var i = 0; i < rows.length; i++) {
			fb.pushMessage(rows[i].uid, text);
		}

		return res.json({ fulfillmentText: `Sent!` });
	});
}