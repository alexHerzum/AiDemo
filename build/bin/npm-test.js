var helper = require('./bin-helper');

helper.chain([
	// Old jQuery versions
	[helper.npmNormalize('./node_modules/.bin/bower'), ['install', 'jquery#1.7.2']],
	[helper.npmNormalize('./node_modules/.bin/grunt'), ['test']],
	[helper.npmNormalize('./node_modules/.bin/bower'), ['install', 'jquery#1.8.3']],
	[helper.npmNormalize('./node_modules/.bin/grunt'), ['test']],

	// Modern jQuery versions which require jquery-migrate plugin to work
	[helper.npmNormalize('./node_modules/.bin/bower'), ['install', 'jquery-migrate#1.2.1']],
	[helper.npmNormalize('./node_modules/.bin/bower'), ['install', 'jquery#1.10.1']],
	[helper.npmNormalize('./node_modules/.bin/grunt'), ['test']],
	[helper.npmNormalize('./node_modules/.bin/bower'), ['install', 'jquery-migrate#1.2.1']],
	[helper.npmNormalize('./node_modules/.bin/bower'), ['install', 'jquery#2.1.0']],
	[helper.npmNormalize('./node_modules/.bin/grunt'), ['test']]
]);
