'use strict'; /*jslint nomen: true, node: true, debug: true, vars: true, es5: true */
var xml_mapping = require('xml-mapping');
var check = require('validator').check;
var helpers = require('./helpers');
var __ = require('underscore');

var operations = [
  {
    name: 'ApproveAssignment',
    validateRequest: function(fields, callback) {
      new helpers.Checker().check(fields.AssignmentId, 'AssignmentId cannot be null').notNull().callback(callback);
    },
    validateResponse: function(response) {
      return response.ApproveAssignmentResult.Request.IsValid.toLowerCase() === 'true';
    }
  },
  {
    name: 'ApproveRejectedAssignment',
  },
  {
    name: 'AssignQualification',
  },
  {
    name: 'BlockWorker',
  },
  {
    name: 'ChangeHITTypeOfHIT',
  },
  {
    name: 'CreateHIT',
  },
  {
    name: 'CreateQualificationType',
  },
  {
    name: 'DisableHIT',
  },
  {
    name: 'DisposeHIT',
  },
  {
    name: 'DisposeQualificationType',
  },
  {
    name: 'ExtendHIT',
  },
  {
    name: 'ForceExpireHIT',
  },
  {
    name: 'GetAccountBalance',
  },
  {
    name: 'GetAssignment',
  },
  {
    name: 'GetAssignmentsForHIT',
  },
  {
    name: 'GetBlockedWorkers',
  },
  {
    name: 'GetBonusPayments',
  },
  {
    name: 'GetFileUploadURL',
  },
  {
    name: 'GetHIT',
  },
  {
    name: 'GetHITsForQualificationType',
  },
  {
    name: 'GetQualificationRequests',
  },
  {
    name: 'GetQualificationScore',
  },
  {
    name: 'GetQualificationsForQualificationType',
  },
  {
    name: 'GetQualificationType',
  },
  {
    name: 'GetRequesterStatistic',
  },
  {
    name: 'GetRequesterWorkerStatistic',
  },
  {
    name: 'GetReviewableHITs',
  },
  {
    name: 'GetReviewResultsForHIT',
  },
  {
    name: 'GrantBonus',
    validateResponse: function(response) {
      return response.GrantBonusResult.Request.IsValid.toLowerCase() === 'true';
    }
  },
  {
    name: 'GrantQualification',
  },
  {
    name: 'Help',
  },
  {
    name: 'NotifyWorkers',
  },
  {
    name: 'RegisterHITType',
  },
  {
    name: 'RejectAssignment',
    validateResponse: function(response) {
      return response.RejectAssignmentResult.Request.IsValid.toLowerCase() === 'true';
    }
  },
  {
    name: 'RejectQualificationRequest',
  },
  {
    name: 'RevokeQualification',
  },
  {
    name: 'SearchHITs',
  },
  {
    name: 'SearchQualificationTypes',
  },
  {
    name: 'SendTestEventNotification',
  },
  {
    name: 'SetHITAsReviewing',
  },
  {
    name: 'SetHITTypeNotification',
  },
  {
    name: 'UnblockWorker',
  },
  {
    name: 'UpdateQualificationScore',
  },
  {
    name: 'UpdateQualificationType',
  },
];

// every option must be submitted with the field "Operation" = <whatever the name of the operation is, a string>
module.exports = function (config) {
  return function(name, fields, callback) {
    // callback signature: (err, result)
    var operation = __.find(operations, function(op) { return op.name == name; });
    // console.log("operation", operation);
    // new helpers.Checker().check(operation, 'Operation not found').notNull().callback(function(errors) {
    // if (errors) return callback(errors);

    helpers.request(operation.name, 'POST', fields, config, function (err, response) {
      if (err) return callback(err);
      callback(null, response);
    });
  };
};

