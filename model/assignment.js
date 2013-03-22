var xml = require('../lib/xml-native');
var EventEmitter = require('events').EventEmitter;

module.exports = function (config) {
  var request = require('../lib/request')(config);
  var inherits = require('util').inherits;
  var Base = require('./base');

  function Assignment() {}
  inherits(Assignment, Base);

  Assignment.prototype.populateFromResponse = function (response) {
    var self = this;

    Base.prototype.populateFromResponse.call(this, response, {
      AssignmentId: 'id',
      HITId: 'hitId'
    });
    if (this.answer) {
      var rs = new EventEmitter();
      xml.decodeReadStream(rs, function (err, root) {
        self.answer = root;
      });
      rs.emit('data', this.answer);
      rs.emit('end');
    }
  };





  /*
   * Approves a Assignment
   *
   * @param {assignmentId} the Assignment id (string)
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional.
   * @param {callback} function with signature (error)
   *
   */
  Assignment.approve = function (assignmentId, requesterFeedback, callback) {
    var options = {
      AssignmentId: assignmentId,
      RequesterFeedback: requesterFeedback
    };
    request('AWSMechanicalTurkRequester', 'ApproveAssignment', 'POST', options, function (err, response) {
      if (err) {
        return callback(err);
      }
      if (!Assignment.prototype.nodeExists(['ApproveAssignmentResult', 'Request', 'IsValid'], response)) {
        callback([new Error('No "ApproveAssignmentResult > Request > IsValid" node on the response')]);
        return;
      }
      if (response.ApproveAssignmentResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says ApproveAssignmentResult request is invalid: ' + JSON.stringify(response.ApproveAssignmentResult.Request.Errors))]);
      }
      callback(null);
    });
  };


  /*
   * Approves the Assignment
   *
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional
   * @param {callback} function with signature (error)
   *
   */
  Assignment.prototype.approve = function (requesterFeedback, callback) {
    return Assignment.approve(this.id, requesterFeedback, callback);
  };





  /**
  * Rejects a Assignment
  *
  * @param {String} assignmentId The Assignment ID
  * @param {String} requesterFeedback A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional.
  * @param {callback} function with signature (error)
  *
  */
  Assignment.reject = function (assignmentId, requesterFeedback, callback) {
    var options = {
      AssignmentId: assignmentId,
      RequesterFeedback: requesterFeedback
    };
    request('AWSMechanicalTurkRequester', 'RejectAssignment', 'POST', options, function (err, response) {
      if (err) {
        return callback(err);
      }
      if (!Assignment.prototype.nodeExists(['RejectAssignmentResult', 'Request', 'IsValid'], response)) {
        callback([new Error('No "RejectAssignmentResult > Request > IsValid" node on the response')]);
        return;
      }
      if (response.RejectAssignmentResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says RejectAssignmentResult request is invalid: ' + JSON.stringify(response.RejectAssignmentResult.Request.Errors))]);
      }
      callback(null);
    });
  };


  /**
  * Rejects the Assignment
  *
  * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional
  * @param {callback} function with signature (error)
  *
  */
  Assignment.prototype.reject = function (requesterFeedback, callback) {
    return Assignment.reject(this.id, requesterFeedback, callback);
  };





  /**
  * Grant bonus for a Assignment
  *
  * @param {String} assignmentId The ID of the assignment for which this bonus is paid, as returned in the assignment data of the GetAssignmentsForHIT operation.
  * @param {String} workerId The ID of the Worker being paid the bonus, as returned in the assignment data of the GetAssignmentsForHIT operation.
  * @param {Number} bonusAmount The bonus amount to pay, in US Dollars.
  * @param {String} reason A message that explains the reason for the bonus payment. The Worker receiving the bonus can see this message.
  * @param {Function} callback function with signature (error)
  */
  Assignment.grantBonus = function (assignmentId, workerId, bonusAmount, reason, callback) {
    var options = {
      AssignmentId: assignmentId,
      WorkerId: workerId,
      // BonusAmount actually needs to be a special Price data structure, but
      // since USD is the only currency supported, there are no relevant options
      // besides the dollar amount.
      BonusAmount: {CurrencyCode: 'USD', Amount: bonusAmount},
      Reason: reason
    };
    request('AWSMechanicalTurkRequester', 'GrantBonus', 'POST', options, function (err, response) {
      if (err) {
        return callback(err);
      }
      if (!Assignment.prototype.nodeExists(['GrantBonusResult', 'Request', 'IsValid'], response)) {
        callback([new Error('No "GrantBonusResult > Request > IsValid" node on the response')]);
        return;
      }
      if (response.GrantBonusResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says GrantBonusResult request is invalid: ' + JSON.stringify(response.GrantBonusResult.Request.Errors))]);
      }
      callback(null);
    });
  };


  /**
  * Assignment.grantBonus
  */
  Assignment.prototype.grantBonus = function (workerId, bonusAmount, reason, callback) {
    return Assignment.grantBonus(this.id, workerId, bonusAmount, reason, callback);
  };

  return Assignment;
};
