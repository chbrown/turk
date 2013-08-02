'use strict'; /*jslint node: true, es5: true, indent: 2 */
var crypto = require('crypto');
var util = require('util');
var validator = require('validator');
var _ = require('underscore');


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

exports.awsSerialize = function(params) {
  // not recursive, but I think that's okay.
  var serialized = {};
  _.each(params, function (value, key) {
    if (_.isArray(value)) {
      // &QualificationRequirement.1.QualificationTypeId=789RVWYBAZW00EXAMPLE
      // &QualificationRequirement.1.IntegerValue=18
      // &QualificationRequirement.2.QualificationTypeId=237HSIANVCI00EXAMPLE
      // &QualificationRequirement.2.IntegerValue=1
      _.each(value, function (item, index) {
        _.each(item, function (value, sub_key) {
          serialized[key + '.' + index + '.' + sub_key] = value;
        });
      });
    }
    else if (value.toXML) {
      // not sure if this is the best approach. I really doubt it.
      // Maybe each possible AWS parameter object should inherit some AWSSerializable interace?
      serialized[key] = value.toXML();
    }
    else if (_.isObject(value)) {
      if (value.toJSON) value = value.toJSON();
      // &BonusAmount.1.Amount=5
      // &BonusAmount.1.CurrencyCode=USD
      _.each(value, function (value, sub_key) {
        serialized[key + '.1.' + sub_key] = value;
      });
    }
    else {
      // &Reason=Thanks%20for%20doing%20great%20work!
      serialized[key] = value;
    }
  });
  return serialized;
};
