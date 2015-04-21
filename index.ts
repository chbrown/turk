/// <reference path="type_declarations/index.d.ts" />
import _ = require('lodash');
import request = require('request');
import crypto = require('crypto');

type StringObject = {[index: string]: string};

export function splitStrings(args: string[]): StringObject {
  var object: StringObject = {};
  args.forEach(arg => {
    var [key, value] = arg.split('=');
    object[key] = value;
  });
  return object;
}

class APIError implements Error {
  public name: string = 'APIError';
  constructor(public code: string, public message: string) { }
  toString() {
    return `${this.code}: ${this.message}`;
  }
}

// class DataStructure { }

export class Locale {
  constructor(public Country: string, public Subdivision: string) { }
}

export class Price {
  constructor(public Amount: number, public CurrencyCode: string = 'USD') { }
}

export class ExternalQuestion {
  constructor(public ExternalURL: string, public FrameHeight: number) { }
}

export enum ComparatorType {
  LessThan,
  LessThanOrEqualTo,
  GreaterThan,
  GreaterThanOrEqualTo,
  EqualTo,
  NotEqualTo,
  Exists,
  DoesNotExist,
  In,
  NotIn
}

export class QualificationRequirement {
  constructor(public QualificationTypeId: string,
              public Comparator: ComparatorType,
              public IntegerValue?: number,
              public LocaleValue?: Locale,
              public RequiredToPreview: boolean = false) { }

  static SystemIDs = {
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
  }
}

/**
Generate a AWS Mechanical Turk API request signature; see http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/MakingRequests_RequestAuthenticationArticle.html#CalcReqSig

- secretAccessKey: Your AWS Secret Access Key
- service: The service name
- operation: The operation to perform
- timestamp: The timestamp to be sent with the mturk message.

Returns a base64-encoded string
*/
function sign(AWSSecretAccessKey: string, Service: string, Operation: string, Timestamp: string) {
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
  _.each(params, (value, key) => {
    if (value === undefined) {
      // ignore undefined values
    }
    else if (Array.isArray(value)) {
      // &QualificationRequirement.1.QualificationTypeId=789RVWYBAZW00EXAMPLE
      // &QualificationRequirement.1.IntegerValue=18
      // &QualificationRequirement.2.QualificationTypeId=237HSIANVCI00EXAMPLE
      // &QualificationRequirement.2.IntegerValue=1
      _.each(value, (item, index) => {
        _.each(item, (value, sub_key) => {
          serialized[`${key}.${index}.${sub_key}`] = value;
        });
      });
    }
    // else if (value.toXML) {
    //   // not sure if this is the best approach. I really doubt it.
    //   // Maybe each possible AWS parameter object should inherit some AWSSerializable interace?
    //   serialized[key] = value.toXML();
    // }
    else if (typeof value == 'object') {
      // if (value.toJSON) value = value.toJSON();
      // &BonusAmount.1.Amount=5
      // &BonusAmount.1.CurrencyCode=USD
      _.each(value, (value, sub_key) => {
        serialized[`${key}.1.${sub_key}`] = value;
      });
    }
    else {
      // &Reason=Thanks%20for%20doing%20great%20work!
      serialized[key] = value;
    }
  });
  return serialized;
}

interface PostParameters {
  Operation: string;
  [index: string]: any;
}

interface APIRequest {
  AWSAccessKeyId: string;
  Service: string;
  Operation: string;
  Signature: string;
  Timestamp: string;
  ResponseGroup?: string;
  Version?: string;
}

/**
The AWS documentation calls the sandbox and production sites, variously,
"environment", "version", and "system". I think environment is the most
descriptive of these.
*/
export enum Environment { sandbox, production }

export class Account {
  constructor(public AWSAccessKeyId: string, public AWSSecretAccessKey: string) { }

  createConnection(environment: Environment = Environment.production): Connection {
    return new Connection(this, environment);
  }
}

export class Connection {
  Version: string = '2014-08-15';
  Service: string = 'AWSMechanicalTurkRequester';
  constructor(public account: Account, public environment: Environment) { }

  get url() {
    return (this.environment == Environment.production) ?
      'https://mechanicalturk.amazonaws.com' :
      'https://mechanicalturk.sandbox.amazonaws.com';
  }

  private _prepareOptions(params: PostParameters): request.Options {
    let Timestamp = new Date().toISOString();
    let request_parameters: APIRequest = {
      AWSAccessKeyId: this.account.AWSAccessKeyId,
      Service: this.Service,
      Operation: params.Operation,
      Signature: sign(this.account.AWSSecretAccessKey, this.Service, params.Operation, Timestamp),
      Timestamp: Timestamp,
      Version: this.Version,
    };
    let form = serialize(_.extend(request_parameters, params));
    return { form: form, url: this.url };
  }

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
  post(params: PostParameters, callback: (error: Error, xml?: string) => void) {
    var options = this._prepareOptions(params);
    request.post(options, (error, response, xml) => {
      callback(error, xml);
    });
  }

  get(operation: string, params: any, callback: (error: Error, result?: any) => void) {
    throw new Error('Not yet implemented');
  }
}
