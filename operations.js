'use strict'; /*jslint nomen: true, es5: true, node: true */
var check = require('validator').check;
var __ = require('underscore');
var models = require('./models');

var shared_Judgment_schema = {
  AssignmentId: {
    type: String,
    required: true
  },
  RequesterFeedback: {
    type: String,
    required: false,
    maxlen: 1024
  },
};

var ops = {};
ops.ApproveAssignment = {
  schema: shared_Judgment_schema,
  validateResponse: function(response) {
    return response.ApproveAssignmentResult.Request.IsValid.toLowerCase() === 'true';
  }
};

ops.ApproveRejectedAssignment = {
  schema: shared_Judgment_schema,
  validateResponse: function(response) {
    return response.ApproveRejectedAssignmentResult.Request.IsValid.toLowerCase() === 'true';
  }
};

ops.AssignQualification = {
  schema: {
    QualificationTypeId: {
      type: String,
      required: true
    },
    WorkerId: {
      type: String,
      required: true
    },
    IntegerValue: {
      type: Number,
      required: false,
      'default': 1
    },
    SendNotification: {
      type: Boolean,
      required: true,
      'default': true
    },
  },
  validateResponse: function(response) {
    return response.AssignQualificationResult.Request.IsValid.toLowerCase() === 'true';
  }
};

ops.BlockWorker = {
  schema: {
    WorkerId: {
      type: String,
      required: true
    },
    Reason: {
      type: String,
      required: false,
      maxlen: 1024
    },
  },
  validateResponse: function(response) {
    return response.BlockWorkerResult.Request.IsValid.toLowerCase() === 'true';
  }
};

ops.ChangeHITTypeOfHIT = {
  schema: {
    HITId: {
      type: String,
      required: true
    },
    HITTypeId: {
      type: String,
      required: true,
    },
  },
  validateResponse: function(response) {
    return response.ChangeHITTypeOfHITResult.Request.IsValid.toLowerCase() === 'true';
  }
};


var shared_Unique_schema = {
  UniqueRequestToken: {
    type: String,
    required: false
  }
};

var shared_CreateHIT_schema = __.extend({
  Question: {
    // Constraints: Must be a QuestionForm data structure, an ExternalQuestion data structure, or an HTMLQuestion data structure. The XML question data must not be larger than 64 kilobytes (65,535 bytes) in size, including whitespace.
    // Either a Question parameter or a HITLayoutId parameter must be provided.
    type: String,
    required: true,
  },
  HITLayoutId: {
    // Must be a valid HITLayoutId, as obtained from the Amazon Mechanical Turk Requester website.
    // Either a Question parameter or a HITLayoutId parameter must be provided.
    type: String,
    required: true,
  },
  HITLayoutParameter: {
    type: String,
    required: true,
  },
  AssignmentReviewPolicy: {
    type: String,
    required: true,
  },
  HITReviewPolicy: {
    type: String,
    required: true,
  },
  RequesterAnnotation: {
    type: String,
    required: true,
  },
  LifetimeInSeconds: {
    type: Number,
    required: true,
    min: 1,
    max:  31536000
  },
  MaxAssignments: {
    type: Number,
    required: false,
    'default': 1,
    min: 1,
    max: 1000000000
  },
}, shared_Unique_schema);

