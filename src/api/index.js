import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import * as library from '../library';

export default ({ config, db }) => {
	let api = Router();

	api.post('/library', (req, res) => {
		const action = req.body.queryResult.action;
		const output = {"fulfillmentText" : " "};
		const parameters = req.body.queryResult.parameters;
		switch(action){ //switch case for actions chosen by the user
			case 'inputWelcome':
				output["fulfillmentText"] = "Welcome to book rental! What would you like me to call you?";
				return res.json(output);
			case 'getName':
				return library.addUser(db, req, res);
			case 'getBookTitle':
				return library.getBookTitle(db, req, res);
			case 'getBookAuthor':
				return library.getBookAuthor(db, req, res);
			case 'getBookCategory':
				return library.getBookCategory(db, req, res);
			 case 'returnBook':
				return library.returnBook(db, req, res);
			case 'borrowBook':
				return library.borrowBook(db, req, res);
			case 'showAllBooks':
				return library.showAllBooks(db, req, res);
			case 'showAvailableBooks':
				return library.showAvailableBooks(db, req, res);
			case 'showBorrowedBooks':
				return library.showBorrowedBooks(db, req, res);
			case 'showUnavailableBooks':
				return library.showUnavailableBooks(db, req, res);

		}
	});
	api.get('/', (req, res) => {
		res.send('fite me');
	});


	return api;
}
