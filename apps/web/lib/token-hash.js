const { createHash } = require("node:crypto");

function hashRefreshToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

module.exports = { hashRefreshToken };