
import * as debug from 'debug'

const NAME = 'mcpump'
const log = debug(NAME)

export function getLogger (name: string) {
  return debug(`${NAME}:${name}`)
}

export default function (...args: any[]) {
  args.unshift(new Date().toISOString());
  log.apply(log, args)
}
