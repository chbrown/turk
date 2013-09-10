'use strict'; /*jslint es5: true, node: true, indent: 2 */
var _ = require('underscore');
var crypto = require('crypto');

exports.sign = function(secretAccessKey, service, operation, timestamp) {
  /** sign: Generate a Mechanical Turk signature

  secretAccessKey: String
      Your secret access key to AWS.
  service: String
      The service name
  operation: String
      The operation to perform
  timestamp: String
      The timestamp to be sent with the mturk message.

  Returns a string with the base64-encoded signature
  */
  var hmac = crypto.createHmac('sha1', secretAccessKey);
  hmac.update(service + operation + timestamp);
  return hmac.digest('base64');
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
