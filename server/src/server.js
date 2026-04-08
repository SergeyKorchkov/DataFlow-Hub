const { env } = require("./config/env");
const { createApp } = require("./app");
const { initializeDatabase } = require("./db/mysql");

const app = createApp();

async function startServer() {
  try {
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.warn("Database ping failed during startup. The API will still start so non-DB features remain available.");
      console.warn(`Reason: ${dbError.message}`);
    }

    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start API server.");
    console.error("Check server/.env database credentials and MySQL availability.");
    console.error(`Reason: ${error.message}`);
    process.exit(1);
  }
}

startServer();
