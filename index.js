/// <reference path="type_declarations/index.d.ts" />
var _ = require('lodash');
var request = require('request');
var crypto = require('crypto');
function splitStrings(args) {
    var object = {};
    args.forEach(function (arg) {
        var _a = arg.split('='), key = _a[0], value = _a[1];
        object[key] = value;
    });
    return object;
}
exports.splitStrings = splitStrings;
var APIError = (function () {
    function APIError(code, message) {
        this.code = code;
        this.message = message;
        this.name = 'APIError';
    }
    APIError.prototype.toString = function () {
        return this.code + ": " + this.message;
    };
    return APIError;
})();
// class DataStructure { }
var Locale = (function () {
    function Locale(Country, Subdivision) {
        this.Country = Country;
        this.Subdivision = Subdivision;
    }
    return Locale;
})();
exports.Locale = Locale;
var Price = (function () {
    function Price(Amount, CurrencyCode) {
        if (CurrencyCode === void 0) { CurrencyCode = 'USD'; }
        this.Amount = Amount;
        this.CurrencyCode = CurrencyCode;
    }
    return Price;
})();
exports.Price = Price;
var ExternalQuestion = (function () {
    function ExternalQuestion(ExternalURL, FrameHeight) {
        this.ExternalURL = ExternalURL;
        this.FrameHeight = FrameHeight;
    }
    return ExternalQuestion;
})();
exports.ExternalQuestion = ExternalQuestion;
(function (ComparatorType) {
    ComparatorType[ComparatorType["LessThan"] = 0] = "LessThan";
    ComparatorType[ComparatorType["LessThanOrEqualTo"] = 1] = "LessThanOrEqualTo";
    ComparatorType[ComparatorType["GreaterThan"] = 2] = "GreaterThan";
    ComparatorType[ComparatorType["GreaterThanOrEqualTo"] = 3] = "GreaterThanOrEqualTo";
    ComparatorType[ComparatorType["EqualTo"] = 4] = "EqualTo";
    ComparatorType[ComparatorType["NotEqualTo"] = 5] = "NotEqualTo";
    ComparatorType[ComparatorType["Exists"] = 6] = "Exists";
    ComparatorType[ComparatorType["DoesNotExist"] = 7] = "DoesNotExist";
    ComparatorType[ComparatorType["In"] = 8] = "In";
    ComparatorType[ComparatorType["NotIn"] = 9] = "NotIn";
})(exports.ComparatorType || (exports.ComparatorType = {}));
var ComparatorType = exports.ComparatorType;
var QualificationRequirement = (function () {
    function QualificationRequirement(QualificationTypeId, Comparator, IntegerValue, LocaleValue, RequiredToPreview) {
        if (RequiredToPreview === void 0) { RequiredToPreview = false; }
        this.QualificationTypeId = QualificationTypeId;
        this.Comparator = Comparator;
        this.IntegerValue = IntegerValue;
        this.LocaleValue = LocaleValue;
        this.RequiredToPreview = RequiredToPreview;
    }
    QualificationRequirement.SystemIDs = {
        sandbox: {
            Masters: '2ARFPLSP75KLA8M8DH1HTEQVJT3SY6',
            CategorizationMasters: '2F1KVCNHMVHV8E9PBUB2A4J79LU20F',
            PhotoModerationMasters: '2TGBB6BFMFFOM08IBMAFGGESC1UWJX',
            Worker_NumberHITsApproved: '00000000000000000040',
            Worker_Locale: '00000000000000000071',
            Worker_Adult: '00000000000000000060',
            Worker_PercentAssignmentsApproved: '000000000000000000L0',
        },
        production: {
            Masters: '2F1QJWKUDD8XADTFD2Q0G6UTO95ALH',
            CategorizationMasters: '2NDP2L92HECWY8NS8H3CK0CP5L9GHO',
            PhotoModerationMasters: '21VZU98JHSTLZ5BPP4A9NOBJEK3DPG',
            Worker_NumberHITsApproved: '00000000000000000040',
            Worker_Locale: '00000000000000000071',
            Worker_Adult: '00000000000000000060',
            Worker_PercentAssignmentsApproved: '000000000000000000L0',
        }
    };
    return QualificationRequirement;
})();
exports.QualificationRequirement = QualificationRequirement;
/**
Generate a AWS Mechanical Turk API request signature; see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/MakingRequests_RequestAuthenticationArticle.html#CalcReqSig

- secretAccessKey: Your AWS Secret Access Key
- service: The service name
- operation: The operation to perform
- timestamp: The timestamp to be sent with the mturk message.

Returns a base64-encoded string
*/
function sign(AWSSecretAccessKey, Service, Operation, Timestamp) {
    var hmac = crypto.createHmac('sha1', AWSSecretAccessKey);
    hmac.update(Service + Operation + Timestamp);
    return hmac.digest('base64');
}
/**
The AWS Mechanical Turk REST API has a particular way of serializing complex
objects, like lists. (Gosh, wouldn't it be handy if there were some standard
that specified how to do this sort of thing? We could call it, say, "JSON" or
some silly name like that.)
*/
function serialize(params) {
    var serialized = {};
    _.each(params, function (value, key) {
        if (value === undefined) {
        }
        else if (Array.isArray(value)) {
            // &QualificationRequirement.1.QualificationTypeId=789RVWYBAZW00EXAMPLE
            // &QualificationRequirement.1.IntegerValue=18
            // &QualificationRequirement.2.QualificationTypeId=237HSIANVCI00EXAMPLE
            // &QualificationRequirement.2.IntegerValue=1
            _.each(value, function (item, index) {
                _.each(item, function (value, sub_key) {
                    serialized[(key + "." + index + "." + sub_key)] = value;
                });
            });
        }
        else if (typeof value == 'object') {
            // if (value.toJSON) value = value.toJSON();
            // &BonusAmount.1.Amount=5
            // &BonusAmount.1.CurrencyCode=USD
            _.each(value, function (value, sub_key) {
                serialized[(key + ".1." + sub_key)] = value;
            });
        }
        else {
            // &Reason=Thanks%20for%20doing%20great%20work!
            serialized[key] = value;
        }
    });
    return serialized;
}
/**
The AWS documentation calls the sandbox and production sites, variously,
"environment", "version", and "system". I think environment is the most
descriptive of these.
*/
(function (Environment) {
    Environment[Environment["sandbox"] = 0] = "sandbox";
    Environment[Environment["production"] = 1] = "production";
})(exports.Environment || (exports.Environment = {}));
var Environment = exports.Environment;
var Account = (function () {
    function Account(AWSAccessKeyId, AWSSecretAccessKey) {
        this.AWSAccessKeyId = AWSAccessKeyId;
        this.AWSSecretAccessKey = AWSSecretAccessKey;
    }
    Account.prototype.createConnection = function (environment) {
        if (environment === void 0) { environment = Environment.production; }
        return new Connection(this, environment);
    };
    return Account;
})();
exports.Account = Account;
var Connection = (function () {
    function Connection(account, environment) {
        this.account = account;
        this.environment = environment;
        this.Version = '2014-08-15';
        this.Service = 'AWSMechanicalTurkRequester';
    }
    Object.defineProperty(Connection.prototype, "url", {
        get: function () {
            return (this.environment == Environment.production) ?
                'https://mechanicalturk.amazonaws.com' :
                'https://mechanicalturk.sandbox.amazonaws.com';
        },
        enumerable: true,
        configurable: true
    });
    Connection.prototype._prepareOptions = function (params) {
        var Timestamp = new Date().toISOString();
        var request_parameters = {
            AWSAccessKeyId: this.account.AWSAccessKeyId,
            Service: this.Service,
            Operation: params.Operation,
            Signature: sign(this.account.AWSSecretAccessKey, this.Service, params.Operation, Timestamp),
            Timestamp: Timestamp,
            Version: this.Version,
        };
        var form = serialize(_.extend(request_parameters, params));
        return { form: form, url: this.url };
    };
    /**
    Post a request to Mechanical Turk.
    - params: an object containing the Operation name and relevant arguments
    - callback: called with the response XML string
  
    The MTurk REST API will return HTTP 200 OK even on errors. To detect errors,
    you must look for an <Errors> element inside the root <*Response> element.
  
    Example `response` (http.IncomingMessage) object:
  
        {
          "statusCode": 200,
          "headers": {
            "content-type": "text/xml",
            "transfer-encoding": "chunked",
            "date": "Sun, 19 Apr 2015 22:55:20 GMT",
            "server": "MTurk"
          },
          "request": ...
        }
    */
    Connection.prototype.post = function (params, callback) {
        var options = this._prepareOptions(params);
        request.post(options, function (error, response, xml) {
            callback(error, xml);
        });
    };
    Connection.prototype.get = function (operation, params, callback) {
        throw new Error('Not yet implemented');
    };
    return Connection;
})();
exports.Connection = Connection;
