import * as nock from 'nock'

const api = nock('https://stream.twitter.com/1.1')

api
  .get('/statuses/filter.json')
  .query(true)
  .reply(200, require('../fixtures/tweet.json'))
