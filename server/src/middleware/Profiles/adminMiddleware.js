/**
 * Admin middleware for role-based access control.
 * Checks if the authenticated user has admin privileges.
 */

const jwt = require("jsonwebtoken");
const Student = require("../../models/Student");

const adminAuth = async (req, res, next) => {
    let token;

    try {
        // Check if Authorization header exists
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach student data to request
            const student = await Student.findById(decoded.id).select("-password");
            
            if (!student) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized. User not found."
                });
            }

            // Check if user is admin (for now, we'll use a simple check)
            // In a real application, you might have an admin field in the user model
            // or a separate Admin model
            if (student.email !== process.env.ADMIN_EMAIL) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized. Admin access required."
                });
            }

            req.student = student;
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Token missing."
            });
        }

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Token failed."
        });
    }
};

module.exports = { adminAuth };
