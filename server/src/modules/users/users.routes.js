const express = require("express");
const { UsersController } = require("./users.controller");
const { authMiddleware } = require("../auth/auth.middleware");

const usersRouter = express.Router();
const usersController = new UsersController();

usersRouter.get("/me", authMiddleware, usersController.me);

module.exports = { usersRouter };
