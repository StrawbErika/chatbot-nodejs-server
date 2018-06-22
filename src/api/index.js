import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

export default ({ config, db }) => {
	let api = Router();

	api.post('/post', (req, res) => {
		const action = req.body.queryResult.action;
		const output = {"Speech" : " ", "displayText" : " "}
		switch(action){
			case 'inputWelcome':
				output["Speech"] = "Welcome to book rental! What would you like me to call you?"
				output["displayText"] = "Welcome to book rental! What would you like me to call you?"
				return res.json(output);
				break;
			}
	})
	api.get('/getName',function (req,res){
		res.send('Swarup Bam');
	});
	api.get('/', (req, res) => {
		res.send('fite me')
	});

	return api;
}
