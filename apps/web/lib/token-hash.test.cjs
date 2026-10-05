const { hashRefreshToken } = require("./token-hash.js");

describe("hashRefreshToken", () => {
  it("is stable and never returns the refresh token", () => {
    const token = "random-refresh-token-value";
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    expect(hashRefreshToken(token)).not.toBe(token);
    expect(hashRefreshToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });
});