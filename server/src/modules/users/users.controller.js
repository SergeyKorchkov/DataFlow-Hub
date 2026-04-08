const { UsersService } = require("./users.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { HTTP_STATUS } = require("../../constants/httpStatus");

class UsersController {
  constructor() {
    this.usersService = new UsersService();
  }

  me = asyncHandler(async (req, res) => {
    const data = await this.usersService.getCurrentProfile(req.user?.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  });
}

module.exports = { UsersController };
