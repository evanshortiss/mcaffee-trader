/// <reference path="./twitter.d.ts" />

// Load local developer environment variables
require('dotenv').config()

import { StreamData } from 'twitter'
import * as btrx from './src/bittrex'
import getStream from './src/twitter-stream'
import * as util from './src/util'
import * as streamHandlers from './src/stream-handlers'
import log from './src/log'


/**
 * Gets a connection for twitter and registers handlers
 */
function connect () {
  log('connecting to twitter')

  const s = getStream()

  s.on('data', streamHandlers.onStreamData)
  s.on('error', (err: any) => {
    log('error thrown by stream')
    log(err)

    setTimeout(() => {
      connect()
    }, 5000)
  })
}

process.on('unhandledRejection', (e) => {
  console.log('unhandled rejection')
  console.log(e)
})

connect()
