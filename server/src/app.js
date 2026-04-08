const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { corsOptions } = require("./config/cors");
const { apiRouter } = require("./routes");
const { notFoundHandler } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.json({ success: true, message: "InfoPortal Pro API is running" });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
