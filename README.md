## MonkeyMiner Stratum Proxy

This proxy allows you to use MonkeyMiner's JavaScript miner on a custom stratum pool.

You can mine cryptocurrencies [Monero (XMR)](https://getmonero.org/) and [Electroneum (ETN)](http://electroneum.com/).

## Installation

```
npm install -g monkey-miner-stratum
```

## Usage

You just need to launch a proxy pointing to the desired pool:

```
monkey-miner-stratum 8892 --host=pool.supportxmr.com --port=3333
```

And then just point your MonkeyMiner miner to the proxy:

```html
<script src="https://coinhive.com/lib/coinhive.min.js"></script>
<script>
  // Configure MonkeyMiner to point to your proxy
  MonkeyMiner.CONFIG.WEBSOCKET_SHARDS = [["ws://localhost:8892"]];

  // Start miner
  var miner = MonkeyMiner.Anonymous('your-monero-address');
  miner.start();

</script>
```

Now your MonkeyMiner miner would be mining on `supportXMR.com` pool, using your monero address. This will work for any pool
based on the [Stratum Mining Protocol](https://en.bitcoin.it/wiki/Stratum_mining_protocol). You can even set up
[your own](https://github.com/zone117x/node-stratum-pool).

## Stats

The proxy provides a few endpoints to see your stats:

* `/stats`: shows the number of miners and connections

* `/miners`: list of all miners, showing id, login and hashes for each one.

* `/connections`: list of connections, showing id, host, port and amount of miners for each one.

Example: http://localhost:8892/stats

If you want to protect these endpoints (recommended) use the `credentials: { user, pass }` option in the proxy
constructor or the `--credentials=username:password` flag for the CLI.

## CLI

```
Usage: 'monkey-miner-stratum <port>'

<port>: The port where the server will listen to

Options:

  --host                        The pool's host.
  --port                        The pool's port.
  --pass                        The pool's password, by default it's "x".
  --ssl                         Use SSL/TLS to connect to the pool.
  --address                     A fixed wallet address for all the miners.
  --user                        A fixed user for all the miners.
  --diff                        A fixed difficulty for all the miner. This is not supported by all the pools.
  --dynamic-pool                If true, the pool can be set dynamically by sending a ?pool=host:port:pass query param to the websocket endpoint.
  --max-miners-per-connection   Set the max amount of miners per TCP connection. When this number is exceded, a new socket is created. By default it's 100.
  --path                        Accept connections on a specific path.
  --key                         Path to private key file. Used for HTTPS/WSS.
  --cert                        Path to certificate file. Used for HTTPS/WSS.
  --credentials                 Credentials to access the /stats, /miners and /connections endponts. (usage: --credentials=username:password)
```

## API

* `createProxy`: Creates a `proxy` server. It may take an `options` object with the following optional properties:

  * `host`: the pool's host.

  * `port`: the pool's port.

  * `pass`: the pool's password, default is `"x"`.

  * `ssl`: use SSL/TLS to connect to the pool.

  * `address`: a fixed wallet address for all the miners.

  * `user`: a fixed user for all the miners.

  * `diff`: a fixed difficulty for all the miners.

  * `dynamicPool`: if true, the pool can be set dynamically by sending a `?pool=host:port:pass` query param to the
    websocket endpoint.

  * `maxMinersPerConnection`: max amount of miners per TCP connection, when this number is exceded, a new socket is
    created. Default it's `100`.

  * `path`: accept connections on a specific path (ie: '/proxy').

  * `server`: use a custom http/https server.

  * `key`: path to private key file (used for https/wss).

  * `cert`: path to certificate file (used for https/wss).

  * `credentials`: specify credentials for the API endpoints (`/stats`, `/miners`, `/connections`). If credentials are
    provided, you will need to use [Basic Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) to
    access the endpoints.

    * `user`: a username for the API endpoints

    * `pass`: a password for the API endpoints.

* `proxy.listen(port [, host])`: launches the server listening on the specified port (and optionally a host).

* `proxy.on(event, callback)`: specify a callback for an event, each event has information about the miner who triggered
  it. The types are:

  * `open`: a new connection was open from a miner (ie. the miner connected to the proxy).

  * `authed`: a miner has been authenticated on the pool.

  * `close`: a connection from a miner was closed (ie. the miner disconnected from the proxy).

  * `error`: an error ocurred.

  * `job`: a new mining job was received from the pool.

  * `found`: a hash meeting the pool's difficulty was found and will be sent to the pool.

  * `accepted`: a hash that was sent to the pool was accepted.

## Health Check

The proxy provides a few endpoints to do some health checks:

* `/ping`: always responds with a `200`.

* `/ready`: responds with a `200` if the proxy is up, bound and running. Otherwise returns a `503`.

* `/version`: responds with the version of the proxy in json format, ie: `{ version: "2.x.x" }`.

Example: http://localhost:8892/version

## FAQ

#### Can I use this programmatically?

Yes, like this:

```js
const Proxy = require("monkey-miner-stratum");
const proxy = new Proxy({
  host: "YOUR PORT",
  port: 3333 (PORT YOUR POOL)
});
proxy.listen(8892);
```

#### Can I use several workers?

Yes, just create a `MonkeyMiner.User` and the username will be used as the stratum worker name:

```html
<script src="https://coinhive.com/lib/coinhive.min.js"></script>
<script>
  // Configure MonkeyMiner to point to your proxy
  MonkeyMiner.CONFIG.WEBSOCKET_SHARDS = [["ws://localhost:8892"]];

  // Start miner
  var miner = MonkeyMiner.User('your-monero-address', 'my-worker');
  miner.start();

</script>
```

#### Can I run this on Docker?

Yes, use a `Dockerfile` like this:

```
FROM node:8-slim

# Install monkey-miner-stratum
RUN npm i -g monkey-miner-stratum --unsafe-perm=true --allow-root

# Run monkey-miner-stratum
ENTRYPOINT ["monkey-miner-stratum"]
```

Now build the image:

```
$ docker build -t monkey-miner-stratum .
```

And run the image:

```
$ docker run --rm -t -p 8892:8892 monkey-miner-stratum 8892 --host=pool.supportxmr.com --port=3333
```

#### How can I make my proxy work with wss://?

You will need to pass a private key file and a certificate file to your proxy:

```js
const Proxy = require("monkey-miner-stratum");
const proxy = new Proxy({
  host: "pool.supportxmr.com",
  port: 3333,
  key: require("fs").readFileSync("key.pem"),
  cert: require("fs").readFileSync("cert.pem")
});
proxy.listen(8892);
```

Now you can connect to your proxy using `wss://` and hit the stats and health check endpoints (ie, `/stats`) though `https://`.

To generate your SSL certificates for your domain or subdomain you can use [Certbot](https://certbot.eff.org/).

Certbot will generate the SSL certificates under these paths (where `example.com` is your domain):

* **key**: `/etc/letsencrypt/live/example.com/privkey.pem`
* **cert**: `/etc/letsencrypt/live/example.com/fullchain.pem`

So you can use them like this:

```js
const Proxy = require("monkey-miner-stratum");
const proxy = new Proxy({
  host: "pool.supportxmr.com",
  port: 3333,
  key: require("fs").readFileSync("/etc/letsencrypt/live/example.com/privkey.pem"),
  cert: require("fs").readFileSync("/etc/letsencrypt/live/example.com/fullchain.pem")
});
proxy.listen(8892);
```
If you use those assets, the `MonkeyMiner` global variable will be accessible as `MM`.

## Disclaimer

This project is not endorsed by or affiliated with `monkeymustache.com` in any way.

## Support

This project is configured with a 0% donation. If you wish to disable it, please consider doing a one time donation and
buy me a beer with [monkey miner]:

```
BTC      : 13eRbGyUJmwqyHoJAu7wtQ67phc1Ps5NGV
ETH      : 0x263B2895Be3c6e48036ae88f1e3E44B2aF55CFB9
BTC Cash : qqwsg2mwyc2xsfq04d6ywzv47dtj06sp7s5dzamsdm
XMR      : 4HdCuVQZWyrHMVRV7acVa9CA4gtkPnurcDaosc43m2suC3f7ik5ZD6FW955b5sYAQHBX7Y5R7TmhJ1YBURB2WT9y39LwcpNuQ74STngqEu
```

<3
