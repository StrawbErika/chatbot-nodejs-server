export function getBookAuthor(db, req, res) {
    const author = req.body.queryResult.parameters.author;
	const queryString = 'SELECT title, author, category FROM book WHERE author=?';

	db.query(queryString, '%' + author + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(rows.length == 0) {
			return res.json({ fulfillmentText: `${author} has no books!`);
		}

		var books = 'Here are the books:';
		for(var i = 0; i < rows.length; i++) {
			books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
		}

		return res.json({ fulfillmentText: books });
	});
}


