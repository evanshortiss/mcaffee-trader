// Read default environment values if present
require('dotenv').config()

import * as Bittrex from '@evanshortiss/bittrex.js'
import * as env from 'env-var'
import log from './log'
import { setTimeout } from 'timers';

const SELL_TIMEOUT = 17 * 60 * 1000

const client = new Bittrex.RestClient({
  apikey: env.get('BITTREX_API_KEY').required().asString(),
  apisecret: env.get('BITTREX_API_SECRET').required().asString()
})

/**
 * Sell the coin after 17 minutes.
 * Need to make this smarter so it tracks volume, price etc.
 * @param ticker
 */
function queueSell (ticker: string) {
  setTimeout(async () => {
    log(`begin sell of all purcashed ${ticker}`)

    const market = await client.getTicker('BTC', ticker)
    const balance = await client.getBalance(ticker)

    log(`selling ${balance.Available} units of ${ticker} for ${market.Ask.toFixed(8)}`)

    const sellResult = await client.sellLimit(
      'btc',
      ticker,
      balance.Available.toString(),
      (market.Ask * 0.98).toFixed(8)
    )

    log(`sell success:`, sellResult)
  }, SELL_TIMEOUT)
}

/**
 * Logs the order book for the given ticker vs. BTC
 * @param ticker
 */
async function logOrderBook(ticker: string) {
  log(`logging order book for BTC-${ticker}`)

  const orders = await client.getOrderBook('BTC', ticker, 'BOTH')

  log(JSON.stringify(orders, null, 4))
}

/**
 * Buy the given ticker using the given BTC amount
 * @param ticker
 * @param btcAmount
 */
export async function buyCoin (ticker: string, btcAmount: number) {
  log(`purchasing some ${ticker} using ${btcAmount.toFixed(8)} BTC. getting market btc-${ticker}`)

  const market = await client.getTicker('BTC', ticker)
  const rate = market.Ask

  if (btcAmount < rate) {
    log(`amount of btc alllocated for purchase (${btcAmount.toFixed(8)}) is less than ask of ${rate.toFixed(8)} per coin`)
    return
  }

  log(`current ask for BTC-${ticker} is ${rate.toFixed(8)}`)

  const amt = Math.floor((btcAmount / rate * 0.95)).toString()

  log(`buying ${amt} units of ${ticker} at ${rate}`)

  const buyResult = await client.buyLimit(
    'btc',
    ticker,
    amt,
    (rate * 1.05).toFixed(8)
  )

  // Prepare a sell off of the coin after it pumps
  queueSell(ticker)

  // Log the order book so we have a snapshot of it at pump time
  logOrderBook(ticker)

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
