module.exports = function(config) {
  var request    = require('../lib/request')(config)
    , inherits   = require('util').inherits
    , Base       = require('./base')
    , Assignment = require('./assignment')(config)
    , ret = {};

  function HIT(hitTypeId, question, lifeTimeInSeconds, maxAssignments, requesterAnnotation) {
    this.errors = [];
    if (hitTypeId) this.hitTypeId = hitTypeId;
    if (question) this.question = question;
    if (lifeTimeInSeconds) this.lifeTimeInSeconds = lifeTimeInSeconds;
    if (maxAssignments) this.maxAssignments = maxAssignments;
    if (requesterAnnotation) this.requesterAnnotation = requesterAnnotation;
  }

  inherits(HIT, Base);

  HIT.prototype.errors = function() {
    return this.errors;
  };

  HIT.prototype.validate = function(v) {
    v.check(this.hitTypeId, 'Please enter a valid hitTypeId').notNull().isAlphanumeric();
    v.check(this.lifeTimeInSeconds, 'Please enter a lifeTimeInSeconds').notNull();
    v.check(this.lifeTimeInSeconds, 'Please enter a valid lifeTimeInSeconds').isInt();
    if (this.lifeTimeInSeconds < 30) { v.error("lifeTimeInSeconds should be >= 30");  }
    if (this.lifeTimeInSeconds > 31536000) { v.error("lifeTimeInSeconds should be <= 31536000");  }
    if (this.maxAssignments) { v.check(this.maxAssignments, 'maxAssignments should be an integer').isInt(); }
    if (this.requesterAnnotation) { v.check(this.requesterAnnotation, 'Please enter a valid requesterAnnotation').len(0, 255); }
  };

  HIT.prototype.populateFromResponse = function(response) {
    Base.prototype.populateFromResponse.call(this, response, {
        HITId: 'id'
      , HITTypeId: 'hitTypeId'
      , HITStatus: 'hitStatus'
      , HITReviewStatus: 'hitReviewStatus'
    });
  };

  HIT.prototype.create = function(callback) {
    var self = this;

    if (! this.valid()) { callback(this.errors); return; }

    this.question.load(function(err, questionFormXML) {
      if (err) {callback(err); return; }
      var remoteErrors
        , options = {
            HITTypeId: self.hitTypeId
          , Question: questionFormXML
          , LifetimeInSeconds: self.lifeTimeInSeconds
        };
      if (self.maxAssignments) options.MaxAssignments =  self.maxAssignments;
      if (self.requesterAnnotation) options.RequesterAnnotation =  self.requesterAnnotation;

      request('AWSMechanicalTurkRequester', 'CreateHIT', 'POST', options, function(err, response) {
        if (err) { callback([err]); return; }

        remoteErrors = self.remoteRequestValidationError(response.HIT);
        if (remoteErrors) { callback(remoteErrors.map(function(error) { return new Error(error); })); return; }
        delete response.HIT.Request;

        self.populateFromResponse(response.HIT);
        if (err) { err = [err]; }
        callback(err);
      });
    });
  };


  /*
   * create a HIT
   *
   * @param {hitTypeId} the HIT type id (string)
   * @param {question} the question (string)
   * @param {lifeTimeInSeconds} the lifetime, in seconds (int)
   * @param {options.maxAssignments} the maximum number of assignments. defaults to 1 (int). Optional.
   * @param {options.requesterAnnotation} annotations only viewable by the requester (you). (string with max 255 chars). Optional.
   * @param {callback} function with signature (Array errors || null, HIT hit)
   * 
   */
  ret.create = function(hitTypeId, question, lifeTimeInSeconds, options, callback) {
    if (! options) options = {}
    var maxAssignments = options.maxAssignments
      , requesterAnnotation = options.requesterAnnotation
      , hit = new HIT(hitTypeId, question, lifeTimeInSeconds, maxAssignments, requesterAnnotation);

    hit.create(function(err) {
      if (err) { callback(err); return; }
      callback(null, hit);
    });
  };

  /*
   * Retrieves the details of the specified HIT.
   *
   * @param {hitId} The ID of the HIT to retrieve (String)
   * @param {callback} function with signature (Error error || null, HIT hit)
   * 
   */
  ret.get = function(hitId, callback) {
    var self = this;

    request('AWSMechanicalTurkRequester', 'GetHIT', 'GET', { HITId: hitId }, function(err, response) {
      var hit;

      if (err) { callback(err); return; }

      if (! HIT.prototype.nodeExists(['HIT', 'Request', 'IsValid'], response)) { callback([new Error('No "HIT > Request > IsValid" node on the response')]); return; }
      if (response.HIT.Request.IsValid.toLowerCase() != 'true') {
        callback([new Error('Response says HIT is invalid')]);
        return;
      }
      delete response.HIT.Request;

      if (! err) {
        hit = new HIT();
        hit.populateFromResponse(response.HIT);
      }
      callback(err, hit);
    }); 
  };


  /*
   * retrieves the reviewable HIT
   *
   * @param {options.hitTypeId} the HIT type id (string), not required
   * @param {options.status} the status of the HITs to retrieve  (string). Can be "Reviewable" or "Reviewing" Default: "Reviewable"
   * @param {options.sortProperty} can sort by title | reward | expiration | creationTime. Defaults to "expiration"
   * @param {options.sortDirection} can sort by Title | Reward | Expiration | CreationTime. Defaults to "Expiration"
   * @param {options.pageSize} The number of HITs to include in a page of results (int). Defaults to 10. Maximum is 100
   * @param {options.pageNumber} The page of results to return (int). Defaults to 1
   * @param {callback} function with signature (error, int numResults, int totalNumResults, int pageNumber, Array hITs)
   * 
   */
  ret.getReviewable = function(options, callback) {
    if (! options) options = {};
    var requestOptions = {
        HitTypeId    : options.hitTypeId
      , Status       : options.status
      , SortDirection: options.sortDirection
      , PageSize     : options.pageSize
      , PageNumber   : options.pageNumber
    };
    if (options.sortProperty) requestOptions.SortProperty = Base.objectKeyToResponseKey(options.sortProperty);


    request('AWSMechanicalTurkRequester', 'GetReviewableHITs', 'GET', requestOptions, function(err, response) {
      var responseHits
        , hits = [];

      if (err) { callback(err); return; }

      if (! HIT.prototype.nodeExists(['GetReviewableHITsResult', 'Request', 'IsValid'], response)) { callback([new Error('No "GetReviewableHITsResult > Request > IsValid" node on the response')]); return; }
      if (response.GetReviewableHITsResult.Request.IsValid.toLowerCase() != 'true') {
        callback([new Error('Response says GetReviewableHITs request is invalid')]);
        return;
      }
      delete response.GetReviewableHITsResult.Request;

      if (! HIT.prototype.nodeExists(['GetReviewableHITsResult', 'NumResults'], response)) { callback([new Error('No "GetReviewableHITsResult > NumResults" node on the response')]); return; }
      var numResults = parseInt(response.GetReviewableHITsResult.NumResults, 10);

      if (! HIT.prototype.nodeExists(['GetReviewableHITsResult', 'TotalNumResults'], response)) { callback([new Error('No "GetReviewableHITsResult > TotalNumResults" node on the response')]); return; }
      var totalNumResults = parseInt(response.GetReviewableHITsResult.TotalNumResults, 10);

      if (! HIT.prototype.nodeExists(['GetReviewableHITsResult', 'PageNumber'], response)) { callback([new Error('No "GetReviewableHITsResult > PageNumber" node on the response')]); return; }
      var pageNumber = parseInt(response.GetReviewableHITsResult.PageNumber, 10);

      if (! err) {
        responseHits = response.GetReviewableHITsResult.HIT;
        if (responseHits) {
          if (! Array.isArray(responseHits)) responseHits = [responseHits];
          responseHits.forEach(function(responseHit) {
            var hit = new HIT();
            hit.populateFromResponse(responseHit);
            hits.push(hit);
          });
        }
      }
      callback(err, numResults, totalNumResults, pageNumber, hits);
    });

  };


  /*
   * Gets the assigments for a HIT
   *
   * @param {hitID} The ID of the HIT
   * @param {options.assignmentStatus} The status of the assignments to return (string). Valid Values: Submitted | Approved | Rejected. Default: None
   * @param {options.sortProperty} The field on which to sort the results returned by the operation (String). Valid Values: AcceptTime | SubmitTime | AssignmentStatus. Default: SubmitTime
   * @param {options.sortDirection} The direction of the sort used with the field specified by the SortProperty parameter (string). Valid Values: Ascending | Descending. Default: Ascending
   * @param {options.pageSize} The number of assignments to include in a page of results (int). Default: 10
   * @param {options.pageNumber} The page of results to return (int). Default: 1
   * @param {callback} function with signature (error, int numResults, int totalNumResults, int pageNumber, Array assignments)
   * 
   */

  ret.getAssignments = function getAssignments(hitId, options, callback) {
   var options = {
       HITId: hitId
   };

   if (!options) options = {};

   if (options.assignmentStatus) options.AssignmentStatus = options.assignmentStatus;
   if (options.sortProperty) options.SortProperty = options.sortProperty;
   if (options.sortDirection) options.SortDirection = options.sortProperty;
   if (options.pageSize) options.PageSize = options.pageSize;
   if (options.pageNumber) options.PageNumber = options.pageNumber;

   request('AWSMechanicalTurkRequester', 'GetAssignmentsForHIT', 'GET', options, function(err, response) {
     var numResults, pageNumber, totalNumResults, resultAssignments, assignments;
     if (err) { callback(err); return; }

     if (! HIT.prototype.nodeExists(['GetAssignmentsForHITResult', 'NumResults'], response)) { callback([new Error('No "GetAssignmentsForHITResult > NumResults" node on the response')]); return; }
     numResults = parseInt(response.GetAssignmentsForHITResult.NumResults, 10);

     if (! HIT.prototype.nodeExists(['GetAssignmentsForHITResult', 'PageNumber'], response)) { callback([new Error('No "GetAssignmentsForHITResult > PageNumber" node on the response')]); return; }
     pageNumber = parseInt(response.GetAssignmentsForHITResult.PageNumber, 10);

     if (! HIT.prototype.nodeExists(['GetAssignmentsForHITResult', 'TotalNumResults'], response)) { callback([new Error('No "GetAssignmentsForHITResult > NumResults" node on the response')]); return; }
     totalNumResults = parseInt(response.GetAssignmentsForHITResult.TotalNumResults, 10);

     resultAssignments = response.GetAssignmentsForHITResult.Assignment;
     if (! Array.isArray(resultAssignments)) resultAssignments = [resultAssignments];

     assignments = resultAssignments.map(function(resultAssignment) {
       var assignment = new Assignment();
       assignment.populateFromResponse(resultAssignment);
       return assignment;
     });

     callback(null, numResults, pageNumber, totalNumResults, assignments);
   });
  };


  /*
   * Gets the assigments for this HIT
   *
   * @param {options.assignmentStatus} The status of the assignments to return (string). Valid Values: Submitted | Approved | Rejected. Default: None
   * @param {options.sortProperty} The field on which to sort the results returned by the operation (String). Valid Values: AcceptTime | SubmitTime | AssignmentStatus. Default: SubmitTime
   * @param {options.sortDirection} The direction of the sort used with the field specified by the SortProperty parameter (string). Valid Values: Ascending | Descending. Default: Ascending
   * @param {options.pageSize} The number of assignments to include in a page of results (int). Default: 10
   * @param {options.pageNumber} The page of results to return (int). Default: 1
   * @param {callback} function with signature (error, int numResults, int totalNumResults, int pageNumber, Array assignments)
   * 
   */
  HIT.prototype.getAssignments = function(options, callback) {
    return getAssignments(this.id, options, callback);
  };
  
  return ret;
};