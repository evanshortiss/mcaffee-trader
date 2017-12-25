
/**
 * Returns a truthy result if the tweet looks like a coin of the day tweet
 * @param data
 */
export function getCoinOfTheDay (str: string) {
  return str.match(/^coin of the day:/gi)
}
