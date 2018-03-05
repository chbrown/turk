import * as request from 'request'
import {createHmac} from 'crypto'
import * as optimist from 'optimist'

export interface StringObject {
  [index: string]: string
}

export function splitStrings(args: string[]): StringObject {
  const object: StringObject = {}
  args.forEach(arg => {
    const [key, value] = arg.split('=')
    object[key] = value
  })
  return object
}

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
  NotIn,
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
    },
  }
}

/**
Generate a AWS Mechanical Turk API request signature.

See http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkRequester/MakingRequests_RequestAuthenticationArticle.html#CalcReqSig

- AWSSecretAccessKey: Your AWS Secret Access Key
- Service: The service name
- Operation: The operation to perform
- Timestamp: The timestamp to be sent with the mturk message.

Returns a base64-encoded string
*/
function sign(AWSSecretAccessKey: string, Service: string, Operation: string, Timestamp: string) {
  const hmac = createHmac('sha1', AWSSecretAccessKey)
  hmac.update(Service + Operation + Timestamp)
  return hmac.digest('base64')
}

/**
The AWS Mechanical Turk REST API has a particular way of serializing complex
objects, like lists. (Gosh, wouldn't it be handy if there were some standard
that specified how to do this sort of thing? We could call it, say, "JSON" or
some silly name like that.)
*/
function serialize(params: {[index: string]: any}): StringObject {
  const serialized: StringObject = {}
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value === undefined) {
      // ignore undefined values
    }
    else if (Array.isArray(value)) {
      // &QualificationRequirement.1.QualificationTypeId=789RVWYBAZW00EXAMPLE
      // &QualificationRequirement.1.IntegerValue=18
      // &QualificationRequirement.2.QualificationTypeId=237HSIANVCI00EXAMPLE
      // &QualificationRequirement.2.IntegerValue=1
      value.forEach((item, index) => {
        Object.keys(item).forEach(subKey => {
          const subValue = item[subKey]
          serialized[`${key}.${index}.${subKey}`] = subValue
        })
      })
    }
    // else if (value.toXML) {
    //   // not sure if this is the best approach. I really doubt it.
    //   // Maybe each possible AWS parameter object should inherit some AWSSerializable interace?
    //   serialized[key] = value.toXML()
    // }
    else if (typeof value == 'object') {
      // if (value.toJSON) value = value.toJSON()
      // &BonusAmount.1.Amount=5
      // &BonusAmount.1.CurrencyCode=USD
      Object.keys(value).forEach(subKey => {
        const subValue = value[subKey]
        serialized[`${key}.1.${subKey}`] = subValue
      })
    }
    else {
      // &Reason=Thanks%20for%20doing%20great%20work!
      serialized[key] = value
    }
  })
  return serialized
}

export interface PostParameters {
  Operation: string
  [index: string]: any
}
export function isPostParameters(params: StringObject): params is PostParameters {
  return 'Operation' in params
}

interface APIRequest {
  AWSAccessKeyId: string
  Service: string
  Operation: string
  Signature: string
  Timestamp: string
  ResponseGroup?: string
  Version?: string
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
    return new Connection(this, environment)
  }
}

export class Connection {
  Service: string = 'AWSMechanicalTurkRequester'
  Version: string = '2014-08-15'
  constructor(public account: Account, public environment: Environment) { }

  get url(): string {
    return this.environment == Environment.production ?
      'https://mechanicalturk.amazonaws.com' :
      'https://mechanicalturk.sandbox.amazonaws.com'
  }

  private _prepareOptions(params: PostParameters): request.Options {
    const {Service, Version, url, account: {AWSAccessKeyId, AWSSecretAccessKey}} = this
    const {Operation} = params
    const Timestamp = new Date().toISOString()
    const Signature = sign(AWSSecretAccessKey, Service, Operation, Timestamp)
    const requestParameters: APIRequest = {AWSAccessKeyId, Service, Operation, Signature, Timestamp, Version}
    const form = serialize({...requestParameters, ...params})
    return {form, url}
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
  post(params: PostParameters,
       callback: (error: Error, xml?: string) => void) {
    const options = this._prepareOptions(params)
    request.post(options, (error: Error, response, xml: string) => {
      callback(error, xml)
    })
  }

  get(operation: string,
      params: any,
      callback: (error: Error, result?: any) => void) {
    throw new Error('Not yet implemented')
  }
}

export function main() {
  const argvparser = optimist
  .usage(`Usage: turk <options>
  turk Operation=SearchQualificationTypes -- query the available search qualification types
  turk Operation=SendTestEventNotification Notification.1.Destination=https://sqs.us-east-1.amazonaws.com/185747841350/turk_all Notification.1.Transport=SQS Notification.1.Version=2006-05-05 Notification.1.EventType=HITReviewable -- query the available search qualification types
  turk Operation=GetAccountBalance -- get your account balance`)
  .options({
    accessKeyId: {
      describe: 'AWS Access Key ID',
      default: process.env.AWS_ACCESS_KEY_ID,
    },
    secretAccessKey: {
      describe: 'AWS Secret Access Key',
      default: process.env.AWS_SECRET_ACCESS_KEY,
    },
    production: {
      describe: 'Use the production environment (default: sandbox)',
      type: 'boolean',
      alias: 'p',
    },
    help: {
      describe: 'print this help message',
      type: 'boolean',
      alias: 'h',
    },
    verbose: {
      describe: 'print extra output',
      type: 'boolean',
    },
    version: {
      describe: 'print version',
      type: 'boolean',
    },
  })

  const argv = argvparser.argv

  if (argv.version) {
    const {version} = require('./package.json')
    process.stdout.write(`${version}\n`)
  }
  else if (argv.help) {
    argvparser.showHelp()
  }
  else {
    const params = splitStrings(argv._)
    const environment = argv.production ? Environment.production : Environment.sandbox
    const account = new Account(argv.accessKeyId, argv.secretAccessKey)
    const connection = account.createConnection(environment)
    if (isPostParameters(params)) {
      connection.post(params, (err, xml) => {
        if (err) throw err

        process.stdout.write(`${xml}\n`)
      })
    }
    else {
      throw new Error('"Operation" field must be provided as CLI argument.')
    }
  }
}

if (require.main === module) {
  main()
}
