const { HTTP_STATUS } = require("../constants/httpStatus");

function healthController(req, res) {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      status: "ok",
      service: "InfoPortal Pro API",
    },
  });
}

module.exports = { healthController };
