import * as fb from './fbFunctions';

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
				const notification = `Someone wants to borrow, ${rows[0].title}. \nType Return ${rows[0].title}`;
				// fb.pushQuickReplies(num, notification, ['Return ' + `${rows[0].title}`]);
				return res.json({ fulfillmentText: `${rows[0].title} is already borrowed` }); 
			}
		}
		const title = rows[0].title.slice(1,-1);
		const author = rows[0].author.slice(1,-1);
		const img = rows[0].img.slice(1,-1);
		const card = fb.fbCard(title, author, img);
		updateBorrowBook(db, res, title, id, card);
	});
}

export function updateBorrowBook(db, res, title, id, card){
	const queryString = `UPDATE book SET uid = '${id}' WHERE title = '${title}' ORDER BY title LIMIT 1`;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}
		var msg = `Here's` + " " + title.slice(1,-1);
		fb.pushMessage(id, msg);	
		return res.json({"fulfillmentMessages" : [card]});
	});
}


export function returnBook(db, req, res) {
	const returned = req.body.queryResult.parameters.returned;
	var queryString = `SELECT uid, title FROM book WHERE title like '%${returned}%'`;

	db.query(queryString, (err, rows) => {
		const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `There is no such ${rows[0].title} ` });
		}

		if(!rows[0].uid){
			return res.json({ fulfillmentText: `${rows[0].title} has already been returned` });
		}

        if(rows[0].uid != id){
			return res.json({ fulfillmentText: `${rows[0].title} isn't even with you!` });
		}
		return updateReturnBook(db, req, res, rows[0].title);
	});
}

export function updateReturnBook(db, req, res, title){
	queryString = `UPDATE book SET uid = NULL WHERE title = '${title}' ORDER BY title LIMIT 1`;
		
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}
		return res.json({ fulfillmentText: `Thank you for returning, ${returned}` });
	});
}

