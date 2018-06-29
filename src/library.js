
export function checkUser(db, req, res) {
    const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
    const name = req.body.queryResult.parameters.name;	
    const queryString = `SELECT uid, name from user where uid like '%${id}%'`;
    db.query(queryString, (err, rows) => {
        if(err) {
            console.log(err);
        } else {
            if(!rows.length) {
				return addUser(db, req, res);
            }else {
				if(name === rows[0].name){
					return res.json({ fulfillmentText: `Welcome back, ${rows[0].name}! What do you want to do?` });
				}
				else{
					var text = `That's not your name, ${rows[0].name}! But I'll change it into ${name} for you! What do you want to do?`;
					return updateUser(db, req, res, text);
				}
            }
        }
    });
}

export function addUser(db, req, res){
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
    const name = req.body.queryResult.parameters.name;	
	const queryString = `INSERT INTO user VALUES ('${id}','${name}')`;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		} else {
			return res.json({ fulfillmentText: `Hi ${name}! What do you want to do?` });
		}
	});
}

export function updateUser(db, req, res, text){
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	const name = req.body.queryResult.parameters.name;	
	const queryString = `UPDATE user SET name = '${name}' WHERE uid = '${id}' `;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		} else {
			return res.json({ fulfillmentText: text});
		}
	});	
}

export function showBorrowedBooks(db, req, res) {
    const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	var queryString = `SELECT title, author FROM book WHERE uid = '${id}'`;

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `You didn't borrow anything!️` });
		}

		else{
			var books = 'Here are all your books ';
			for(var i = 0; i < rows.length; i++) {
				books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author;
			}
			return res.json({ fulfillmentText: books });
		}

	});
}

//double check
export function borrowBook(db, req, res) {
	const borrowed = req.body.queryResult.parameters.borrowed;
	var queryString = `SELECT title, author, img, uid FROM book WHERE title like '%${borrowed}%'`;
	db.query(queryString, (err, rows) => {
		const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
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
				pushNotifMessage(db, req, res, id, `Someone wants to borrow ${rows[0].title}`);
				return res.json({ fulfillmentText: `${rows[0].title} is already borrowed` }); 
			}
		}
		const title = rows[0].title;
		const author = rows[0].author;
		const img = rows[0].img;
		const card = fbCard(title.slice(1,-1), author.slice(1,-1), img.slice(1,-1));
		updateBorrowBook(db, res, title, id, card);
	});
}

export function updateBorrowBook(db, res, title, id, card){
	const queryString = `UPDATE book SET uid = '${id}' WHERE title = '${title}' ORDER BY title LIMIT 1`;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}
		pushNotifMessage(id, `Here's` + " " + title.slice(1,-1));
		return res.json({"fulfillmentMessages" : card});
	});
}

export function fbCard(title, subtitle, img){
	var output = [
		{
			"card": {
				"title": title,
				"subtitle": subtitle,
				"imageUri": img
			},
			"platform": "FACEBOOK"
		  }];
	return output;
}

export function pushNotifMessage(id, message){
	var FBMessenger = require('fb-messenger');
	var messenger = new FBMessenger;("EAAHkRuPI8FUBAKkebDqfujPYrx47jk7VeSmgc2JYVUurG7UckHAwbyO19ZByz6RwRcVzyVE48gZCNI0i7ZALwkXJerKgnsppwgv4YTr4pHvHEZAPjkRUYroSDW9LMFw7yra2DImYKzYbyUN9o5KgantVgxGAYDVLXskDZA1wHbJZAnWhrZBO20V");
	console.log(message);
	console.log(id);
	messenger.sendTextMessage(id, message, function (err, body)
	{
	if(err) return console.error(err)
		console.log(body);
	})
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

		queryString = `UPDATE book SET uid = NULL WHERE title = '${rows[0].title}' ORDER BY title LIMIT 1`;
		
		db.query(queryString, (err, rows) => {
			if(err) {
				console.log(err);
			}
			return res.json({ fulfillmentText: `Thank you for returning, ${returned}` });
		});
	});
}

export function showAllBooks(db, req, res) {
	console.log("WARNING SHOW ALL BOOKS")
    const queryString = 'SELECT title, author, category FROM book';

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		if(rows.length > 50){
			var output = [
				{
					"quickReplies": {
					  "title": `There are more than 50 books, to be exact there are ${rows.length} books. \n Type: All 1 to get the first 10 books! Or click one of these!`,
					  "quickReplies": [
						  `All 1`,
						  `All 5`,
						  `All 10`,
						  `All 100`,
					  ]
					},
					"platform": "FACEBOOK"
				  }];
			return res.json({"fulfillmentMessages" : output});		}
    });
}

export function allPages(db, req, res) {
    const queryString = 'SELECT title, author, category FROM book ORDER BY title ASC';
    var page = (req.body.queryResult.parameters.page);

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		page = page * 10
		console.log(`from : ${startingPage} to ${page}`);
		var books = `Here are books from ${startingPage} to ${page}:`;
		for(var i = startingPage; i < page; i++) {
			books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
		}
		console.log(books);
		return res.json({ fulfillmentText: books });
    });
}

