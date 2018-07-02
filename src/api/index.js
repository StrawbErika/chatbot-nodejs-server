import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import * as library from '../functions/library';
import * as user from '../functions/userFunctions';
import * as search from '../functions/searchFunctions';

// 2 slides containing end to end system 
// Intro what bot does : my bot does this, Methodologies [tech etc ahha]
// UI 
//BROADCAST WEB APP 

export default ({ config, db }) => {
	let api = Router();

	api.post('/library', (req, res) => {
		const action = req.body.queryResult.action;
		const output = {"fulfillmentText" : " "};
		const parameters = req.body.queryResult.parameters;
		console.log(action)
		switch(action){ //switch case for actions chosen by the user
			case 'inputWelcome':
				output["fulfillmentText"] = "Welcome to book rental! What would you like me to call you?";
				console.log(req.body);
				return res.json(output);
			case 'getName':
				return user.checkUser(db, req, res);
			case 'help':
				return user.help(db, req, res);
				
			case 'getBookAuthor':
				return search.getBookAuthor(db, req, res);

			case 'getBookTitle':
				return search.getBookTitle(db, req, res);
			case 'titlePages':
				return search.titlePages(db, req, res);

			case 'getBookCategory':
				return search.getBookCategory(db, req, res);
			case 'categoryPages':
				return search.categoryPages(db, req, res);
			case 'showAllCategories':
				return search.showAllCategories(db, req, res);

			case 'returnBook':
				return library.returnBook(db, req, res);
			case 'borrowBook':
				return library.borrowBook(db, req, res);

			case 'showAllBooks':
				return search.showAllBooks(db, req, res);
			case 'allPages':
				return search.allPages(db, req, res);
				
			case 'showAvailableBooks':
				return search.showAvailableBooks(db, req, res);
			case 'availablePages':
				return search.availablePages(db, req, res);

			case 'showBorrowedBooks':
				return search.showBorrowedBooks(db, req, res);
			case 'showUnavailableBooks':
				return search.showUnavailableBooks(db, req, res);

		}
	});

	api.get('/', (req, res) => {
		res.send('fite me');
	});


	return api;
}
