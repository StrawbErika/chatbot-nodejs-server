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
		switch(action){
			case 'inputWelcome':
				output["fulfillmentText"] = "Welcome to book rental! What would you like me to call you?";
				return res.json(output);
				break;
			case 'getName':
				return library.addUser(db, req, res);
				break;
			case 'getBookTitle':
				return library.getBookTitle(db, req, res);
				break;
			case 'getBookAuthor':
				return library.getBookAuthor(db, req, res);
				break;
			case 'getBookCategory':
				return library.getBookCategory(db, req, res);
				break;
			 case 'returnBook':
				return library.returnBook(db, req, res);
				break;
			case 'borrowBook':
				return library.borrowBook(db, req, res);
				break;
			case 'showAllBooks':
				return library.showAllBooks(db, req, res);
				break;
			case 'showAvailableBooks':
				return library.showAvailableBooks(db, req, res);
				break;
			case 'showBorrowedBooks':
				console.log("hey")
				return library.showBorrowedBooks(db, req, res);
				break;
			case 'showUnavailableBooks':
				return library.showUnavailableBooks(db, req, res);
				break;

		}
	});
	api.get('/getName',function (req,res){
		res.send('Swarup Bam');
	});
	api.get('/', (req, res) => {
		res.send('fite me')
	});


	return api;
}
