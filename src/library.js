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
            console.log("NOTICE ME >:(" +  title);
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
	const queryString = 'SELECT title, author, category FROM book WHERE category=?';

	db.query(queryString, '%' + category + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `We don't have anything in ${category}!`});
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

