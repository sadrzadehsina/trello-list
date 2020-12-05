const { Async, compose, map } = require('crocks');
const axios = require('axios');
const chalk = require('chalk');

const env = require('./env.json');

const ctx = new chalk.Instance({ level: 3 });

// Printer Monad
const colorize = value => ({
	...value,
	title: ctx.bgRedBright.bold(value.title),
	body: ctx.bgBlackBright(value.body),
	link: ctx.underline(value.link),
})
const makeLine = value => `${value.title}\n${value.body}\n${value.link}`;
const logToConsole = value => {
	console.log(value);
	console.log('\n');
};

const Printer = value => ({
	chain: fn => value.map(fn),
	map: fn => Printer.of(value.map(fn)),
	inspect: () => `Printer(${value})`,
	return: () => value,
});

Printer.of = value => Printer(value);

// ==============================================

const prettyPrint = value => Printer.of(value)
	.map(colorize)
	.map(makeLine)
	.chain(logToConsole)

// Async Monad
const prop = key => obj => obj[key];

const parse = all => all.map(x => ({
	title: x.name,
	body: x.desc,
	link: x.shortUrl,
}));

const listGet = Async((reject, resolve) => {

	axios.get(
		`${env.BASE_URL}/lists/5e4f947054ffa756107f3bdb/cards?key=${env.TRELLO_KEY}&token=${env.TRELLO_TOKEN}`
	)
	.then(resolve)
	.catch(reject);

})
.map(prop('data'))
.map(parse);

listGet.fork(
	console.log.bind(null, 'rejected:'),
	prettyPrint,
);
// ==============================================