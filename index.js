var EventEmitter = require('events').EventEmitter;
var operations = require('./lib/operations');

module.exports = function (config) {
  var notificationReceptor = require('./notification_receptor')(config);
  var HIT = require('./model/hit')(config);
  // var uri = require('./lib/uri');

  var POLLER_INTERVAL_MS = config.poller && config.poller.frequency_ms || 60000;

  var notification = new EventEmitter();
  var ret = notification;

  var started = false;
  var recentlyReviewed = {};
  var clearTimeouts = [];

  function emitHitReviewable(hitId, emitAny) {
    var emitted = false,
      timeout;
    if (!recentlyReviewed[hitId]) {
      recentlyReviewed[hitId] = true;
      if (emitAny) {
        notification.emit('any', {
          EventType: 'HITReviewable',
          HITId: hitId,
          eventType: 'hITReviewable'
        });
      }
      notification.emit('HITReviewable', hitId);
      // eventually delete hitId from list so it doesn't grow too much
      timeout = setTimeout(function () {
        var pos = clearTimeouts.lastIndexOf(timeout);
        if (pos >= 0) {
          clearTimeouts.splice(pos, 1);
        }
        delete recentlyReviewed[hitId];
      }, POLLER_INTERVAL_MS * 10);
      clearTimeouts.push(timeout);
      emitted = true;
    }
    return emitted;
  }

  function startNotificationReceptor() {
    notificationReceptor.start();
    notificationReceptor.on('any', function (event) {
      if (event.EventType == 'HITReviewable') {
        emitHitReviewable(event.HITId, false);
      }
      else {
        notification.emit(event.eventType, event);
      }
    });
  }

  var pollerTimeout;

  function startPoller() {
    (function get(pageNumber) {
      if (!pageNumber) pageNumber = 1;
      HIT.getReviewable({
        pageSize: 20,
        pageNumber: pageNumber,
        status: 'Reviewable'
      }, function (err, numResults, totalNumResults, pageNumber, hits) {
        var reschedule = true;

        if (!err) {
          hits.forEach(function (hit) {
            emitHitReviewable(hit.id, true);
          });
          if (numResults > 0 && totalNumResults > numResults) {
            reschedule = false;
            get(pageNumber + 1);
          }
        }
        if (reschedule) pollerTimeout = setTimeout(get, POLLER_INTERVAL_MS);
      });
    })();
  }

  var oldNotificationOn = notification.on;
  notification.on = function (event, callback) {
    if (!started) {
      startNotificationReceptor();
      startPoller();
      started = true;
    }
    oldNotificationOn.call(notification, event, callback);
  };

  notification.stopListening = function () {
    notificationReceptor.stop();
    if (pollerTimeout) {
      clearTimeout(pollerTimeout);
    }
    clearTimeouts.forEach(function (timeout) {
      clearTimeout(timeout);
    });
  };

  ret.HIT = HIT;
  ret.HITType = require('./model/hit_type')(config);
  ret.Notification = require('./model/notification')(config);
  ret.Assignment = require('./model/assignment')(config);

  var opWrapper = function(op_name) {
    // callback signature: (err, result)
    // every option must be submitted with the field "Operation" = <whatever the name of the operation is, a string>
    return function(params, callback) {
      var op = __.extend({name: op_name}, params);
      helpers.postAMT(op, config, function (err, response) {
        // new helpers.Checker().check(operation, 'Operation not found').notNull().callback(function(errors) {
        if (err) return callback(err);
        callback(null, response);
      });
    };
  };
  for (var op_name in operations) {
    ret[op_name] = opWrapper(op_name);
  }

  return ret;
};
