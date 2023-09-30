const jwt = require('jsonwebtoken'); // Replace with your JWT library
const User = require('./User'); // Replace with your User model
const SECRET_KEY = 'your-secret-key'; // Replace with your actual secret key

/**
 * TokenVerifier class provides methods to verify and validate JWT tokens.
 * 
 * @class TokenVerifier with methods to verify and validate JWT tokens.
 */
class TokenVerifier {
  /**
   * Verifies the JWT token in the Authorization header of the request.
   * If the token is valid, attaches the user object and sub property to the request object and calls the next middleware.
   * If the token is invalid or missing, sends an error response.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  static async verifyToken(req, res, next) {
    try {
      const token = this.extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        return this.sendErrorResponse(res, 'Access denied. Invalid or missing token.', 401);
      }

      this.validateAndAttachUser(token, req, res, next);
    } catch (error) {
      this.sendErrorResponse(res, 'Invalid token.', 400);
    }
  }

  /**
   * Extracts the JWT token from the Authorization header of the request.
   * @param {string} header - The Authorization header of the request.
   * @returns {string|null} - The JWT token or null if not found.
   */
  static extractTokenFromHeader(header) {
    return header?.startsWith('Bearer ') ? header.split('Bearer ')[1] : null;
  }

  /**
   * Validates the JWT token and attaches the user object and sub property to the request object.
   * If the token is invalid, sends an error response.
   * @param {string} token - The JWT token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  static async validateAndAttachUser(token, req, res, next) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const user = await User.findOne({ sub: decoded.sub });

      if (!user) {
        return this.sendErrorResponse(res, 'User not found.', 404);
      }

      req.user = user;
      req.sub = decoded.sub;
      next();
    } catch (error) {
      this.sendErrorResponse(res, 'Invalid token.', 400);
    }
  }

  /**
   * Sends an error response with the given message and status code.
   * @param {Object} res - The response object.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   * @returns {Object} - The response object.
   */
  static sendErrorResponse(res, message, statusCode) {
    console.error(message);
    return res.status(statusCode).json({ message });
  }
}

// Example usage:
// const tokenVerifier = new TokenVerifier();
// app.use(tokenVerifier.verifyToken);

module.exports = TokenVerifier;
