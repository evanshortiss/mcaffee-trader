
import { BayesClassifier } from 'natural'
import log from './log'

const coins = require('../fixtures/all-coins.json') as Coin[]
const classifier = new BayesClassifier()

// Add each coin ticker and train the classifier
coins.forEach((c) => {
  classifier.addDocument(`coin of the day ${c.symbol}`, c.symbol);
  classifier.addDocument(`coin of the day: ${c.symbol}`, c.symbol);
  classifier.addDocument(`coin of the day: ${c.name} (${c.symbol})`, c.symbol);
  classifier.addDocument(`${c.name}`, c.symbol);
})

classifier.train()

/**
 * Returns the first sentence in the tweet that usually contains the format:
 *
 * "Coin of the day: Digibyte (DGB)"
 *
 * or
 *
 * "Coin of the day: BURST -- First truly Green coin and most overlooked coin"
 */
export function getFirstSentenceInTweet (tweet: string) {
  log('getting first sentence in tweet: "%s"', tweet)

  return tweet.split('.')[0]
}

/**
 * Attempts to determine the ticker that applies to a particular coin.
 * @param tweet
 */
export function getTickerForTweet (tweet: string) {
  log('classifying tweet "%s"', tweet)

  const ticker = classifier.classify(getFirstSentenceInTweet(tweet))

  log(`ticker for tweet appears to be: ${ticker}`)

  return ticker
}
