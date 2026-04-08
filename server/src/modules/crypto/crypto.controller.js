const { CryptoService } = require("./crypto.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { HTTP_STATUS } = require("../../constants/httpStatus");

class CryptoController {
  constructor() {
    this.cryptoService = new CryptoService();
  }

  overview = asyncHandler(async (req, res) => {
    const data = await this.cryptoService.getOverview();
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  });
}

module.exports = { CryptoController };
