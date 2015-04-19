var util = require('util');

function APIError(code, message) {
  Error.call(this);
  this.code = code;
  this.message = message;
}
util.inherits(APIError, Error);
APIError.prototype.toString = function() {
  return this.code + ': ' + this.message;
};

exports.APIError = APIError;
