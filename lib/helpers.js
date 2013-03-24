'use strict'; /*jslint nomen: true, node: true, es5: true */
var crypto = require('crypto');
var util = require('util');
var validator = require('validator');
var request = require('request');
var url = require('url');
var libxml = require('libxmljs');
var __ = require('underscore');


/**
 * Generate a Mechanical Turk signature
 *
 * @param {String} secretAccessKey Your secret access key to AWS.
 * @param {String} service The service.
 * @param {String} operation The operation.
 * @param {String} operation The timestamp to be sent with the mturk message.
 *
 * @return {String} Return the base64-encoded signature
 */
var sign = exports.sign = function(secretAccessKey, service, operation, timestamp) {
  var hmac = crypto.createHmac('sha1', secretAccessKey);
  hmac.update(service + operation + timestamp);
  return hmac.digest('base64');
};


var Checker = exports.Checker = function() {
  this._errors = []; // already exists, but anyway
  this._valid = true;
};
util.inherits(Checker, validator.Validator);

Checker.prototype.error = function (msg) {
  this._valid = false;
  this._errors.push(msg);
  return this;
};
Checker.prototype.getErrors = function () {
  return this._errors;
};
Checker.prototype.isValid = function () {
  return this._valid;
};
Checker.prototype.valid = function (callback) {
  // callback signature: function() {}
  if (this.isValid()) callback();
};
Checker.prototype.invalid = function (callback) {
  // callback signature: function(errors) {}
  if (!this.isValid()) callback(this.getErrors());
};
Checker.prototype.callback = function (callback, payload) {
  // callback signature: function() {}
  if (this.isValid()) callback(null, payload);
  else callback(this.getErrors(), payload);
};

// &QualificationRequirement.1.QualificationTypeId=789RVWYBAZW00EXAMPLE
// &QualificationRequirement.1.IntegerValue=18
// &QualificationRequirement.2.QualificationTypeId=237HSIANVCI00EXAMPLE
// &QualificationRequirement.2.IntegerValue=1

// &BonusAmount.1.Amount=5
// &BonusAmount.1.CurrencyCode=USD
// &Reason=Thanks%20for%20doing%20great%20work!

function awsSerialize(params) {
  var serialized = {};
  __.each(params, function (value, key) {
    if (__.isArray(value)) {
      __.each(value, function (item, index) {
        __.each(item, function (value, sub_key) {
          serialized[key + '.' + index + '.' + sub_key] = value;
        });
      });
    }
    else if (__.isObject(value)) {
      __.each(value, function (value, sub_key) {
        serialized[key + '.1.' + sub_key] = value;
      });
    }
    else {
      serialized[key] = value;
    }
  });
  return serialized;
}

function node2json(nodes) {
  var elements = nodes.filter(function(node) { return node.type() == 'element'; });
  var value = '';
  if (elements.length === 0) {
    value = nodes.map(function(node) { return node.text(); }).join(' ');
  }
  else {
    value = {};
    elements.forEach(function(node) {
      value[node.name()] = node2json(node.childNodes());
    });
  }
  return value;
}
/**
 * Turn XML into a javascript hash, ignoring namespaces, attributes, and text nodes that have element siblings.
 *
 * @param {String} xml A string of XML that libxmljs can parse.
 *
 * @return {String} Return a javascript object with one key-value pair. It will contain no lists.
 *
*/
function xml2json(xml) {
  var doc = libxml.parseXml(xml);
  var root = doc.root();
  var hash = {};
  hash[root.name()] = node2json(root.childNodes());
  return hash;
}

/**
 * Request an operation to Mechanical Turk using the AWS RESTful API
 *
 * // @param {String} service The service name.
 * @param {String} operation The operation name.
 * @param {String} method The HTTP method ("POST" or "GET")..
 * @param {Object} params An object containing the operation arguments.
 * @param {Function} callback A function with the signature: (error, response)
 *
 */
exports.request = function (operation, method, fields, config, callback) {
  var params = {
    Service: 'AWSMechanicalTurkRequester',
    Operation: operation,
    Version: '2008-08-02',
    AWSAccessKeyId: config.accessKeyId,
    Timestamp: new Date().toISOString(),
  };
  params.Signature = sign(config.secretAccessKey, params.Service, params.Operation, params.Timestamp);
  console.log('params', params);

  var args = {method: method, encoding: 'utf8'};
  var urlObj = url.parse(config.url);
  if (method.match(/post/i)) {
    args.form = awsSerialize(params);
  }
  else if (method.match(/get/i)) {
    urlObj.query = awsSerialize(params);
  }

  args.url = url.format(urlObj);
  request(args, function(err, response, data) {
    if (err) return callback(err);
    callback(err, err ? null : xml2json(data));
  });
};
