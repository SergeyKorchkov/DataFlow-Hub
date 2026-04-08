const { pool } = require("../db/mysql");

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT
        id,
        email,
        password_hash AS passwordHash,
        display_name AS displayName
      FROM users
      WHERE email = ?
      LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT
        id,
        email,
        password_hash AS passwordHash,
        display_name AS displayName
      FROM users
      WHERE id = ?
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async create({ email, passwordHash, displayName }) {
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
      [email, passwordHash, displayName]
    );

    return {
      id: result.insertId,
      email,
      displayName,
    };
  }
}

module.exports = { UserRepository };
