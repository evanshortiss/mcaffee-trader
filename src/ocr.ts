
import { StreamData } from 'twitter';
import * as request from 'request'
import * as fs from 'fs'
import { v4 as getName } from 'uuid'
import { join, extname } from 'path'
import { tmpdir } from 'os'
import { write } from 'fs';
import log from './log'
import { exec } from 'child_process'

/**
 * Download the tweet image and store in the temporary OS dir
 * @param url
 */
function downloadImage (url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const imagePath = join(tmpdir(), `${getName()}${extname(url)}`)
    const writer = fs.createWriteStream(imagePath)
    const req = request.get(url).pipe(writer)

    req.once('finish', () => {
      log('wrote image to', imagePath)
      resolve(imagePath)
    })
    req.once('error', reject)
  });
}

/**
 * Pass the image path to gocr and parse text from the image
 * @param imagePath
 */
function getTextFromImage (imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`gocr -i ${imagePath}`, (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  });
}

/**
 * Performs steps necessary to get the ticker from an image
 * @param tweet
 */
export default async function getTickerFromImage (tweet: StreamData) {
  if (tweet.entities && tweet.entities.media && tweet.entities.media[0]) {
    log('downloading image')
    const imagePath = await downloadImage(tweet.entities.media[0].media_url)
    log('getting text from image')
    const text = await getTextFromImage(imagePath)
    log(`got text from image: "${text}"`)

    return text
  }
}
