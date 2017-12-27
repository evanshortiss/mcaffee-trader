
import { BayesClassifier } from 'natural'
import { Coin } from './models'
import log from './log'

const coins = require('../fixtures/all-coins.json') as Coin[]
const classifier = new BayesClassifier()

// Add each coin ticker and train the classifier
coins.forEach((c) => {
  classifier.addDocument(`${c.name} (${c.symbol})`, c.symbol);
  classifier.addDocument(`${c.name}(${c.symbol})`, c.symbol);
  classifier.addDocument(`${c.name}(${c.symbol}`, c.symbol);
  classifier.addDocument(`${c.name}`, c.symbol);
  classifier.addDocument(`${c.symbol}`, c.symbol);
})

classifier.train()

/**
 * Attempts to determine the ticker that applies to a particular coin.
 * @param text
 */
export function getTickerFromText (text: string) {
  log('classifying text', text)

  const ticker = classifier.classify(text)

  log(`ticker for text appears to be: ${ticker}`)

  return ticker
}
