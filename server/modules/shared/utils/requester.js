const rawRequest = require("request");

const requester = rawRequest.defaults({
  headers: {
    "User-Agent": "request",
  },
});

module.exports = requester;
