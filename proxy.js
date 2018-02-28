const Proxy = require("monkey-miner-stratum");
const proxy = new Proxy({
  host: "mine.moneropool.com",
  port: 3333
});
proxy.listen(80);
