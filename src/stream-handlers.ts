/// <reference path="../twitter.d.ts" />

import log from './log'
import parseTweet from './parser'
import { StreamData } from 'twitter';

// This is John's user ID, we'll use it to pluck out his tweets
const officialmcafee = 961445378

/**
 * When data is received from a stream we need to figure out what to do.
 * If John tweeted it then we determine if it's his coin of the day.
 * @param data
 */
export function onStreamData (data: StreamData) {
  if (data.user && data.user.id === officialmcafee) {
    log('stream received data. was a mcaffee tweet')
    log(JSON.stringify(data))
    parseTweet(data)
  }
}
