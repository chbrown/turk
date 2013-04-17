'use strict'; /*jslint nomen: true, es5: true, node: true */
var APIError = exports.APIError = function(code, message) {
  this.code = code;
  this.message = message;
};
APIError.prototype.toString = function() {
  return this.code + ': ' + this.message;
};