ops.CreateHIT = {
  // when there are multiple schemas, either one can apply
  schemas: [
  __.extend({
    HITTypeId: {
      type: String,
      required: true
    },
  }, shared_CreateHIT_schema), __.extend({
    Title: {
      type: String,
      required: true,
      maxlen: 128,
    },
    Description: {
      type: String,
      required: true,
      maxlen: 2000,
    },
    Reward: {
      type: models.Price,
      required: true,
    },
    AssignmentDurationInSeconds: {
      type: Number,
      required: true,
      min: 1,
      max:  31536000
    },
    Keywords: {
      type: String,
      required: true,
      maxlen: 1000
    },
    AutoApprovalDelayInSeconds: {
      type: String,
      required: false,
      'default': 2592000,
      min: 0,
      max: 2592000
    },
    QualificationRequirement: {
      type: models.QualificationRequirement,
      required: true,
    },
  }, shared_CreateHIT_schema)],
  validateResponse: function(response) {
    return response.HIT.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.CreateQualificationType = {
  schema: {},
  validateResponse: function(response) {
    return response.QualificationType.Request.IsValid.toLowerCase() === 'true';
  }
};

var shared_HIT_schema = {
  HITId: {
    type: String,
    required: true
  },
};

ops.DisableHIT = {
  schema: shared_HIT_schema,
  validateResponse: function(response) {
    return response.DisableHITResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.DisposeHIT = {
  schema: shared_HIT_schema,
  validateResponse: function(response) {
    return response.DisposeHITResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.DisposeQualificationType = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.ExtendHIT = {
  schema: {},
  validateResponse: function(response) {
    return response.ExtendHITResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.ForceExpireHIT = {
  schema: {},
  validateResponse: function(response) {
    return response.ForceExpireHITResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetAccountBalance = {
  schema: {},
  validateResponse: function(response) {
    return response.GetAccountBalanceResult.Request.IsValid.toLowerCase() === 'true';
  }
};

var shared_Assignment_schema = {
  AssignmentId: {
    type: String,
    required: true
  },
};

ops.GetAssignment = {
  schema: shared_Assignment_schema,
  validateResponse: function(response) {
    return response.GetAssignmentResult.Request.IsValid.toLowerCase() === 'true';
  }
};

var shared_Page_schema = {
  PageSize: {
    type: Number,
    required: false,
    'default': 10,
    min: 1,
    max: 100
  },
  PageNumber: {
    type: Number,
    required: false,
    'default': 1,
    min: 1,
  },
};

ops.GetAssignmentsForHIT = {
  schema: __.extend({
    AssignmentStatus: {

    },
    SortProperty: {
      type: String,
      required: false,
      // default -> If not specified, the operation returns all assignments that have been submitted, including those that have been approved or rejected.
      options: ['Submitted', 'Approved', 'Rejected']
    },
    SortDirection: {
      type: String,
      required: false,
      'default': 'Ascending',
      options: ['Ascending', 'Descending']
    },
  }, shared_Page_schema, shared_HIT_schema),
  validateResponse: function(response) {
    return response.GetAssignmentsForHITResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetBlockedWorkers = {
  schema: {},
  validateResponse: function(response) {
    return response.GetBlockedWorkersResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetBonusPayments = {
  schema: {
    HITId: {
      type: String,
      required: false,
    },
    AssignmentId: {
      type: String,
      required: false,
    },
  },
  validateResponse: function(response) {
    return response.GetBonusPaymentsResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetFileUploadURL = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetHIT = {
  schema: shared_HIT_schema,
  validateResponse: function(response) {
    return response.HIT.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetHITsForQualificationType = {
  schema: __.extend({
    QualificationTypeId: {
      type: String,
      required: true
    }
  }, shared_Page_schema),
  validateResponse: function(response) {
    return response.GetHITsForQualificationTypeResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetQualificationRequests = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetQualificationScore = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetQualificationsForQualificationType = {
  schema: __.extend({
    QualificationTypeId: {
      type: String,
      required: true
    },
    Status: {
      type: String,
      required: false,
      'default': 'Granted',
      options: ['Granted', 'Revoked']
    },
  }, shared_Page_schema),
  validateResponse: function(response) {
    return response.GetQualificationsForQualificationTypeResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetQualificationType = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetRequesterStatistic = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetRequesterWorkerStatistic = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetReviewableHITs = {
  schema: __.extend({
    HITTypeId: {
      type: String,
      required: false
    },
    Status: {
      // To query both Reviewable and Reviewing HITs, specify multiple Status parameters.
      type: String,
      required: false,
      'default': 'Reviewable',
      options: ['Reviewable', 'Reviewing'],
    },
    SortProperty: {
      type: String,
      required: false,
      'default': 'Expiration',
      options: ['Title', 'Reward', 'Expiration', 'CreationTime', 'Enumeration'],
    },
    SortDirection: {
      type: String,
      required: false,
      'default': 'Ascending',
      options: ['Ascending', 'Descending']
    },
  }, shared_Page_schema),
  validateResponse: function(response) {
    return response.GetReviewableHITsResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GetReviewResultsForHIT = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GrantBonus = {
  schema: __.extend({
    WorkerId: {
      type: String,
      required: true
    },
    AssignmentId: {
      type: String,
      required: true
    },
    BonusAmount: {
      type: models.Price,
      required: true
    },
    Reason: {
      type: String,
      required: false
    },
  }, shared_Unique_schema),
  validateResponse: function(response) {
    return response.GrantBonusResult.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.GrantQualification = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.Help = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.NotifyWorkers = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.RegisterHITType = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.RejectAssignment = {
  schema: shared_Judgment_schema,
  validateResponse: function(response) {
    return response.RejectAssignmentResult.Request.IsValid.toLowerCase() === 'true';
  }
};

ops.RejectQualificationRequest = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.RevokeQualification = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.SearchHITs = {
  schema: __.extend({
    SortProperty: {
      type: String,
      required: false,
      'default': 'CreationTime',
      options: ['Title', 'Reward', 'Expiration', 'CreationTime', 'Enumeration']
    },
    SortDirection: {
      type: String,
      required: false,
      'default': 'Ascending',
      options: ['Ascending', 'Descending']
    },
  }, shared_Page_schema),
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.SearchQualificationTypes = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.SendTestEventNotification = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.SetHITAsReviewing = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.SetHITTypeNotification = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.UnblockWorker = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.UpdateQualificationScore = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};


ops.UpdateQualificationType = {
  schema: {},
  validateResponse: function(response) {
    return response.ABCEDEFHIJKLMNOXYZ.Request.IsValid.toLowerCase() === 'true';
  }
};

exports.operations = ops;
