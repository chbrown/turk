var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = function (config) {
  var operations = require('../lib/operations')(config);
  var Base = require('./base');

  function Assignment(id) {
    this.id = id;
  }
  util.inherits(Assignment, Base);

  Assignment.prototype.populateFromResponse = function (response) {
    var self = this;

    // * @param {String} assignmentId The ID of the assignment for which this bonus is paid, as returned in the assignment data of the GetAssignmentsForHIT operation.
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

  /**
   * Approves an Assignment
   *
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site.
   *        (string max 1024 characters). Optional.
   * @param {callback} function with signature (error)
   *
   */
  Assignment.prototype.approve = function (requesterFeedback, callback) {
    var fields = {AssignmentId: this.id, RequesterFeedback: requesterFeedback};
    operations('ApproveAssignment', fields, callback);
  };

  /**
  * Rejects the Assignment
  *
  * @param {String} requesterFeedback A message for the Worker, which the Worker can see in the Status section of the web site.
  *        (string max 1024 characters). Optional
  * @param {Function} callback Callback function with signature: function(error)
  *
  */
  Assignment.prototype.reject = function (requesterFeedback, callback) {
    var fields = {AssignmentId: this.id, RequesterFeedback: requesterFeedback};
    operations('RejectAssignment', fields, callback);
  };


  /**
  * Grant bonus for a Assignment
  *
  * @param {String} workerId The ID of the Worker being paid the bonus, as returned in the assignment data of the GetAssignmentsForHIT operation.
  * @param {Number} bonusAmount The bonus amount to pay, in US Dollars.
  * @param {String} reason A message that explains the reason for the bonus payment. The Worker receiving the bonus can see this message.
  * @param {Function} callback function with signature (error)
  *
  */
  Assignment.prototype.grantBonus = function (workerId, bonusAmount, reason, callback) {
    var fields = {
      AssignmentId: this.id,
      WorkerId: workerId,
      // BonusAmount actually needs to be a special Price data structure, but
      // since USD is the only currency supported, there are no relevant options
      // besides the dollar amount.
      BonusAmount: {CurrencyCode: 'USD', Amount: bonusAmount},
      Reason: reason
    };
    operations('GrantBonus', fields, callback);
  };

  return Assignment;
};
