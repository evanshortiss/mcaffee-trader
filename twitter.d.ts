
declare module 'twitter' {
  import * as net from 'net'

  namespace t {
    class Twitter {
      constructor (options: ClientOptions)

      stream(path: string, options: StreamOptions): net.Socket
    }

    interface StreamOptions {
      [key: string]: any
    }

    interface ClientOptions {
      consumer_key: string
      consumer_secret: string
      access_token_key: string
      access_token_secret: string
    }

    interface StreamData {
      created_at: string
      id: number
      id_str: string
      text: string
      truncated: boolean
      in_reply_to_status_id: null|string
      in_reply_to_status_id_str: null|string
      in_reply_to_user_id: number
      in_reply_to_user_id_str: string
      in_reply_to_screen_name: string
      user: {
        id: number
      },
      timestamp_ms: string,
      extended_tweet: {
        text: string
      }
    }
  }

  function t (opts: t.ClientOptions): t.Twitter

  export = t
}
