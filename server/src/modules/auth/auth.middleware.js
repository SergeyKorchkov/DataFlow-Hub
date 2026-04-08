const { TokenUtil } = require("../../utils/token.util");
const { AppError } = require("../../utils/AppError");
const { HTTP_STATUS } = require("../../constants/httpStatus");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new AppError("Missing access token", HTTP_STATUS.UNAUTHORIZED));
  }

  try {
    const decoded = TokenUtil.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired access token", HTTP_STATUS.UNAUTHORIZED));
  }
}

module.exports = { authMiddleware };
