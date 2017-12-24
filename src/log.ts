
import * as debug from 'debug'

const log = debug('mcpump')

export default function (...args: any[]) {
  args.unshift(new Date().toISOString())
  log.apply(log, args)
}
