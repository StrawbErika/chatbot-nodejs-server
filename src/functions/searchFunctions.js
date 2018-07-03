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
		var pages = [];
		if((rows.length/10) > 10){
			var limit = 10;
		}
		else{
			var limit = Math.ceil(rows.length/10)
		}
		for(var i = 0; i < limit; i++) {
			var pageNum = `${i+1} : All `;
			pages.push(pageNum);						
		}
		return res.json({"fulfillmentMessages" : [fb.quickReplies(
			`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : All to get the first 10 books! Or click one of these!`, pages)]});
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

		var pages = [];
		if((rows.length/10) > 10){
			var limit = 10;
		}
		else{
			var limit = Math.ceil(rows.length/10)
		}
		for(var i = 0; i < limit; i++) {
			var pageNum = `${i+1} : Available `;
			pages.push(pageNum);						
		}
		return res.json({"fulfillmentMessages" : [fb.quickReplies(
			`There are ${rows.length} books. \nThere are ${Math.ceil(rows.length/10)} pages  \n Type 1 : Available to get the first 10 books! Or click one of these!`, pages)]});
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
	const queryString = 'SELECT title, author, category FROM book WHERE author like?';
	db.query(queryString, '%' + author + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}

		if(!rows.length) {
			return res.json({ fulfillmentText: `${author} has no books!`});
		}
        else{
			var pages = [];
			if((rows.length/10) > 10){
				var limit = 10;
			}
			else{
				var limit = Math.ceil(rows.length/10);
			}
			for(var i = 0; i < limit; i++) {
				var pageNum = `A ${i+1} : ${author} `;
				pages.push(pageNum);						
			}
			if(pageNum.length > 20){
				return res.json({"fulfillmentText" :
					`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : ${author} to get the first 10 books!`});
			}				
			return res.json({"fulfillmentMessages" : [fb.quickReplies(
				`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : ${author} to get the first 10 books! Or click one of these!`, pages)]});
        }
	});
}

export function authorPages(db, req, res) {
	const id = req.body.originalDetectIntentRequest.payload.data.sender.id;
	var page = req.body.queryResult.parameters.page;
    const author = req.body.queryResult.parameters.author;
	const queryString = 'SELECT title, author, img FROM book WHERE author like?';
	db.query(queryString, '%' + author + '%', (err, rows) => {
		if(err) {
			console.log(err);
			return res.json({ fulfillmentText: `Error!` });
		}
		if(!rows.length) {
			return res.json({ fulfillmentText: 'There are no books in the db!'});
		}
		const startingPage = (page-1)*10;
		var pageNum = getLastPage(page, rows.length);
		var msg = `Here are books by ${author}: from ${startingPage} to ${pageNum}:`;
		var qr = [`A ${page+1} : ${author} `, `A ${page+2} : ${author} `, `A ${page+3} : ${author} `, `A ${page+4} : ${author} `, `A ${page+5} : ${author} `];
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages(category, page, rows.length, 'A'));
		}, 3000)
		return res.json({"fulfillmentMessages" : books});
    })
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
				var borrow = `Borrow ${title}`
				if(borrow.length > 20){ 
					return res.json({"fulfillmentText" : `Would you like to borrow that book? Type: ${borrow}`}); 
				}
				return res.json({"fulfillmentMessages" : fb.quickReplies(
					`Would you like to borrow that book? Click this!`, 
					[
					borrow	,
					])});
			}
			else{
				var pages = [];
				if((rows.length/10) > 10){
					var limit = 10;
				}
				else{
					var limit = Math.ceil(rows.length/10)
				}
				for(var i = 0; i < limit; i++) {
					var pageNum = `T ${i+1} : ${title} `;
					pages.push(pageNum);						
				}
				if(pageNum.length > 20){
					return res.json({"fulfillmentText" :
						`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : ${title} to get the first 10 books!`});
				}				
				return res.json({"fulfillmentMessages" : [fb.quickReplies(
					`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : All to get the first 10 books! Or click one of these!`, pages)]});
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
			var pages = [];
			if((rows.length/10) > 10){
				var limit = 10;
			}
			else{
				var limit = Math.ceil(rows.length/10);
			}
			for(var i = 0; i < limit; i++) {
				var pageNum = `C ${i+1} : ${category} `;
				pages.push(pageNum);						
			}
			if(pageNum.length > 20){
				return res.json({"fulfillmentText" :
					`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : ${title} to get the first 10 books!`});
			}				
			return res.json({"fulfillmentMessages" : [fb.quickReplies(
				`There are ${rows.length} books. \n So there are ${Math.ceil((rows.length)/10)} pages \n Type: 1 : All to get the first 10 books! Or click one of these!`, pages)]});
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
		var qr = [`C ${page+1} : ${category} `, `C ${page+2} : ${category} `, `C ${page+3} : ${category} `, `C ${page+4} : ${category} `, `C ${page+5} : ${category} `];
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages(category, page, rows.length, 'C'));
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
		var qr = [`T ${page+1} : ${ptitle} `, `${page+2} : ${ptitle} `, `${page+3} : ${ptitle} `, `${page+4} : ${ptitle} `, `${page+5} : ${ptitle} `];
		var books = [];
		for(var i = startingPage; i < pageNum; i++) {
			books.push(sliceTitleAuthorImg(rows[i].title, rows[i].author, rows[i].img));
		}
		setTimeout(() => {
			fb.pushQuickReplies(id, msg, getQRPages(ptitle, page, rows.length, 'T'));
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