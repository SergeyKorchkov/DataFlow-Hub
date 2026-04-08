const { AuthService } = require("./auth.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { HTTP_STATUS } = require("../../constants/httpStatus");
const { env } = require("../../config/env");

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req, res) => {
    const session = await this.authService.register(req.validatedBody);
    this._sendSessionResponse(res, HTTP_STATUS.CREATED, session);
  });

  login = asyncHandler(async (req, res) => {
    const session = await this.authService.login(req.validatedBody);
    this._sendSessionResponse(res, HTTP_STATUS.OK, session);
  });

  logout = asyncHandler(async (req, res) => {
    await this.authService.logout(req.cookies[REFRESH_COOKIE_NAME]);

    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  });

  refresh = asyncHandler(async (req, res) => {
    const session = await this.authService.refreshSession(req.cookies[REFRESH_COOKIE_NAME]);
    this._sendSessionResponse(res, HTTP_STATUS.OK, session);
  });

  _sendSessionResponse(res, statusCode, session) {
    res.cookie(REFRESH_COOKIE_NAME, session.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(statusCode).json({
      success: true,
      data: {
        user: session.user,
        accessToken: session.accessToken,
      },
    });
  }
}

module.exports = { AuthController };
