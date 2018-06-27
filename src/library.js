//COMMENTS R TODO

//add name in schema
export function addUser(db, req, res) {
    const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
    const name = req.body.queryResult.parameters.name	
    var queryString = `SELECT uid from user where uid like '%${id}%'`;
    db.query(queryString, (err, rows) => {
        if(err) {
            console.log(err);
        } else {
            if(!rows.length) {
                queryString = `INSERT INTO user VALUES ('${id}')`;
                db.query(queryString, (err, rows) => {
                    if(err) {
                        console.log(err);
                    } else {
                        return res.json({ fulfillmentText: `Hi ${name}! What do you want to do?` });
                    }
                });
            } else {
                return res.json({ fulfillmentText: `Welcome back, ${name}! What do you want to do?` });
            }
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
		
		db.query(queryString, (err, rows) => {
			if(err) {
				console.log(err);
            }
            else{
                var books = 'Here are all your books ';
                for(var i = 0; i < rows.length; i++) {
                    books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author;
                }
                return res.json({ fulfillmentText: books });
            }

		});
	});
}

//double check
export function borrowBook(db, req, res) {
	const borrowed = req.body.queryResult.parameters.borrowed;
	var queryString = `SELECT title, uid FROM book WHERE title like '%${borrowed}%'`;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `There is no such ${borrowed}️` });
		}

		if(rows[0].uid){
			var FBMessenger = require('fb-messenger');
			var messenger = new FBMessenger("EAAHkRuPI8FUBAKkebDqfujPYrx47jk7VeSmgc2JYVUurG7UckHAwbyO19ZByz6RwRcVzyVE48gZCNI0i7ZALwkXJerKgnsppwgv4YTr4pHvHEZAPjkRUYroSDW9LMFw7yra2DImYKzYbyUN9o5KgantVgxGAYDVLXskDZA1wHbJZAnWhrZBO20V");
			var num = parseInt(rows[0].uid, 10)
			messenger.sendTextMessage(num, `Hello, someone wants to borrow ${borrowed}!`, function (err, body) {
			if(err) return console.error(err)
				console.log(body);
			})
			return res.json({ fulfillmentText: `${rows[0].title} is already borrowed` }); 
		}
		var output = `Found ${rows[0].title}! `
		const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
		queryString = `UPDATE book SET uid = '${id}' WHERE title = '${rows[0].title}' ORDER BY title LIMIT 1`;
		
		db.query(queryString, (err, rows) => {
			if(err) {
				console.log(err);
			}
			return res.json({ fulfillmentText: output + `You borrowed ${borrowed}` });
		});
	});
}

export function returnBook(db, req, res) {
	const returned = req.body.queryResult.parameters.returned;
	console.log(req.body)
	console.log("RETURNED: " + returned)
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

//prompt if wanna show all bec it has xxxx rows
	//prompt if how many books per category want to see
	// (need to check how to make follow up prompts)
export function showAllBooks(db, req, res) {
    const queryString = 'SELECT title, author, category FROM book';

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		// else if(rows.length > 100){	
		// 	var output = "There are more than 100 books to show you, are you sure you want to proceed?"
		// }
		else{
            var books = 'Here are the books:';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
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

//prompt if wanna show all bec it has xxxx rows (check if big number of row)
//prompt if how many books per category want to see
export function showUnvailableBooks(db, req, res) {
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

//prompt if wanna show all bec it has xxxx rows
//prompt if how many books per category want to see
export function showAvailableBooks(db, req, res) {
    const queryString = 'SELECT title, author, category FROM book where uid is null';

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no available books in the db!'});
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

//prompt if wanna show all bec it has xxxx rows
// more specific bookTitle
// make function for getBookThroughKeywords
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
            var books = 'Here are the books with title: ' + title + '\n\n';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
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
        else{
            var books = 'Here are the books with category: ' + category + '\n\n';
            for(var i = 0; i < rows.length; i++) {
                books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
            }
            return res.json({ fulfillmentText: books });
        }
	});
}

