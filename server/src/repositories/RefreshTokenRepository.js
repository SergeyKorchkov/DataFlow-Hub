const crypto = require("crypto");
const { pool } = require("../db/mysql");

class RefreshTokenRepository {
  static hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async createToken({ userId, token, expiresAt }) {
    const tokenHash = RefreshTokenRepository.hashToken(token);

    const [result] = await pool.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [userId, tokenHash, expiresAt]
    );

    return {
      id: result.insertId,
      userId,
      expiresAt,
    };
  }

  async findActiveToken({ userId, token }) {
    const tokenHash = RefreshTokenRepository.hashToken(token);

    const [rows] = await pool.query(
      `SELECT
        id,
        user_id AS userId,
        expires_at AS expiresAt,
        revoked_at AS revokedAt
      FROM refresh_tokens
      WHERE user_id = ? AND token_hash = ? AND revoked_at IS NULL
       AND expires_at > NOW()
       LIMIT 1`,
      [userId, tokenHash]
    );

    return rows[0] || null;
  }

  async revokeById(tokenId) {
    await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [tokenId]);
  }

  async revokeAllForUser(userId) {
    await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ?", [userId]);
  }

  async deleteExpired() {
    const [result] = await pool.query(
      "DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    return result.affectedRows;
  }
}

module.exports = { RefreshTokenRepository };
