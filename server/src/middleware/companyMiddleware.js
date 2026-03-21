/**
 * Company authentication middleware
 */

const jwt = require("jsonwebtoken");
const Company = require("../models/Company");

const companyAuth = async (req, res, next) => {
    let token;

    try {
        // Check if Authorization header exists
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach company data to request
            const company = await Company.findById(decoded.id).select("-password");
            
            if (!company) {
                res.status(401);
                throw new Error("Not authorized. Company not found.");
            }

            req.company = company;
            next();
        } else {
            res.status(401);
            throw new Error("Not authorized. Token missing.");
        }

    } catch (error) {
        res.status(401);
        throw new Error("Not authorized. Token failed.");
    }
};

module.exports = companyAuth;
