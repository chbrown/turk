'use strict'; /*jslint es5: true, node: true, indent: 2 */
var util = require('util');

var APIError = exports.APIError = function(code, message) {
  Error.call(this);
  this.code = code;
  this.message = message;
};
util.inherits(APIError, Error);
APIError.prototype.toString = function() {
  return this.code + ': ' + this.message;
};
