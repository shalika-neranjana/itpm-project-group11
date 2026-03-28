/**
 * Internship controller for managing internship postings
 */

const Internship = require("../models/Internship");
const Student = require("../models/Student");
const { deleteUploadedFile, getUploadedFilePath } = require("../utils/uploadUtils");

/**
 * @desc    Get all internships (public)
 * @route   GET /api/internships
 * @access  Public
 */
const getAllInternships = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            specialization,
            type,
            location,
        } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Build query - Show all internships including Draft ones for students
        const query = { status: { $in: ["Published", "Draft"] } };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { "company.name": { $regex: search, $options: "i" } },
            ];
        }

        if (specialization) {
            query.specialization = specialization;
        }

        if (type) {
            query.type = type;
        }

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        // Get internships with company details and total count concurrently
        const [internships, total] = await Promise.all([
            Internship.find(query)
                .populate("company", "name logo")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Internship.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: internships,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single internship
 * @route   GET /api/internships/:id
 * @access  Public
 */
const getInternshipById = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate("company", "name logo description location website");

        if (!internship) {
            res.status(404);
            throw new Error("Internship not found");
        }

        res.status(200).json({
            success: true,
            data: internship,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new internship
 * @route   POST /api/internships
 * @access  Private (Company)
 */
const createInternship = async (req, res, next) => {
    try {
        const {
            title,
            specialization,
            type,
            duration,
            location,
            stipend,
            deadline,
            description,
            overview,
            duties,
            requirements,
            slots,
            status = "Draft",
        } = req.body;

        // Validate required fields
        if (!title || !specialization || !type || !duration || !location || !stipend || !deadline || !description) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }

        const internship = await Internship.create({
            title,
            company: req.company._id,
            specialization,
            type,
            duration,
            location,
            stipend,
            deadline,
            description,
            overview,
            duties: duties || [],
            requirements: requirements || [],
            slots,
            status,
        });

        // Populate company details for response
        await internship.populate("company", "name logo");

        res.status(201).json({
            success: true,
            message: "Internship created successfully",
            data: internship,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update internship
 * @route   PUT /api/internships/:id
 * @access  Private (Company owner)
 */
const updateInternship = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            res.status(404);
            throw new Error("Internship not found");
        }

        // Check if company owns this internship
        if (internship.company.toString() !== req.company._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to update this internship");
        }

        const updatedInternship = await Internship.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("company", "name logo");

        res.status(200).json({
            success: true,
            message: "Internship updated successfully",
            data: updatedInternship,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete internship
 * @route   DELETE /api/internships/:id
 * @access  Private (Company owner)
 */
const deleteInternship = async (req, res, next) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            res.status(404);
            throw new Error("Internship not found");
        }

        // Check if company owns this internship
        if (internship.company.toString() !== req.company._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to delete this internship");
        }

        await Internship.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Internship deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get company internships
 * @route   GET /api/internships/company/my
 * @access  Private (Company)
 */
const getCompanyInternships = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const [internships, total] = await Promise.all([
            Internship.find({ company: req.company._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Internship.countDocuments({ company: req.company._id }),
        ]);

        res.status(200).json({
            success: true,
            data: internships,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Apply for internship
 * @route   POST /api/internships/:id/apply
 * @access  Private (Student)
 */
const applyForInternship = async (req, res, next) => {
    let applicationSaved = false;

    try {
        const { name, email, phone, coverLetter, resume } = req.body;
        const uploadedResume = getUploadedFilePath(req.file, "resumes", resume);

        // Validate required fields
        if (!name || !email || !coverLetter || !uploadedResume) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }

        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            res.status(404);
            throw new Error("Internship not found");
        }

        // Check if student has already applied
        const existingApplication = internship.applications.find(
            app => app.student.toString() === req.student._id.toString()
        );

        if (existingApplication) {
            res.status(400);
            throw new Error("You have already applied for this internship");
        }

        // Add application
        internship.applications.push({
            student: req.student._id,
            name,
            email,
            phone,
            coverLetter,
            resume: uploadedResume,
        });

        await internship.save();
        applicationSaved = true;

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
        });
    } catch (error) {
        if (!applicationSaved) {
            deleteUploadedFile(req.file);
        }

        next(error);
    }
};

/**
 * @desc    Get student applications
 * @route   GET /api/internships/applications/my
 * @access  Private (Student)
 */
const getStudentApplications = async (req, res, next) => {
    try {
        const applications = await Internship.find(
            { "applications.student": req.student._id },
            { "applications.$": 1, title: 1, company: 1, deadline: 1, location: 1, type: 1, duration: 1, stipend: 1 }
        )
            .populate("company", "name logo")
            .lean();

        // Format applications
        const formattedApplications = applications.map(internship => ({
            _id: internship._id,
            title: internship.title,
            company: internship.company,
            deadline: internship.deadline,
            location: internship.location,
            type: internship.type,
            duration: internship.duration,
            stipend: internship.stipend,
            application: internship.applications.find(
                app => app.student.toString() === req.student._id.toString()
            ),
        }));

        res.status(200).json({
            success: true,
            data: formattedApplications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update application status
 * @route   PUT /api/internships/:id/applications/:appId
 * @access  Private (Company owner)
 */
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["Accepted", "Rejected"].includes(status)) {
            res.status(400);
            throw new Error("Invalid status");
        }

        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            res.status(404);
            throw new Error("Internship not found");
        }

        // Check if company owns this internship
        if (internship.company.toString() !== req.company._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to update this application");
        }

        // Find and update the application
        const application = internship.applications.id(req.params.appId);

        if (!application) {
            res.status(404);
            throw new Error("Application not found");
        }

        application.status = status;
        await internship.save();

        res.status(200).json({
            success: true,
            message: `Application ${status.toLowerCase()} successfully`,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllInternships,
    getInternshipById,
    createInternship,
    updateInternship,
    deleteInternship,
    getCompanyInternships,
    applyForInternship,
    getStudentApplications,
    updateApplicationStatus,
};
