const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { env } = require("../config/env");

async function initDatabase() {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    multipleStatements: true,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${env.dbName}`);
    await connection.query(`USE ${env.dbName}`);
    await connection.query(schemaSql);
    console.log(`Database '${env.dbName}' initialized successfully.`);
  } finally {
    await connection.end();
  }
}

initDatabase().catch((error) => {
  console.error("Database initialization failed.");
  console.error(error.message);
  process.exit(1);
});
