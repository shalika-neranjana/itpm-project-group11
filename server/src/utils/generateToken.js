/**
 * Generates a JWT token for an authenticated student.
 */

const jwt = require("jsonwebtoken");

/**
 * Creates a signed JWT token with the student ID.
 *
 * @param {string} id - MongoDB student document ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

module.exports = generateToken;