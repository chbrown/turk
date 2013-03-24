var request = require('request');
var winston = require('winston');
var util = require('util');
var uri = require('./uri');
var xml = require('./xml-native');
var helpers = require('./helpers');

module.exports = function (config) {
  // setup logging
  var logger = new winston.Logger({
    transports: [
      new winston.transports.File({
        filename: __dirname + '/../log/mturk.log',
        timestamp: true,
        colorize: true,
        level: config.log && config.log.level || 'info'
      })
    ]
  });

  function loginfo(requestId, message, meta) {
    logger.info('[' + requestId + '] - ' + message, meta);
  }

  function logerror(requestId, message, meta) {
    logger.error('[' + requestId + '] - ' + message, meta);
  }

  function doRequest(service, operation, method, params, callback) {
    var requestId = Math.floor(Math.random() * 1000000000);
    var calledback = false;
    var lcMethod = method.toLowerCase();
    var requestArgs = {
      method: method,
      encoding: 'utf8'
    };
    var rawBody;

    if (lcMethod == 'post') {
      requestArgs.body = uri.encodeParams(service, operation, params);
      requestArgs.uri = uri.postURI();
      requestArgs.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }
    else if (lcMethod == 'get') {
      requestArgs.uri = uri(service, operation, params);
    }
    else {
      callback(new Error('Invalid method: ' + method));
      logerror('Invalid method: ' + method);
      return;
    }

    function error(err) {
      if (err && !calledback) {
        calledback = true;
        if (!err instanceof Error) err = new Error(err);
        logerror(requestId, 'Error performing MTurk request', {
          error: err.message
        });
        callback(err);
      }
    }

    requestArgs.onResponse = function (err, response) {
      if (err) {
        error(err);
        return;
      }
      if (response.statusCode >= 300) {
        error("Request to " + requestArgs.uri + ' (' + requestArgs.method + ') failed with status code ' + response.statusCode);
      }
    };

    loginfo(requestId, 'Mturk <-', {
      service: service,
      operation: operation,
      params: JSON.stringify(params),
      requestArgs: JSON.stringify(requestArgs)
    });

    var req = request(requestArgs);
    req.on('error', function (err) {
      error(err);
    });
    req.on('data', function (data) {
      loginfo(requestId, 'Mturk ->', {
        data: data.toString()
      });
    });

    xml.decodeReadStream(req, function (err, decodedBody) {
      var responseRootKey = operation + "Response";
      var responseRoot;
      var errors;

      if (err) {
        error(err);
        return;
      }
      else {
        loginfo(requestId, 'Mturk ->', {
          decodedResponseBody: JSON.stringify(decodedBody)
        });
      }

      if (decodedBody) responseRoot = decodedBody[responseRootKey];
      if (!responseRoot) {
        error('Response should contain root element named ' + responseRootKey);
        return;
      }

      var operationRequest = responseRoot.OperationRequest;
      if (!operationRequest) {
        error('OperationRequest node not found on response root node');
        return;
      }

      if (operationRequest.Errors) {
        errors = operationRequest.Errors.Error;
        // Error may be an array or a string, we have to generalize as an array
        if (!Array.isArray(errors)) {
          errors = [errors];
        }
        errors = errors.map(function (err) {
          if (typeof (err) !== 'string') {
            return JSON.stringify(err);
          }
          return err;
        });
        error(new Error("Error performing operation " + operation + ": " + errors.join(', ')));
        return;
      }

      // We don't need this part of the response from mturk if we don't have errors
      delete responseRoot.OperationRequest;

      // Be sure we don't callback more than once
      if (!calledback) {
        calledback = true;
        callback(err, responseRoot); // reply with the response root instead of the absolute root. we don't need it.
      }
    });
  }

  /**
   * Request an operation to Mechanical Turk using the AWS RESTful API
   *
   * @param {String} service The service name.
   * @param {String} operation The operation name.
   * @param {String} method The HTTP method ("POST" or "GET")..
   * @param {Object} params An object containing the operation arguments.
   * @param {Function} callback A function with the signature: (error, response)
   *
   */
  return function (service, operation, method, params, callback) {
    var timestamp = new Date().toISOString();
    var completeParams = helpers.extend({}, params, {
      AWSAccessKeyId: config.accessKeyId,
      Timestamp: timestamp,
      Signature: helpers.sign(config.secretAccessKey, service, operation, timestamp)
    });
    // completeParams.ResponseGroup = ['Minimal', 'Request'];

    doRequest(service, operation, method, completeParams, callback);
  };
};
