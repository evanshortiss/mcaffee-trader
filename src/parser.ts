
/// <reference path="../twitter.d.ts" />

import log from './log'
import { StreamData } from 'twitter'
import * as util from './util'
import * as btrx from './bittrex'
import * as classifier from './approximator'

/**
 * Parses a tweet from mcaffee and attempts to buy what he shills
 * @param data
 */
export default async function parseMcaffeeTweet (data: StreamData) {
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

    const buyResult = await btrx.buyCoin(ticker)

    log(`bought ${ticker}. txid is ${buyResult}`)
  } else {
    log(`${ticker} is not available on bittrex, not buying...`)
  }
}
