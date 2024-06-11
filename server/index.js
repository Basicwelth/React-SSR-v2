'use strict';
const path = require('path');
const nodemon = require('nodemon');
const register = require('react-server-dom-webpack/node-register');
const babelRegister = require('@babel/register');
const express = require('express');
const fs = require('fs');
const { renderToPipeableStream } = require('react-server-dom-webpack/server');
const { createElement } = require('react');


register();
babelRegister({
  ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
  presets: [['@babel/preset-react', {runtime: 'automatic'}]],
  plugins: ['@babel/transform-modules-commonjs'],
});
function handleErrors(fn) {
	return async function(req, res, next) {
		try {
			return await fn(req, res);
		} catch (x) {
			next(x);
		}
	};
}
nodemon({
	script: path.resolve(process.cwd(), "scripts/build.js")
}).on('exit', () => {

	const PORT = process.env.PORT || 4000;
	const app = express();

	app.use(express.json());
	app.use(express.static('build'));
	app.use(express.static('public'))

	app.listen(PORT, 'localhost', null, () => {
		console.log(`Listening at ${PORT}...`);
	})
	.on('error', (error) => {
		if (error.syscall !== 'listen') {
			throw error;
		}
		const isPipe = portOrPipe => Number.isNaN(portOrPipe);
		const bind = isPipe(PORT) ? 'Pipe ' + PORT : 'Port ' + PORT;
		switch (error.code) {
			case 'EACCES': {
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			}
			case 'EADDRINUSE': {
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			}
			default: throw error;
		}
	});

	app.get('/', handleErrors(
		async function(_req, res) {
			// await waitForWebpack();
			const html = fs.readFileSync(path.resolve(__dirname, '../build/index.html'), 'utf8');
			res.send(html);
		})
	);

	app.get('/rsc', async function(req, res) {
		const { App } = require('../src/App');
		const { pipe } = renderToPipeableStream(createElement(App));
		return pipe(res);
	});

}).on('crash', (err) => {
	console.error("Errors in scripts/build.js");
	console.error(err.stack);
});
//
// async function waitForWebpack() {
//   while (true) {
// 	try {
// 	  fs.readFileSync(path.resolve(__dirname, '../build/index.html'));
// 	  return;
// 	} catch (err) {
// 	  console.log('Could not find webpack build output. Will retry in a second...');
// 	  await new Promise((resolve) => setTimeout(resolve, 1000));
// 	}
//   }
// }
