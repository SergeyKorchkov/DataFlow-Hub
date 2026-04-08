const { HTTP_STATUS } = require("../constants/httpStatus");

function errorHandler(err, req, res, next) {
  void next;

  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal server error";

  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = "Database access denied. Check DB_USER and DB_PASSWORD in server/.env";
  }

  if (err.code === "ECONNREFUSED") {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = "Cannot connect to MySQL. Make sure MySQL is running and DB_HOST/DB_PORT are correct.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = { errorHandler };
