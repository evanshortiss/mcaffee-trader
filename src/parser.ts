
/// <reference path="../twitter.d.ts" />

import log from './log'
import { StreamData } from 'twitter'
import * as util from './util'
import * as btrx from './bittrex'
import * as classifier from './approximator'

// This will pluck the coin of the day tweet format
const rgx1 = /^coin of the day: \w+ \((.*?)\)/gi
const rgx2 = /^coin of the day \w+ \((.*?)\)/gi

/**
 * Extracts the "coin of the day: $NAME ($SYMBOL)" from a tweet
 * @param text
 */
function pluckCoinOfTheDayString (text: string) {
  const match = text.match(rgx1) || text.match(rgx2)

  if (match) {
    return match[0]
  }
}

/**
 * Extracts the "$SYMBOL" from a tweet
 * @param text
 */
function pluckTickerFromString (text: string) {
  const symbol = text.match(/\((.*?)\)/gi)

  if (symbol) {
    return symbol[0]
      .replace('(', '')
      .replace(')', '')
  }
}

/**
 * Parses a tweet from mcaffee and attempts to buy what he shills
 * @param data
 */
export default async function parseMcaffeeTweet (data: StreamData) {
  const text = data.extended_tweet ? data.extended_tweet.full_text : data.text

  if (!text) {
    log('unable to extract text from tweet. might be malformed!?')
  }

  log(`parsing tweet "${text}"`)

  // Pulls out the sentence "coin of the day: $NAME ($SYMBOL)"
  const coinOfTheDaySentence = pluckCoinOfTheDayString(text)

  if (!coinOfTheDaySentence) {
    log('was a mcaffee tweet but is not coin of the day')
    return;
  }

  const ticker = pluckTickerFromString(coinOfTheDaySentence)

  if (!ticker) {
    log('unable to extract a ticker from tweet')
    log(data.text)
    return
  } else {
    log(`extracted ticker as "${ticker}" from tweet`)
  }

  log(`try purchase ${ticker} on bittrex`)

  const buyResult = await btrx.buyCoin(ticker)

  log('buy result', buyResult)
}
