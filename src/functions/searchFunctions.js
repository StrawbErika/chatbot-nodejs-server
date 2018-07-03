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
		if(rows.length > 100){
			var pages = [];
			for(var i = 0; i < 10; i++) {
				var pageNum = `${i+1} : All `;
				pages.push(pageNum);
			}
			return res.json({"fulfillmentMessages" : [fb.quickReplies(
				`There are more than 100 books, to be exact there are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : All to get the first 10 books! Or click one of these!`, pages)]});
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
            var categories = 'Here are the categories: \n';
            for(var i = 0; i < rows.length; i++) {
                categories += rows[i].category;
            }
            return res.json({ fulfillmentText: categories});
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

		if(rows.length > 100){
			var pages = [];
			if((rows.length/10) > 10){
				var limit = 10;
			}
			else{
				var limit = rows.length
			}
			for(var i = 0; i < limit; i++) {
				var pageNum = `${i+1} : Available `;
				pages.push(pageNum);						
			}
			return res.json({"fulfillmentMessages" : [fb.quickReplies(
				`There are more than 100 books, to be exact there are ${rows.length} books. \nThere are ${Math.ceil(rows.length/10)} pages  \n Type 1 : Available to get the first 10 books! Or click one of these!`, pages)]});
		}
		else{
			var pages = [];
			for(var i = 0; rows.length/10 < 10; i++) {
				var pageNum = `${i+1} : Available `;
				pages.push(pageNum);						
			}
			return res.json({"fulfillmentMessages" : [fb.quickReplies(
				`There are ${rows.length} books. \n Type: 1 : Available to get the first 10 books! Or click one of these!`, pages)]});
		}
	});
}

export function availablePages(db, req, res) {
    const queryString = 'SELECT title, author, img FROM book where uid is null ORDER by title ASC';
	var page = (req.body.queryResult.parameters.page);
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
		var pageNum = getLastPage(page, rows.length);
		var msg = `Here are the available books from ${startingPage} to ${pageNum}:`;
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages('Available', page, rows.length, ''));
		}, 3000)
		return res.json({"fulfillmentMessages" : books});
    })
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
				if(rows.length > 100){
					var pages = [];
					for(var i = 0; i < 10; i++) {
						var pageNum = `Title ${i+1} : ${title} `;
						pages.push(pageNum);						
					}

					return res.json({"fulfillmentMessages" : [fb.quickReplies(
						`There are more than 100 books, to be exact there are ${rows.length} books. So there are ${Math.ceil(rows.length/10)} pages \n Type: Title 1 : ${title} to get the first 10 books! Or click one of these!`, pages)]});
				}
				else{
					var pages = [];
					for(var i = 0; rows.length/10 < 10; i++) {
						var pageNum = `Category ${i+1} : ${category} `;
						pages.push(pageNum);						
					}
					return res.json({"fulfillmentMessages" : [fb.quickReplies(
						`There are ${rows.length} books. So there are ${Math.ceil(rows.length/10)} pages\n Type: Category 1 : ${category} to get the first 10 books! Or click one of these!`, pages)]});
				}
	
			}
        }
	});
}

export function getBookCategory(db, req, res) {
    const category = req.body.queryResult.parameters.category;
    const queryString = 'SELECT title, author, category, img FROM book WHERE category like?';
	db.query(queryString, '%' + category + '%', (err, rows) => {
        if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `We don't have anything in ${category}! :'(`});
		}
		else{
			if(rows.length > 100){
				var pages = [];
				for(var i = 0; i < 10; i++) {
					var pageNum = `Category ${i+1} : ${category} `;
					pages.push(pageNum);						
				}
				return res.json({"fulfillmentMessages" : [fb.quickReplies(
					`There are more than 100 books, to be exact there are ${rows.length} books. So there are ${Math.ceil(rows.length/10)} pages\nType: Category 1 : ${category} to get the first 10 books! Or click one of these!`, pages)]});
			}
			else{
				var pages = [];
				for(var i = 0; rows.length/10 < 10; i++) {
					var pageNum = `Category ${i+1} : ${category} `;
					pages.push(pageNum);						
				}
				return res.json({"fulfillmentMessages" : [fb.quickReplies(
					`There are ${rows.length} books. So there are ${Math.ceil(rows.length/10)} pages\nType: Category 1 : ${category} to get the first 10 books! Or click one of these!`, pages)]});
			}
		}
    })
}

export function categoryPages(db, req, res) {
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	var page = req.body.queryResult.parameters.page;
    const category = req.body.queryResult.parameters.category;
    const queryString = 'SELECT title, author, category, img FROM book WHERE category like?';
	db.query(queryString, '%' + category + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		var pageNum = getLastPage(page, rows.length);
		var msg = `Here are ${category} books: from ${startingPage} to ${pageNum}:`;
		var qr = [`Category ${page+1} : ${category} `, `Category ${page+2} : ${category} `, `Category ${page+3} : ${category} `, `Category ${page+4} : ${category} `, `Category ${page+5} : ${category} `];
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages(category, page, rows.length, 'Category'));
		}, 3000)
		return res.json({"fulfillmentMessages" : books});
    })
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
		var pageNum = getLastPage(page, rows.length);
		var msg = `Here are books with title: ${ptitle} from ${startingPage} to ${pageNum}:`;
		var qr = [`${page+1} : ${ptitle} `, `${page+2} : ${ptitle} `, `${page+3} : ${ptitle} `, `${page+4} : ${ptitle} `, `${page+5} : ${ptitle} `];
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages(ptitle, page, rows.length, 'Title'));
		}, 3000)
		return res.json({"fulfillmentMessages" : books});
    })
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
		var pageNum = getLastPage(page, rows.length);
		var msg = `Here are the books from ${startingPage} to ${pageNum}:`;
		var qr = [`${page+1} : All `, `${page+2} : All `, `${page+3} : All `, `${page+4} : All `, `${page+5} : All `];
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages('All', page, rows.length, ''));
		}, 3000)
		return res.json({"fulfillmentMessages" : books});
    })
}

export function sliceTitleAuthorImg(title, author, img){
	return fb.fbCard(title.slice(1,-1), author.slice(1,-1), img.slice(1,-1));
}

export function getLastPage(page, length){
	if(page === Math.floor((length/10))+1){
		const excess = length % 10;
		var pageNum = (page-1) * 10 + excess;
	}
	else{
		pageNum = page * 10
	}
	return pageNum
}

export function getQRPages(pageName, page, length, keyword){
	var lastPage = Math.ceil(length/10);
	if(page === lastPage){
		var qr = [`${keyword} ${page-1} : ${pageName} `, `${keyword} ${page-2} : ${pageName} `, `${keyword} ${page-3} : ${pageName} `, `${keyword} ${page-4} : ${pageName} `, `${keyword} ${page-5} : ${pageName} `];
	}else if(page > (lastPage-5)){
		var qr = [`${keyword} ${page+1} : ${pageName} `, `${keyword} ${page+2} : ${pageName} `, `${keyword} ${page+3} : ${pageName} `, `${keyword} ${page+4} : ${pageName} `, `${keyword} ${page+5} : ${pageName} `];
		var qr = qr.slice(0,lastPage-page);
	}
	else{
		var qr = [`${keyword} ${page+1} : ${pageName} `, `${keyword} ${page+2} : ${pageName} `, `${keyword} ${page+3} : ${pageName} `, `${keyword} ${page+4} : ${pageName} `, `${keyword} ${page+5} : ${pageName} `];
	}
	return qr;
}