export function addUser(db, req, res) {
    const id = req.body.session;
    const name = req.body.queryResult.parameters.name	
    var queryString = `SELECT uid from user where uid='${id}'`;
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
                        return res.json({ fulfillmentText: `Hi ${name}! Is there anything you would want to do?` });
                    }
                });
            } else {
                return res.json({ fulfillmentText: `Welcome back, ${name}! Is there anything you would want to do?` });
            }
        }
    });
}

export function borrowBook(db, req, res) {
	const borrowed = req.body.queryResult.parameters.borrowed;
	var queryString = `SELECT uid FROM book WHERE title = '${borrowed}'`;

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `There is no such ${borrowed}️` });
		}

		if(rows[0].uid){
			return res.json({ fulfillmentText: `${borrowed} is already borrowed` });
		}

        const id = req.body.session;
		queryString = `UPDATE book SET uid = '${id}' WHERE title = '${borrowed}' ORDER BY title LIMIT 1`;
		
		db.query(queryString, (err, rows) => {
			if(err) {
				console.log(err);
			}
			return res.json({ fulfillmentText: `Here is ${borrowed}` });
		});
	});
}

export function showBorrowedBooks(db, req, res) {
    const id = req.body.session;
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
                var books = 'Here are the your books ';
                for(var i = 0; i < rows.length; i++) {
                    books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author;
                }
                return res.json({ fulfillmentText: books });
            }

		});
	});
}


export function returnBook(db, req, res) {
	const returned = req.body.queryResult.parameters.returned;
	var queryString = `SELECT uid FROM book WHERE title = '${returned}'`;
    const id = req.body.session;

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `There is no such ${returned}️` });
		}

		if(!rows[0].uid){
			return res.json({ fulfillmentText: `${returned} has already been returned` });
		}

        if(rows[0].uid != id){
			return res.json({ fulfillmentText: `${returned} isn't even with you!` });
        }

		queryString = `UPDATE book SET uid = NULL WHERE title = '${returned}' ORDER BY title LIMIT 1`;
		
		db.query(queryString, (err, rows) => {
			if(err) {
				console.log(err);
			}
			return res.json({ fulfillmentText: `Thank you for returning, ${returned}` });
		});
	});
}


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
        else{
            var books = 'Here are the books:';
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

