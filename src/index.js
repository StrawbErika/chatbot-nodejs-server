import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
<<<<<<< HEAD
	app.use('/', api({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
		console.log(`Started on port ${app.server.address()}`);
=======
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
>>>>>>> 9b8c005a38a0de820eac7e319e81b4318c320630
	});
});

export default app;
