//https://us-central1-book-rental-95009.cloudfunctions.net/helloWorld
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
				output["fulfillmentText"] = `Hi ${parameters.name}, Is there anything you would want to do?`;
				return res.json(output);
				break;
			case 'getBookTitle':
				output["fulfillmentText"] = `I'll get ${parameters.title}! Is there anything else you would like to do?`;
				return res.json(output);
				break;
			case 'getBookAuthor':
				return library.getBookAuthor(db, req, res);
				break;
			case 'getBookCategory':
				output["fulfillmentText"] = `I'll get books in category: ${parameters.category}. Is there anything else you would like to do?`;
				return res.json(output);
				break;
 			case 'returnBook':
				output["fulfillmentText"] = `Thanks for returning ${parameters.returned}. Is there anything else you would like to do?`;
				return res.json(output);
				break;
			case 'borrowBook':
				output["fulfillmentText"] = `Here is ${parameters.borrowed}. Is there anything else you would like to do?`;
				return res.json(output);
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
