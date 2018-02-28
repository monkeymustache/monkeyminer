const Proxy = require("monkey-miner-stratum");
const domain = "yourdomain.com"
const proxy = new Proxy({
  host: "mine.moneropool.com",
  port: 3336,
  key: require("fs").readFileSync("/etc/letsencrypt/live/" + domain + "/privkey.pem"),
  cert: require("fs").readFileSync("/etc/letsencrypt/live/" + domain + "/fullchain.pem"),
});
proxy.listen(443);
