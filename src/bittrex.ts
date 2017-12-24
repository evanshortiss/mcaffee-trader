// Read default environment values if present
require('dotenv').config()

import * as Bittrex from '@evanshortiss/bittrex.js'
import * as env from 'env-var'
import log from './log'

let bought = false;

const client = new Bittrex.RestClient({
  apikey: env.get('BITTREX_API_KEY').required().asString(),
  apisecret: env.get('BITTREX_API_SECRET').required().asString()
})

/**
 * Buy the given ticker using the given BTC amount
 * @param ticker
 * @param btcAmount
 */
export async function buyCoin (ticker: string, btcAmount: number) {
  if (bought) {
    log('already made a purchase. not making another without intervention')
    return
  }

  if (!bought) {
    log('making a purchase!')
    bought = true
  }

  const market = await client.getTicker('btc', ticker)
  const rate = market.Ask
  const amt = Math.floor((btcAmount / (rate * 0.9))).toString()

  log(`buying ${amt} of ${ticker} for ${rate}`)

  const buyResult = await client.buyLimit(
    'btc',
    ticker,
    amt,
    rate.toString()
  )

  return buyResult.uuid
}

/**
 * Return the user's BTC balance
 */
export async function getBtcBalance () {
  const balance = await client.getBalance('btc')

  return balance.Available;
}

/**
 * Check if a given ticker is available for trading on bittrex
 * @param ticker
 */
export async function isTickerAvailable (ticker: string) {
  try {
    await client.getTicker('BTC', ticker)

    // Call was a success so this ticker is available
    return true;
  } catch (e) {
    // Call failed. Determine if it was because the ticker is not valid...
    if (e instanceof Bittrex.Errors.BittrexRestApiError) {
      if (e.bittexMessage === 'INVALID_MARKET') {
        return false
      } else {
        throw e;
      }
    }

    // ...or just because some other HTTP error occurred
    throw e;
  }
}
