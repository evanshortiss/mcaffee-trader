# McAfee Trader - Pump and Dump Bot

Simple application that will listen for McAfee's tweets and potentially buy a
coin he is pushing pon Bittrex, and maybe Binance in the future.

## How it Works
The percentage values below can be changed in `src/bittrex.ts`. Should ideally
place them in the `.env` file to avoid recompiles.

* It uses the Twitter Stream API to listen for tweets by McAfee.
* When a tweet is posted we check it starts with "coin of the day".
* If it passes that check we then check if it has an image attached.
* If an image is present we download it.
* The image is passed to GOCR for text analysis.
* ~~In the the returned text we take the first line and check the format is `COIN-NAME (COIN-SYMBOL)`~~ <= Totally should be doing this...
* We take the first line find content between parentheses i.e, change `(BTC)` to
just `BTC`.
* If a coin symbol is found we check it is available on Bittrex.
* Take 20% of our BTC balance and use that to prepare a limit buy.
* Place a limit buy to buy the coin at it's current value plus ~10%, to increase
likelihood of buy success.
* Immediately queue a task to sell the coin in 5 minutes at whatever value it
pumped up to, minus 3% to increase likelihood of sale success.
* WIN? LOSE?

The code will occasionaly fetch your BTC balance and the current market rates
from Bittrex, so don't worry if you see those logs- it's not buying/selling
anything during that time.

## Logs
By default logging is a little excessive. You can trim them down by changing the
`DEBUG=*` in `package.json` to `DEBUG=mcpump` to enable just the local logger
instead of all loggers.

## Old Code
This project has some old code lying around since McAfee changed his tweet style
and strategy. He used to just tweet text, and this program used a classifier to
approximate the coin being advertised, but the classifier added a ~30-50ms
delay, so now the program parses using RegEx and simple string manipulation
since his tweets are generally the same format and it's much faster (~1ms at
worst).

## Usage
Once you install the dependencies mentioned below you'll need to configure
your Twitter and Bittrex credentials. You need an account with both to get
these. It's Google friendly stuff (besides the terrible Bittre UI/UX for
managing API keys and secrets), so come back here once you have the following:

* Bittrex API Key
* Bittrex API Secret
* Twitter Consumer Key
* Twitter Consumer Secret
* Twitter Access Token Key
* Twitter Access Token Secret

Once you have those create a file named `.env` inside the root of this project.

Paste the following into the file, but replace the `VALUE` with the ones you got
from Bittrex and Twitter.

```
TWITTER_CONSUMER_KEY=VALUE
TWITTER_CONSUMER_SECRET=VALUE
TWITTER_ACCESS_TOKEN_KEY=VALUE
TWITTER_ACCESS_TOKEN_SECRET=VALUE
BITTREX_API_KEY=VALUE
BITTREX_API_SECRET=VALUE
```

If you want you can also set these as environment variables using your preferred
method.

Now, from the project directory run `npm install` to fetch dependencies like so:

```
cd mcaffee-bot-folder
npm install
```

Once that's complete you should be able to run `npm start` after `npm install`
is finished and the program will start listening for Mr. McAfee's tweets. It
will occasionally fetch your BTC balance and the latest coin prices from Bittrex
to be ready to buy faster when McAfee tweets.


## Installing Dependencies

### GOCR
Used for text recognition in images that McAfee uploads.

On macOS you can install via Homebrew like so:

```
$ brew update
$ brew install gocr
```

On Ubuntu you can install like so (sudo and update might be optional):

```
$ sudo apt-get update
$ sudo apt-get install gocr
```

You can verify it installed by running the help command:

```
$ gocr --help
```

If help is printed you should be good to go.

### Node.js
Latest Node.js 8.x, or latest version 6.x should both work. I recommend using
[nvm](https://github.com/creationix/nvm) to install Node.js and easily switch
between versions on a host machine.

Once you have `nvm` installed you can install and switch verions like so:

```
$ nvm install 8
$ nvm use 8
```

### npm
This should be installed when you install Node.js but make sure you're using a
recent version of either 4 or 5. Remember if you use nvm to switch Node.js
version your npm version will also change.

```
# Check version
$ npm --version

# Update to v5
$ npm install -g npm@5
```
