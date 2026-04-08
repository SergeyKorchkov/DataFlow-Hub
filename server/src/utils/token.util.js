const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

class TokenUtil {
  static generateAccessToken(payload) {
    return jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: env.accessTokenExpiresIn,
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: env.refreshTokenExpiresIn,
    });
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, env.jwtAccessSecret);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, env.jwtRefreshSecret);
  }
}

module.exports = { TokenUtil };
