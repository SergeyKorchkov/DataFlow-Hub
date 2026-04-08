const express = require("express");
const { CryptoController } = require("./crypto.controller");

const cryptoRouter = express.Router();
const cryptoController = new CryptoController();

cryptoRouter.get("/overview", cryptoController.overview);

module.exports = { cryptoRouter };
