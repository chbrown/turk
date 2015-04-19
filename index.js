var url = require('url');
var util = require('util');

var _ = require('lodash');
var request = require('request');
var logger = require('loge');
var xmlconv = require('xmlconv');

var errors = require('./lib/errors');
var misc = require('./lib/misc');
var models = exports.models = require('./lib/models');
var operations = require('./lib/operations');

var Connection = exports.Connection = function(accessKeyId, secretAccessKey, opts) {
  this.accessKeyId = accessKeyId;
  this.secretAccessKey = secretAccessKey;
  this.url = opts.url || 'https://mechanicalturk.amazonaws.com';
  this.logger = opts.logger || logger;
};
Object.keys(operations).forEach(function(operation_name) {
  Connection.prototype[operation_name] = function(params, callback) {
    this.post(operation_name, params, callback);
  };
});

Connection.prototype.post = function(operation, params, callback) {
  /** Post a request to Mechanical Turk using the AWS RESTful API

  operation: String
      The name of the operation
  params: Object
      An object containing the operation arguments and name.
  callback: function(Error | null, Object | null)
      Callback function for when we receive a response after we parse the returned XML.
  */
  var self = this;
  // every option must be submitted with the field "Operation" =
  //   <whatever the name of the operation is, a string>
  params = _.extend({
    Service: 'AWSMechanicalTurkRequester',
    Operation: operation,
    Version: '2008-08-02',
    AWSAccessKeyId: this.accessKeyId,
    Timestamp: new Date().toISOString(),
  }, params);

  params.Signature = misc.sign(this.secretAccessKey, params.Service, params.Operation, params.Timestamp);

  var form = misc.awsSerialize(params);
  this.logger.debug('POST %s', operation, form);

  request.post({form: form, url: this.url}, function(err, response, xml) {
    // request might return an error
    if (err) return callback(err);

    self.logger.debug('Response: ' + xml);
    // AMT API might return an error
    var json = xmlconv(xml, {convention: 'castle'});
    var json_response = json[operation + 'Response'];
    var json_result = json_response[operation + 'Result'];
    // console.dir(JSON.stringify(json_response));
    // console.dir(json_result);
    if (json_result && json_result.Request.IsValid.toLowerCase() !== 'true') {
      var error_data = json_result.Request.Errors.Error;
      return callback(new errors.APIError(error_data.Code, error_data.Message));
    }
    callback(err, json_response);
  });
};

Connection.prototype.get = function(operation, params, callback) {
  throw new Error('This method is not yet implemented.');
  // var urlObj = url.parse();
  // urlObj.query = misc.awsSerialize(extra_params);
  // url.format(urlObj);
  // ...
  // request.get({});
};

Connection.operations = operations;
Connection.models = models;
