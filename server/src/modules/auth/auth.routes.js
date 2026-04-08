const express = require("express");
const { AuthController } = require("./auth.controller");
const { validateRegisterInput, validateLoginInput } = require("./auth.validation");

const authRouter = express.Router();
const authController = new AuthController();

authRouter.post("/register", validateRegisterInput, authController.register);
authRouter.post("/login", validateLoginInput, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh", authController.refresh);

module.exports = { authRouter };
