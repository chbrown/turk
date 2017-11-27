#!/usr/bin/env node
import * as optimist from 'optimist'
import * as turk from '..'

const argvparser = optimist
  .usage(`Usage: turk <options>
  turk Operation=SearchQualificationTypes -- query the available search qualification types
  turk Operation=SendTestEventNotification Notification.1.Destination=https://sqs.us-east-1.amazonaws.com/185747841350/turk_all Notification.1.Transport=SQS Notification.1.Version=2006-05-05 Notification.1.EventType=HITReviewable -- query the available search qualification types
  turk Operation=GetAccountBalance -- get your account balance`)
  .options({
    accessKeyId: {
      describe: 'AWS Access Key',
      default: process.env.AWS_ACCESS_KEY_ID,
    },
    secretAccessKey: {
      describe: 'AWS Secret Key',
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

function main() {
  const argv = argvparser.argv

  if (argv.version) {
    console.log(require('../package.json').version)
  }
  else if (argv.help) {
    optimist.showHelp()
  }
  else {
    const params = turk.splitStrings(argv._)
    const environment = argv.production ? turk.Environment.production : turk.Environment.sandbox
    const account = new turk.Account(argv.accessKeyId, argv.secretAccessKey)
    const connection = account.createConnection(environment)
    if (turk.isPostParameters(params)) {
      connection.post(params, function(err, xml) {
        if (err) return console.error(err)

        console.log(xml)
      })
    }
    else {
      throw new Error('"Operation" field must be provided in params string.');
    }
  }
}

if (require.main === module) {
  main();
}
