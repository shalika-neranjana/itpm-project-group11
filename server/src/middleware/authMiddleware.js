/**
 * Authentication middleware.
 * Protects routes using JWT tokens.
 */

const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const protect = async (req, res, next) => {
    let token;

    try {
        // Check if Authorization header exists
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach student data to request
            req.student = await Student.findById(decoded.id).select("-password");

            next();
        } else {
            res.status(401);
            next(new Error("No authentication token provided."));
        }

    } catch (error) {
        res.status(401);
        next(new Error("Invalid or expired authentication token."));
    }
};

module.exports = protect;