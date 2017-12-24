/// <reference path="./twitter.d.ts" />

require('dotenv').config()

// This is John's user ID, we'll use it to pluck out his tweets
const officialmcafee = 961445378

import { StreamData } from 'twitter'
import * as btrx from './src/bittrex'
import getStream from './src/twitter-stream'
import * as util from './src/util'
import * as classifier from './src/approximator'
import log from './src/log'

/**
 * If an error occurs when connecting to the stream we need to reconnet
 * @param err
 */
const onStreamError = (err: any) => {
  log('error thrown by stream')
  log(err)

  setTimeout(() => {
    connect()
  }, 5000)
}

/**
 * When data is received from a stream we need to figure out what to do.
 * If John tweeted it then we determine if it's his coin of the day.
 * @param data
 */
const onStreamData = (data: StreamData) => {
  if (data.user && data.user.id === officialmcafee) {
    log('stream received data. was a mcaffee tweet')
    log(JSON.stringify(data, null, 2))

    parseMcaffeeTweet(data)
  } else {
    log('received tweet, but was not by mcaffee')
  }
}

/**
 * Gets a connection for twitter and registers handlers
 */
function connect () {
  log('connecting to twitter')
  const s = getStream()

  s.on('data', onStreamData)
  s.on('error', onStreamError)
}

/**
 * Parses a tweet from mcaffee and attempts to buy what he shills
 * @param data
 */
async function parseMcaffeeTweet (data: StreamData) {
  if (!util.isCoinOfTheDayTweet(data.extended_tweet.text)) {
    log('was a mcaffee tweet but is not coin of the day')
    return;
  }

  const ticker = classifier.getTickerForTweet(data.extended_tweet.text)

  if (!ticker) {
    log('unable to extract a ticker from tweet')
    log(data.text)
    return
  } else {
    log(`extracted ticker as "${ticker}" from tweet`)
  }

  const isAvailableOnBittrex = await btrx.isTickerAvailable(ticker)

  if (isAvailableOnBittrex) {
    log(`purcashing ${ticker} on bittrex`)

    const btcBalance = await btrx.getBtcBalance()

    // Take 10% of balance and buy mcaffee's shill coin
    const amtToSpend = btcBalance * 0.1

    log(`spending approx ${amtToSpend} on ${ticker}`)

    const buyResult = await btrx.buyCoin(ticker, amtToSpend)

    log(`bought ${ticker}. txid is ${buyResult}`)
  } else {
    log(`${ticker} is not available on bittrex, not buying...`)
  }
}

process.on('unhandledRejection', (e) => {
  log('unhandled rejection')
  log(e)
})
connect()
