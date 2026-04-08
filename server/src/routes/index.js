const express = require("express");
const { healthController } = require("../controllers/health.controller");
const { authRouter } = require("../modules/auth/auth.routes");
const { usersRouter } = require("../modules/users/users.routes");
const { cryptoRouter } = require("../modules/crypto/crypto.routes");

const apiRouter = express.Router();

apiRouter.get("/health", healthController);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/crypto", cryptoRouter);

module.exports = { apiRouter };
