// Read default environment values if present
require('dotenv').config()

import * as Bittrex from '@evanshortiss/bittrex.js'
import * as env from 'env-var'
import log from './log'
import { setTimeout } from 'timers';
import { Models } from '@evanshortiss/bittrex.js';

const SELL_TIMEOUT = 4 * 60 * 1000

const client = new Bittrex.RestClient({
  apikey: env.get('BITTREX_API_KEY').required().asString(),
  apisecret: env.get('BITTREX_API_SECRET').required().asString()
})

// We keep these cached for quicker execution of trades
let supportedMarkets: Bittrex.Models.MarketSummaryEntry[] = []
let btcBalance = 0

// Setup refresh loops for balance and supported markets
fetchBtcBalance()
fetchSupportedMarkets()

/**
 * Fetches supported market tickers so we can quickly determine support.
 */
async function fetchSupportedMarkets () {
  log('fetching market summaries from bittrex')

  const markets = await client.getMarketSummaries()

  // Store market names, e.g XVG as upper case strings
  supportedMarkets = markets;

  log('fetched market summaries from bittrex')

  // Refresh every two minutes
  setTimeout(fetchSupportedMarkets, 2.5 * 60 * 1000)
}

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
      (market.Ask * 0.97).toFixed(8)
    )

    log(`sell result:`, sellResult)
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
export async function buyCoin (ticker: string) {
  // Take 20% of balance and buy mcaffee's shill coin
  const amtToSpend = btcBalance * 0.2

  log(`purchasing ${ticker} using ${amtToSpend.toFixed(8)} BTC. getting market btc-${ticker}`)

  const market = getMarketForTicker(ticker)

  if (!market) {
    log(`unable to find market for symbol ${ticker}`)
    return;
  }

  // Need to be willing to pay a little more than market...
  const rate = market.Last * 1.1

  if (amtToSpend < rate) {
    log(`amount of btc alllocated for purchase (${amtToSpend.toFixed(8)}) is less than ask of ${rate.toFixed(8)} per coin`)
    return
  }

  log(`current ask for BTC-${ticker} is ${market.Last.toFixed(8)}, but we will offer ${rate.toFixed(8)}`)

  const amt = Math.floor(amtToSpend / (rate * 0.9)).toFixed(0)

  log(`buying ${amt} units of ${ticker} at ${rate.toFixed(8)}`)

  const buyResult = await client.buyLimit(
    'btc',
    ticker,
    amt,
    rate.toFixed(8)
  )

  // Prepare a sell off of the coin after it pumps
  queueSell(ticker)

  // Log the order book so we have a snapshot of it at pump time
  logOrderBook(ticker)

  return buyResult.uuid
}

export async function fetchBtcBalance () {
  log('fetching btc balance bittrex')

  const balanceResponse = await client.getBalance('btc')

  btcBalance = balanceResponse.Available;

  log('fetched btc balance bittrex')

  setTimeout(fetchBtcBalance, 30 * 60 * 1000)
}

/**
 * Return the user's BTC balance
 */
export async function getBtcBalance () {
  return btcBalance
}

/**
 * Gets a market object for a ticker
 */
export function getMarketForTicker (ticker: string) {
  return supportedMarkets.find((m) => {
    return m.MarketName.split('-')[1].toUpperCase() === ticker.toUpperCase()
  })
}
