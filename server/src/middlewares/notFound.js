const { HTTP_STATUS } = require("../constants/httpStatus");

function notFoundHandler(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

module.exports = { notFoundHandler };
