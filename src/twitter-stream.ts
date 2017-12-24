/// <reference path="../twitter.d.ts" />

// This is John's user ID, we'll use it to pluck out his tweets
const officialmcafee = 961445378

// Streams might be closed and open, so store them and rotate for each new one
let stream: net.Socket;

import * as net from 'net'
import * as Twitter from 'twitter'
import * as env from 'env-var'
import { StreamData } from 'twitter'
import log from './log'

const client = Twitter({
  consumer_key: env.get('TWITTER_CONSUMER_KEY').required().asString(),
  consumer_secret: env.get('TWITTER_CONSUMER_SECRET').required().asString(),
  access_token_key: env.get('TWITTER_ACCESS_TOKEN_KEY').required().asString(),
  access_token_secret: env.get('TWITTER_ACCESS_TOKEN_SECRET').required().asString()
})

/**
 * Returns a twitter stream following John and myself
 */
export function getStream () {
  if (stream) {
    stream.end()
    stream.destroy()
  }

  stream = client.stream('statuses/filter', {
    // follow: 'officialmcafee,evanshortiss',
    follow: '961445378,15011401'
  })

  log('connected to twitter stream...hopefully. module does not emit all events')

  return stream
}

export default getStream
