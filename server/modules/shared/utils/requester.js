const rawRequest = require("request");

const requester = rawRequest.defaults({
  headers: {
    "User-Agent": process.env.VIDEOWIKI_USER_AGENT
  },
});

module.exports = requester;
