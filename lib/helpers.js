var crypto = require('crypto');

/**
 * Extend an object.
 *
 * @param {Object} destination The original object, will be altered by reference.
 * @param {Object} source1 Source 1, any properties will overwrite onto destination.
 * @param {Object} source2 Source 2, any properties will overwrite source 1 and destination.
 * @param {Object} source3 Source 3, ...
 *
 * @return {Object} Return destination
 */
exports.extend = function(destination /*, sources */) {
  for (var i = 1, length = arguments.length; i < length; i++) {
    var source = arguments[i];
    for (var key in source)
      destination[key] = source[key];
  }
  return destination;
};


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
exports.sign = function(secretAccessKey, service, operation, timestamp) {
  var hmac = crypto.createHmac('sha1', secretAccessKey);
  hmac.update(service + operation + timestamp);
  return hmac.digest('base64');
};
