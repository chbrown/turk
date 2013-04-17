'use strict'; /*jslint nomen: true, es5: true, node: true */
var operations = require('./operations');
var models = require('./models');
var errors = require('./errors');
var xml_mapping = require('xml-mapping');
var helpers = require('./helpers');
var request = require('request');
var url = require('url');
var util = require('util');
var __ = require('underscore');

/**
 * Request an operation to Mechanical Turk using the AWS RESTful API
 *
 * @param {Object} params An object containing the operation arguments and name.
 * @param {Function} callback A function with the signature: (error, response)
 *
 */
function post(op_name, extra_params, config, callback) {
  var params = __.extend({
    Service: 'AWSMechanicalTurkRequester',
    Operation: op_name,
    Version: '2008-08-02',
    AWSAccessKeyId: config.accessKeyId,
    Timestamp: new Date().toISOString(),
  }, extra_params);
  params.Signature = helpers.sign(config.secretAccessKey,
    params.Service, params.Operation, params.Timestamp);

  var form = helpers.awsSerialize(params);
  if (config.logger) {
    var form_inspect = util.inspect(form, {depth: null});
    config.logger.debug('POSTing ' + op_name + ': ' + form_inspect);
  }

  request.post({form: form, url: config.url}, function(err, response, xml) {
    // request might return an error
    if (err) {
      return callback(err);
    }
    // AMT API might return an error
    var json = helpers.xml2json(xml);
    var json_response = json[op_name + 'Response'];
    var json_result = json_response[op_name + 'Result'];
    // console.dir(JSON.stringify(json_response));
    // console.dir(json_result);
    if (json_result && json_result.Request.IsValid.toLowerCase() !== 'true') {
      var error_data = json_result.Request.Errors.Error;
      return callback(new errors.APIError(error_data.Code, error_data.Message));
    }
    callback(err, json_response);
  });
}

function get(extra_params, config, callback) {
  // ...
  throw new Error('This method is not yet implemented.');

  var urlObj = url.parse();
  urlObj.query = helpers.awsSerialize(extra_params);
  url.format(urlObj);
  // ...

  request.get({});
}

module.exports = function(config) {
  var mechturk = {};
  // ret.HITType = require('./model/hit_type')(config);
  // ret.Notification = require('./model/notification')(config);
  // ret.Assignment = require('./model/assignment')(config);

  var opWrapper = function(op_name) {
    // basically a closure to wrap in the config
    // callback signature: (err, result)
    // every option must be submitted with the field "Operation" = <whatever the name of the operation is, a string>
    return function(params, callback) {
      post(op_name, params, config, function (err, response) {
        // new helpers.Checker().check(operation, 'Operation not found').notNull().callback(function(errors) {
        // don't check for now, so this is basically a pass-through
        if (err) return callback(err);
        callback(null, response);
      });
    };
  };

  for (var op_name in operations.operations) {
    mechturk[op_name] = opWrapper(op_name);
  }

  return mechturk;
};

module.exports.operations = operations;
module.exports.models = models;
