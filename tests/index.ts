import {ok} from 'assert'
import 'mocha'

import {Account, Environment} from '..'

describe('requesting GetAccountBalance on sandbox', () => {
  const account = Account.fromEnvironment()
  const connection = account.createConnection(Environment.sandbox)

  it('should show an Amount of 10000.000', done => {
    connection.post({Operation: 'GetAccountBalance'}, (err, xml) => {
      if (err) done(err)

      ok(/<Amount>10000.000<\/Amount>/.test(xml))
      done()
    })
  })
})
