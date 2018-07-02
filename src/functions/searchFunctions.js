import * as fb from './fbFunctions';

export function showBorrowedBooks(db, req, res) {
    const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	var queryString = `SELECT title, author, img FROM book WHERE uid = '${id}'`;

	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `You didn't borrow anything!️` });
		}

		else{
			var books = [];
			for(var i = 0; i < rows.length; i++) {
				const title = rows[i].title.slice(1,-1);
				const author = rows[i].author.slice(1,-1);
				const img = rows[i].img.slice(1,-1);
				const card = fb.fbCard(title, author, img);
				books.push(card);
            }
    		fb.pushMessage(id, `Here are your borrowed books!`);	
            return res.json({"fulfillmentMessages" : books});
		}
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
		if(rows.length > 20){
			var pages = [];
			for(var i = 0; i < 10; i++) {
				var pageNum = `${i+1} : All `;
				pages.push(pageNum);
			}
			return res.json({"fulfillmentMessages" : [fb.quickReplies(
				`There are more than 20 books, to be exact there are ${rows.length} books. \n So there are ${Math.floor((rows.length)/10)} \n Type: 1 : All to get the first 10 books! Or click one of these!`, pages)]});
		}
    });
}


export function allPages(db, req, res) {
    const queryString = 'SELECT title, author, category, img FROM book ORDER BY title ASC';
    var page = req.body.queryResult.parameters.page;
    const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	db.query(queryString, (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		if(page === Math.floor((rows.length/10))+1){
			const excess = rows.length % 10;
			var pageNum = (page-1) * 10 + excess;
		}
		else{
			pageNum = page * 10
		}
		var msg = `Here are the books from ${startingPage} to ${pageNum}:`;
        var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			var title = rows[i].title;
			const author = rows[i].author;
            const img = rows[i].img;
			const card = fb.fbCard(title.slice(1,-1), author.slice(1,-1), img.slice(1,-1));
			books.push(card);
		}
		fb.pushQuickReplies(id, msg, [`${page+1} : All `, `${page+2} : All `, `${page+3} : All `, `${page+4} : All `, `${page+5} : All `]);	
		return res.json({"fulfillmentMessages" : books});
    })
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

		if(rows.length > 20){
			return res.json({"fulfillmentMessages" : fb.quickReplies(
			`There are more than 20 books, to be exact there are ${rows.length} books. \n Type: Available 1 to get the first 10 books! Or click one of these!`, 
			[
				`Available 1`,
				`Available 5`,
				`Available 10`,
				`Available 100`,
			])});
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
				return res.json({"fulfillmentMessages" : fb.quickReplies(
					`Would you like to borrow that book? Click this!`, 
					[
						`Borrow ${title}`,
					])});
			}
			else{
				if(rows.length > 20){
					var pages = [];
					for(var i = 0; i < rows.length/10; i++) {
						var pageNum = `Title ${i+1} : ${title} `;
						pages.push(pageNum);						
					}

					return res.json({"fulfillmentMessages" : [fb.quickReplies(
						`There are more than 20 books, to be exact there are ${rows.length} books. \n Type: Title 1 : ${title} to get the first 10 books! Or click one of these!`, pages)]});
				}
				else{
					var books = 'Here are the books with title: ' + title + '\n\n';
					for(var i = 0; i < rows.length; i++) {
						books += '\n\n' + rows[i].title + '\nAuthor: ' + rows[i].author + '\nCategory: ' + rows[i].category;
					}
					return res.json({ fulfillmentText: books });
				}
			}
        }
	});
}

export function titlePages(db, req, res) {
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	var page = req.body.queryResult.parameters.page;
    const ptitle = req.body.queryResult.parameters.title;
    const queryString = 'SELECT title, author, img FROM book WHERE title like ?';
	db.query(queryString, '%' + ptitle + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		if(page === Math.floor((rows.length/10))+1){
			const excess = rows.length % 10;
			var pageNum = (page-1) * 10 + excess;
		}
		else{
			pageNum = page * 10
		}

		var msg = `Here are books with title: ${ptitle} from ${startingPage} to ${pageNum}:`;
		var books = [];
		for(var i = startingPage; i < page; i++) {
			var title = rows[i].title.slice(1,-1);
			const author = rows[i].author.slice(1,-1);
			const img = rows[i].img.slice(1,-1);
			const card = fb.fbCard(title, author, img);
			books.push(card);
        }
        fb.pushQuickReplies(id, msg, [`${page+1} : All `, `${page+2} : All `, `${page+3} : All `, `${page+4} : All `, `${page+5} : All `]);	
		return res.json({"fulfillmentMessages" : books});
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
		if(rows.length > 20){
			return res.json({"fulfillmentMessages" : fb.quickReplies(
				`There are more than 20 books, to be exact there are ${rows.length} books. \n Type: ${category} 1 to get the first 10 books! Or click one of these!`, 
				[
					`${category} 1`,
					`${category} 5`,
					`${category} 10`,
					`${category} 100`,
				])});

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