export function showAllCategories(db, req, res) {
    const queryString = 'SELECT DISTINCT category FROM book';

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
        else{
            var categories = 'Here are the books:';
            for(var i = 0; i < rows.length; i++) {
                categories += '\n\n' + rows[i];
            }
            return res.json({ fulfillmentText: categories });
        }
    });
}

export function showUnavailableBooks(db, req, res) {
    const queryString = 'SELECT title, author, category FROM book where uid is not null';

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'All are available!'});
		}
        else{
            var books = 'Here are the unavailable books:';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
	});
}

export function showAvailableBooks(db, req, res) {
    const queryString = 'SELECT title, author, category FROM book where uid is null';

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(rows.length > 50){
			var output = [
				{
					"quickReplies": {
					  "title": `There are more than 50 books, to be exact there are ${rows.length} books. \n Type: Available 1 to get the first 10 books! Or click one of these!`,
					  "quickReplies": [ 
						  `Available 1`,
						  `Available 5`,
						  `Available 10`,
						  `Available 100`,
					  ]
					},
					"platform": "FACEBOOK"
				  }];
			return res.json({"fulfillmentMessages" : output});		
		}
		else{
            var books = 'Here are the available books' + '\n\n';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
	});
}

export function availablePages(db, req, res) {
    const queryString = 'SELECT title, author, category FROM book where uid is null ORDER by title ASC';
	var page = (req.body.queryResult.parameters.page);

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		page = page * 10
		console.log(`from : ${startingPage} to ${page}`);
		var books = `Here are the available books from ${startingPage} to ${page}:`;
		for(var i = startingPage; i < page; i++) {
			books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
		}
		return res.json({ fulfillmentText: books });
    });
}



export function getBookAuthor(db, req, res) {
    const author = req.body.queryResult.parameters.author;
	const queryString = 'SELECT title, author, category FROM book WHERE author=?';

	db.query(queryString, '%' + author + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `${author} has no books!`});
		}
        else{
            var books = 'Here are the books:';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
	});
}


export function getBookTitle(db, req, res) {
    const title = req.body.queryResult.parameters.title;
    const queryString = 'SELECT title, author, category FROM book WHERE title like ?';
	db.query(queryString, '%' + title + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error in finding book ${title}!` });
        }

		if(!rows.length) {
			return res.json({ fulfillmentText: `We don't have anything ${title}!`});
		}
        else{
			if(rows.length == 1){
				var output = [
					{
						"quickReplies": {
						  "title": `Would you like to borrow that book? Click this!`,
						  "quickReplies": [ 
							  `Borrow ${title}`,
						  ]
						},
						"platform": "FACEBOOK"
					  }];
				return res.json({"fulfillmentMessages" : output});
			}
			else{
				if(rows.length > 50){
					var output = [
						{
							"quickReplies": {
							  "title": `There are more than 50 books, to be exact there are ${rows.length} books. \n Type: ${title} 1 to get the first 10 books! Or click one of these!`,
							  "quickReplies": [
								  `${title} 1`,
								  `${title} 5`,
								  `${title} 10`,
								  `${title} 100`,
							  ]
							},
							"platform": "FACEBOOK"
						  }];
					return res.json({"fulfillmentMessages" : output});
				}
				var books = 'Here are the books with title: ' + title + '\n\n';
				for(var i = 0; i < rows.length; i++) {
					books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
				}
				return res.json({ fulfillmentText: books });
			}
        }
	});
}

export function titlePages(db, req, res) {
	var page = (req.body.queryResult.parameters.page);
    const title = req.body.queryResult.parameters.title;
    const queryString = 'SELECT title, author, category FROM book WHERE title like ?';
	db.query(queryString, '%' + title + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		page = page * 10
		console.log(`from : ${startingPage} to ${page}`);
		var books = `Here are books with title: ${title} from ${startingPage} to ${page}:`;
		for(var i = startingPage; i < page; i++) {
			books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
		}
		return res.json({ fulfillmentText: books });
    });
}

export function getBookCategory(db, req, res) {
    const category = req.body.queryResult.parameters.category;
    const queryString = 'SELECT title, author, category FROM book WHERE category like?';
    console.log(category)
	db.query(queryString, '%' + category + '%', (err, rows) => {
        if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `We don't have anything in ${category}! :'(`});
		}
		if(rows.length > 50){
			var output = [
				{
					"quickReplies": {
					  "title": `There are more than 50 books, to be exact there are ${rows.length} books. \n Type: ${category} 1 to get the first 10 books! Or click one of these!`,
					  "quickReplies": [
						  `${category} 1`,
						  `${category} 5`,
						  `${category} 10`,
						  `${category} 100`,
					  ]
					},
					"platform": "FACEBOOK"
				  }];
			return res.json({"fulfillmentMessages" : output});
		}
		else{
            var books = 'Here are the books with category: ' + category + '\n\n';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
	});
}

export function categoryPages(db, req, res) {
	const category = req.body.queryResult.parameters.category;
    const queryString = 'SELECT title, author, category FROM book WHERE category like? ORDER by title ASC';
	var page = (req.body.queryResult.parameters.page);
	db.query(queryString, '%' + category + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		page = page * 10
		console.log(`from : ${startingPage} to ${page}`);
		var books = `Here are ${category} books from ${startingPage} to ${page}:`;
		for(var i = startingPage; i < page; i++) {
			books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
		}
		return res.json({ fulfillmentText: books });
    });
}

