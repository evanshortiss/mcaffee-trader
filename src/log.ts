
import * as debug from 'debug'

const NAME = 'mcpump'
const log = debug(NAME)

export function getLogger (name: string) {
  return debug(`${NAME}:${name}`)
}

export default log
