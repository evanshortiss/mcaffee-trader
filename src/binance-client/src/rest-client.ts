// import * as Models from './models';
// import * as url from 'url-join'
// import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
// import { getLogger } from './log'
// import { stringify } from 'querystring'
// import { BinanceRestApiError, BinanceHttpError } from './errors'
// import { endianness } from 'os';

// const log = getLogger('rest-client')

// const AXIOS_DEFAULTS: AxiosRequestConfig = {
//   timeout: 15000
// }

// export class RestClient {
//   protected options: Models.RestClientOptions
//   protected axios: AxiosInstance

//   constructor (options: Models.RestClientOptions) {
//     this.options = options

//     // this.axios = axios.create(Object.assign(AXIOS_DEFAULTS, options.axiosOptions || {}))

//     // // Log outgoing requests
//     // this.axios.interceptors.request.use((config: AxiosRequestConfig) => {
//     //   log(`making request with url ${config.url}`)

//     //   return config
//     // })

//     // // Log incoming responses
//     // this.axios.interceptors.response.use((resp) => {
//     //   log(`received ${resp.status} response for request to ${resp.config.url}. response data %j`, resp.data)

//     //   return resp;
//     // })
//   }

//   /**
//    * Perform a request to the given REST endpoint with the passed options.
//    * @param uri Relative path to call.
//    * @param options AxiosRequestConfig options.
//    */
//   async http (endpoint: Models.Endpoint, options: AxiosRequestConfig = {}) {
//     // Need to manually build querystring to generate hmac for the request
//     const querystring = stringify(
//       Object.assign(
//         options.params || {}
//       )
//     )

//     // NOTE FOR POSTing DATA TO BINANCE
//     // https://github.com/axios/axios/issues/350#issuecomment-227270046

//     // Don't allow axios to overwrite our querystring using it's internal logic
//     delete options.params

//     // Join the URL parts safely to generate the entire endpoint, e.g:
//     // https://bittrex.com/api/v1.1/$path?apikey=$apikey&nonce=$nonce;
//     const fullUrl = url(
//       'https://api.binance.com/api',
//       endpoint.url,
//       `?${querystring}`
//     )

//     let result: AxiosResponse;

//     const requestOptions = Object.assign({
//       url: fullUrl,
//       headers: {
//         // apisign: getHmac(fullUrl, this.options.apisecret)
//       },
//       // We don't want axios to throw errors for unexpected status codes, we'd
//       // rather handle those ourselves and emit our own error instances
//       validateStatus: () => { return true }
//     }, options)
//     // If axios throws an error, e.g a timeout, we catch it and bubble up
//     try {
//       result = await this.axios.request(requestOptions)
//     } catch (e) {
//       throw e
//       // throw new BittrexHttpError(e)
//     }

//     // Erorr handling here is a little odd due to the way Bittrex handles
//     // responses. Bittrex, why you no use HTTP status codes!?

//     if (result.status !== 200) {
//       // BittrexHttpError
//       throw new Error(
//         `received http ${result.status} from bittrex with message "${result.statusText}"`,
//         // result.statusText,
//         // result.status
//       )
//     } else  {
//       return result
//     }
//   }

//   /**
//    * Calls the Binance API endpoint /api/v1/ping
//    *Resolves successfully if the request encounters no errors.
//    */
//   async ping () {
//     const ret = await this.http(ENDPOINTS.PING)

//     return ret.data as Models.RestApiResponses.Ping
//   }

//   /**
//    * Calls the Binance API endpoint /api/v1/time
//    * Returns the JSON specified in the Binance API documentation.
//    */
//   async time () {
//     const ret = await this.http(ENDPOINTS.TIME)

//     return ret.data as Models.RestApiResponses.Time
//   }

//   /**
//    * Calls the Binance API endpoint /api/v1/depth
//    * Returns a friendlier version of the Binance response that looks like so:
//    *
//    * {
//    *    lastUpdateId: number,
//    *    bids: [ { price: number, quantity: number } ],
//    *    asks: [ { price: number, quantity: number } ]
//    * }
//    *
//    * @param symbol
//    * @param limit
//    */
//   async getOrderBook (symbol: string, limit?: number): Promise<Models.RestApiResponses.OrderBook> {
//     const ret = await this.http(ENDPOINTS.ORDERBOOK, {
//       params: {
//         symbol,
//         limit
//       }
//     })

//     const response = ret.data as Models.RestApiResponses.OrderBookRaw

//     function orderMapper (entry) {
//       return {
//         price: entry[0],
//         quantity: entry[1]
//       }
//     }

//     return {
//       lastUpdateId: response.lastUpdateId,
//       bids: response.bids.map(orderMapper),
//       asks: response.asks.map(orderMapper)
//     }
//   }

//   async order (opts: Models.RestApiParams.NewOrder) {
//     const ret = await this.http(ENDPOINTS.ORDER, {})

//     return ret.data as Models.RestApiResponses.NewOrder
//   }

//   async allOrders (opts: Models.RestApiParams.AllOrders) {
//     const ret = await this.http(ENDPOINTS.ORDER, {
//       params: opts
//     })

//     return ret.data as Models.RestApiResponses.Order[]
//   }
// }

// interface EndpointList {
//   [name: string]: Models.Endpoint
// }

// const ENDPOINTS: EndpointList = {
//   PING: {
//     url: '/v1/ping',
//     security: 'NONE'
//   },
//   TIME: {
//     url: '/v1/time',
//     security: 'NONE'
//   },
//   ORDERBOOK: {
//     url: 'v1/depth',
//     security: 'NONE'
//   },
//   ORDER: {
//     url: '/v3/order',
//     security: 'SIGNED',
//     method: 'POST'
//   },
//   OPENORDERS: {
//     url: 'v3/openOrders',
//     security: 'SIGNED'
//   },
//   ALLORDERS: {
//     url: 'v3/allOrders',
//     security: 'SIGNED'
//   }
// }
