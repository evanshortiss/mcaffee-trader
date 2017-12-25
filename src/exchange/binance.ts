
// import * as env from 'env-var'
// import Exchange from './exchange';

// class ExhangeBinance extends Exchange {
//   public client: Binance.BinanceApiClient

//   constructor () {
//     super('binance')

//     this.client = new Binance.BinanceApiClient(
//       env.get('BINANCE_API_KEY').required().asString(),
//       env.get('BINANCE_API_SECRET').required().asString()
//     )
//   }

//   async getBtcBalance () {
//     const account = await this.client.getAccountData()

//     return account.balances
//   }

//   async isTickerAvailable (): Promise<boolean>
//   async buyCoin (symbol: string): Promise<void>
//   async logOrderBook (): Promise<void>
// }
