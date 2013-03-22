var helpers = require('../lib/helpers');

module.exports = function(config) {
  return function(req, res, next) {
    var timestamp = req.params.Timestamp;
    var service = "AWSMechanicalTurkRequesterNotification";
    var operation = "Notify";
    // var awsSignature = req.params.Signature;
    var awsSignature = helpers.sign(config.secretAccessKey, service, operation, timestamp);

    if (!awsSignature) {
      next(new Error('Invalid signature'));
    }
    else {
      next();
    }
  };
};
