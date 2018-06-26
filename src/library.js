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

export function showBorrowedBooks(db, req, res) {
    const id = req.body.session;
	var queryString = `SELECT title, author FROM book WHERE uid = '${id}'`;
    var output = {"fulfillmentMessages": ""};

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
                var textListJSON = [];
                var textList = [];
                var text = 'Here are all your books';
                textList.push(text);
                const textInnerJSON = {"text": textList};
                const textJSON = {"text":textInnerJSON};
                textListJSON.push(textJSON);
                
                for(var i = 0; i < rows.length; i++) {
                    textList = [];
                    text = rows[i].title + '\nAuthor: ' + rows[i].author;
                    textList.push(text);
                    const textInnerJSON = {"text": textList};
                    const textJSON = {"text":textInnerJSON};
                    textListJSON.push(textJSON);
                }
                return res.json(output);
            }

		});
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
    var output = {"fulfillmentMessages": ""};

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
        else{
            var textListJSON = [];
            var textList = [];
            var text = 'Here are all books';
            textList.push(text);
            const textInnerJSON = {"text": textList};
            const textJSON = {"text":textInnerJSON};
            textListJSON.push(textJSON);
            
            for(var i = 0; i < rows.length; i++) {
                textList = [];
                text = rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
                textList.push(text);
                const textInnerJSON = {"text": textList};
                const textJSON = {"text":textInnerJSON};
                textListJSON.push(textJSON);
            }
            
            const output = {"fulfillmentMessages": textListJSON};
                        
            return res.json(output);
        }
	});
}

export function showAvailableBooks(db, req, res) {
	const queryString = 'SELECT title, author, category FROM book where uid is null';
    var output = {"fulfillmentMessages": ""};

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no available books in the db!'});
		}
        else{
            var textListJSON = [];
            var textList = [];
            var text = 'Here are the available books';
            textList.push(text);
            const textInnerJSON = {"text": textList};
            const textJSON = {"text":textInnerJSON};
            textListJSON.push(textJSON);
            
            for(var i = 0; i < rows.length; i++) {
                textList = [];
                text = rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
                textList.push(text);
                const textInnerJSON = {"text": textList};
                const textJSON = {"text":textInnerJSON};
                textListJSON.push(textJSON);
            }
            
            const output = {"fulfillmentMessages": textListJSON};
                        
            return res.json(output);
        }
	});
}

export function getBookAuthor(db, req, res) {
    const author = req.body.queryResult.parameters.author;
	const queryString = 'SELECT title, author, category FROM book WHERE author=?';
    var output = {"fulfillmentMessages": ""};

	db.query(queryString, '%' + author + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `${author} has no books!`});
		}
        else{
            var textListJSON = [];
            var textList = [];
            var text = 'Here are the books by ' + author + '\n\n';
            textList.push(text);
            const textInnerJSON = {"text": textList};
            const textJSON = {"text":textInnerJSON};
            textListJSON.push(textJSON);
            
            for(var i = 0; i < rows.length; i++) {
                textList = [];
                text = rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
                textList.push(text);
                const textInnerJSON = {"text": textList};
                const textJSON = {"text":textInnerJSON};
                textListJSON.push(textJSON);
            }
            
            const output = {"fulfillmentMessages": textListJSON};
                        
            return res.json(output);
        }
	});
}

export function getBookTitle(db, req, res) {
    const title = req.body.queryResult.parameters.title;
    const queryString = 'SELECT title, author, category FROM book WHERE title like ?';
    var output = {"fulfillmentMessages": ""};
	db.query(queryString, '%' + title + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error in finding book ${title}!` });
        }

		if(!rows.length) {
			return res.json({ fulfillmentText: `We don't have anything ${title}!`});
		}
        else{
            var textListJSON = [];
            var textList = [];
            var text = 'Here are the books with title: ' + title + '\n\n';
            textList.push(text);
            const textInnerJSON = {"text": textList};
            const textJSON = {"text":textInnerJSON};
            textListJSON.push(textJSON);
            
            for(var i = 0; i < rows.length; i++) {
                textList = [];
                text = rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
                textList.push(text);
                const textInnerJSON = {"text": textList};
                const textJSON = {"text":textInnerJSON};
                textListJSON.push(textJSON);
            }
            
            const output = {"fulfillmentMessages": textListJSON};
                        
            return res.json(output);
         }
	});
}

export function getBookCategory(db, req, res) {
    const category = req.body.queryResult.parameters.category;
    const queryString = 'SELECT title, author, category FROM book WHERE category like?';
    var output = {"fulfillmentMessages": ""};
	db.query(queryString, '%' + category + '%', (err, rows) => {
        if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `We don't have anything in ${category}! :'(`});
		}
        else{
            var textListJSON = [];
            var textList = [];
            var text = 'Here are the books with category: ' + category + '\n\n';
            textList.push(text);
            const textInnerJSON = {"text": textList};
            const textJSON = {"text":textInnerJSON};
            textListJSON.push(textJSON);
            
            for(var i = 0; i < rows.length; i++) {
                textList = [];
                text = rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
                textList.push(text);
                const textInnerJSON = {"text": textList};
                const textJSON = {"text":textInnerJSON};
                textListJSON.push(textJSON);
            }
            
            const output = {"fulfillmentMessages": textListJSON};
                        
            return res.json(output);
        }
	});
}

