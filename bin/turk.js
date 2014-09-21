#!/usr/bin/env node
/*jslint node: true */
var logger = require('loge');
var turk = require('..');

var parseParams = function(args) {
  var params = {};
  args.forEach(function(arg) {
    var pair = arg.match('(.+)=(.+)');
    params[pair[1]] = pair[2];
  });
  return params;
};

var optimist = require('optimist')
  .usage([
    'Usage: turk <options>',
    '',
    'You should have two environmental variables available:',
    '  AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
    '',
    'examples:',
    '  turk Operation=SearchQualificationTypes',
  ].join('\n'))
  .describe({
    help: 'print this help message',
    verbose: 'print extra output',
    version: 'print version',
  })
  .boolean(['help', 'verbose', 'version'])
  .default({
    Service: 'AWSMechanicalTurkRequester',
    Version: '2012-03-25',
    Timestamp: new Date().toISOString(),
  });

var argv = optimist.argv;
logger.level = argv.verbose ? 'debug' : 'info';

if (argv.version) {
  console.log(require('../package').version);
}
else if (argv.help) {
  return optimist.showHelp();
}
else {
  var params = parseParams(argv);
  var connection = new turk.Connection(
    process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, {logger: logger});
  connection.post(null, params, function(err, response) {
    if (err) return console.error(err);

    console.dir(response);
  });
}
