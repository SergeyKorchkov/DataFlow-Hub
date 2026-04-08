const { AppError } = require("../../utils/AppError");
const { HTTP_STATUS } = require("../../constants/httpStatus");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateRegisterInput(req, res, next) {
  const displayName = String(req.body?.displayName || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!displayName || !email || !password) {
    return next(new AppError("displayName, email and password are required", HTTP_STATUS.BAD_REQUEST));
  }

  if (displayName.length < 2 || displayName.length > 120) {
    return next(new AppError("displayName must be between 2 and 120 characters", HTTP_STATUS.BAD_REQUEST));
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(new AppError("Invalid email format", HTTP_STATUS.BAD_REQUEST));
  }

  if (password.length < 6 || password.length > 72) {
    return next(new AppError("password must be between 6 and 72 characters", HTTP_STATUS.BAD_REQUEST));
  }

  req.validatedBody = { displayName, email, password };
  return next();
}

function validateLoginInput(req, res, next) {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return next(new AppError("email and password are required", HTTP_STATUS.BAD_REQUEST));
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(new AppError("Invalid email format", HTTP_STATUS.BAD_REQUEST));
  }

  req.validatedBody = { email, password };
  return next();
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
