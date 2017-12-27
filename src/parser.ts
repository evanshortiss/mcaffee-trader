
/// <reference path="../twitter.d.ts" />

import log from './log'
import { StreamData } from 'twitter'
import * as util from './util'
import * as btrx from './bittrex'
import * as classifier from './classifier'
import ocr from './ocr'

/**
 * Determines if the tweet is a coin of the day.
 * @param text
 */
function isCoinOfTheDayOrWeekTweet (text: string) {
  return text.match(/^coin of the week/i) || text.match(/^coin of the day/i)
}

/**
 * Parses a tweet from mcaffee and attempts to buy what he shills
 * @param data
 */
export default async function parseMcaffeeTweet (data: StreamData) {
  const tweetText = data.extended_tweet ? data.extended_tweet.full_text : data.text

  if (!tweetText) {
    log('unable to extract text from tweet. it might be malformed')
  }

  if (!isCoinOfTheDayOrWeekTweet(tweetText)) {
    log('is not a coin of the day/week tweet')
    return
  }

  // Get text from tweet image
  const imageText = await ocr(data)

  if (!imageText) {
    log('failed to extract text from image')
    return
  }

  // Classify just the first line. Too many lines skews accuracy
  const tickerLineWithoutSpacing = imageText.split('\n')[0]
    .trim()
    .replace(/ /gi, '')

  log(`first line of image was "${tickerLineWithoutSpacing}"`)

  // TODO: Use regex? Whatever...
  const name = tickerLineWithoutSpacing.split('(')[0].toUpperCase()
  const ticker = tickerLineWithoutSpacing.split('(')[1].split(')')[0].toUpperCase()

  log(`coin name is ${name} and ticker is ${ticker}`)

  if (!ticker) {
    log('failed to extract a ticker from tweet')
    return
  }

  log(`ticker was "${ticker}", try purchase on bittrex`)

  const buyResult = await btrx.buyCoin(ticker)

  log('buy result', buyResult)
}
