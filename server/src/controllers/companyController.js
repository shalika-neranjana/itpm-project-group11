/**
 * Company authentication controller
 */

const bcrypt = require("bcryptjs");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new company
 * @route   POST /api/company/register
 * @access  Public
 */
const registerCompany = async (req, res, next) => {
    try {
        const {
            name,
            industry,
            email,
            password,
            phone,
            website,
            location,
            contactPerson,
            description,
        } = req.body;

        // Validate required fields
        if (!name || !industry || !email || !password) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }

        // Check whether a company with the same email already exists
        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            res.status(400);
            throw new Error("A company with this email already exists");
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create company
        const company = await Company.create({
            name,
            industry,
            email,
            password: hashedPassword,
            phone,
            website,
            location,
            contactPerson,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Company registered successfully",
            data: {
                _id: company._id,
                name: company.name,
                industry: company.industry,
                email: company.email,
                phone: company.phone,
                website: company.website,
                location: company.location,
                contactPerson: company.contactPerson,
                description: company.description,
                logo: company.logo,
                token: generateToken(company._id),
                role: "company",
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login company
 * @route   POST /api/company/login
 * @access  Public
 */
const loginCompany = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            res.status(400);
            throw new Error("Email and password are required");
        }

        // Find company by email
        const company = await Company.findOne({ email });

        if (!company) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        // Compare password
        const isPasswordMatched = await bcrypt.compare(password, company.password);

        if (!isPasswordMatched) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: company._id,
                name: company.name,
                industry: company.industry,
                email: company.email,
                phone: company.phone,
                website: company.website,
                location: company.location,
                contactPerson: company.contactPerson,
                description: company.description,
                logo: company.logo,
                token: generateToken(company._id),
                role: "company",
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get company profile
 * @route   GET /api/company/profile
 * @access  Private
 */
const getCompanyProfile = async (req, res, next) => {
    try {
        const company = await Company.findById(req.company._id).select("-password");

        if (!company) {
            res.status(404);
            throw new Error("Company not found");
        }

        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update company profile
 * @route   PUT /api/company/profile
 * @access  Private
 */
const updateCompanyProfile = async (req, res, next) => {
    try {
        const {
            name,
            industry,
            phone,
            website,
            location,
            contactPerson,
            description,
            logo,
        } = req.body;

        const company = await Company.findById(req.company._id);

        if (!company) {
            res.status(404);
            throw new Error("Company not found");
        }

        // Update fields
        company.name = name || company.name;
        company.industry = industry || company.industry;
        company.phone = phone || company.phone;
        company.website = website || company.website;
        company.location = location || company.location;
        company.contactPerson = contactPerson || company.contactPerson;
        company.description = description || company.description;
        company.logo = logo || company.logo;

        await company.save();

        res.status(200).json({
            success: true,
            message: "Company profile updated successfully",
            data: company,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
};
