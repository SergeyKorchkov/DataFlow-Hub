const { UserRepository } = require("../../repositories/UserRepository");
const { RefreshTokenRepository } = require("../../repositories/RefreshTokenRepository");
const { TokenUtil } = require("../../utils/token.util");
const { PasswordUtil } = require("../../utils/password.util");
const { AppError } = require("../../utils/AppError");
const { HTTP_STATUS } = require("../../constants/httpStatus");

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async register({ email, password, displayName }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already registered", HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await PasswordUtil.hash(password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      displayName,
    });

    return this._issueSession(user);
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }

    const isValidPassword = await PasswordUtil.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }

    return this._issueSession(user);
  }

  async refreshSession(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Refresh token is required", HTTP_STATUS.BAD_REQUEST);
    }

    let decoded;
    try {
      decoded = TokenUtil.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", HTTP_STATUS.UNAUTHORIZED);
    }

    const tokenRecord = await this.refreshTokenRepository.findActiveToken({
      userId: decoded.id,
      token: refreshToken,
    });

    if (!tokenRecord) {
      throw new AppError("Refresh token not found or revoked", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await this.userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.UNAUTHORIZED);
    }

    await this.refreshTokenRepository.revokeById(tokenRecord.id);
    return this._issueSession(user);
  }

  async logout(refreshToken) {
    if (!refreshToken) {
      return { success: true };
    }

    let decoded;
    try {
      decoded = TokenUtil.verifyRefreshToken(refreshToken);
    } catch {
      return { success: true };
    }

    const tokenRecord = await this.refreshTokenRepository.findActiveToken({
      userId: decoded.id,
      token: refreshToken,
    });

    if (tokenRecord) {
      await this.refreshTokenRepository.revokeById(tokenRecord.id);
    }

    return { success: true };
  }

  async _issueSession(user) {
    const accessToken = TokenUtil.generateAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = TokenUtil.generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    await this.refreshTokenRepository.createToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: this._refreshTokenExpiresAt(),
    });

    return {
      user: this._toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }

  _toPublicUser(user) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  _refreshTokenExpiresAt() {
    const days = 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}

module.exports = { AuthService };
