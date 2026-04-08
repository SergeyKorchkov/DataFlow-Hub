const { UserRepository } = require("../../repositories/UserRepository");
const { AppError } = require("../../utils/AppError");
const { HTTP_STATUS } = require("../../constants/httpStatus");

class UsersService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getCurrentProfile(userId) {
    if (!userId) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}

module.exports = { UsersService };
