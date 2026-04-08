const bcrypt = require("bcrypt");

class PasswordUtil {
  static async hash(password, rounds = 10) {
    return bcrypt.hash(password, rounds);
  }

  static async compare(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
}

module.exports = { PasswordUtil };
