/**
 * Company Review controller.
 * Handles operations for creating, reading, updating, and deleting company reviews.
 */

const mongoose = require("mongoose");
const CompanyReview = require("../models/Review");
const Student = require("../models/Student");

/**
 * @desc    Create a new company review
 * @route   POST /api/reviews
 * @access  Private
 */
const createCompanyReview = async (req, res, next) => {
    try {
        const {
            companyName,
            title,
            description,
            rating,
            position,
            internshipType,
            salary,
            salaryFrequency,
            workEnvironment,
            mentorship,
            parkingAvailable,
            reviewCategory,
        } = req.body;

        // Validate required fields
        if (!companyName || !title || !description || !rating) {
            res.status(400);
            throw new Error("Please provide all required fields: companyName, title, description, rating");
        }

        // Get student info for author name
        const student = await Student.findById(req.student._id);
        const authorName = student ? `${student.firstName} ${student.lastName}` : "Anonymous";

        const review = await CompanyReview.create({
            companyName,
            title,
            description,
            rating,
            position: position || "",
            internshipType: internshipType || "Summer",
            salary: salary || null,
            salaryFrequency: salaryFrequency || null,
            workEnvironment: workEnvironment || null,
            mentorship: mentorship || null,
            parkingAvailable: parkingAvailable || null,
            reviewCategory: reviewCategory || "General",
            authorId: req.student._id,
            authorName,
        });

        res.status(201).json({
            success: true,
            data: review,
            message: "Review created successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all company reviews with filters and pagination
 * @route   GET /api/reviews
 * @access  Public
 */
const getAllCompanyReviews = async (req, res, next) => {
    try {
        const { companyName, page = 1, limit = 10, sortBy = "createdAt", flagged = false } = req.query;

        // Build filter
        const filter = { flagged: flagged === "true" };
        if (companyName) {
            filter.companyName = { $regex: companyName, $options: "i" };
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = -1;

        // Get reviews
        const [reviews, total] = await Promise.all([
            CompanyReview.find(filter)
                .sort(sortObject)
                .skip(skip)
                .limit(limitNum)
                .populate("authorId", "firstName lastName email")
                .lean(),
            CompanyReview.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limitNum),
                currentPage: pageNum,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews by company name
 * @route   GET /api/reviews/company/:companyName
 * @access  Public
 */
const getReviewsByCompany = async (req, res, next) => {
    try {
        const { companyName } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const reviews = await CompanyReview.find({
            companyName: { $regex: `^${companyName}$`, $options: "i" },
            flagged: false,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("authorId", "firstName lastName")
            .lean();

        const total = await CompanyReview.countDocuments({
            companyName: { $regex: `^${companyName}$`, $options: "i" },
            flagged: false,
        });

        // Calculate average rating
        const reviewStats = await CompanyReview.aggregate([
            {
                $match: {
                    companyName: { $regex: `^${companyName}$`, $options: "i" },
                    flagged: false,
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: reviews,
            company: {
                name: companyName,
                averageRating: reviewStats[0]?.averageRating || 0,
                totalReviews: reviewStats[0]?.totalReviews || 0,
            },
            pagination: {
                total,
                pages: Math.ceil(total / limitNum),
                currentPage: pageNum,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single review by ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
const getCompanyReviewById = async (req, res, next) => {
    try {
        const review = await CompanyReview.findById(req.params.id).populate("authorId", "firstName lastName email");

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update company review (only by author)
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateCompanyReview = async (req, res, next) => {
    try {
        const review = await CompanyReview.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        // Check if user is the author
        if (review.authorId.toString() !== req.student._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to update this review");
        }

        // Check if review is within 7 days (editable window)
        const createdDate = new Date(review.createdAt);
        const now = new Date();
        const daysOld = (now - createdDate) / (1000 * 60 * 60 * 24);

        if (daysOld > 7) {
            res.status(400);
            throw new Error("Reviews can only be edited within 7 days of creation");
        }

        // Update fields
        review.title = req.body.title || review.title;
        review.description = req.body.description || review.description;
        review.rating = req.body.rating || review.rating;
        review.position = req.body.position !== undefined ? req.body.position : review.position;
        review.internshipType = req.body.internshipType || review.internshipType;
        review.salary = req.body.salary !== undefined ? req.body.salary : review.salary;
        review.salaryFrequency = req.body.salaryFrequency || review.salaryFrequency;
        review.workEnvironment = req.body.workEnvironment !== undefined ? req.body.workEnvironment : review.workEnvironment;
        review.mentorship = req.body.mentorship !== undefined ? req.body.mentorship : review.mentorship;
        review.reviewCategory = req.body.reviewCategory || review.reviewCategory;

        const updatedReview = await review.save();

        res.status(200).json({
            success: true,
            data: updatedReview,
            message: "Review updated successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete company review (only by author, within 7 days)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteCompanyReview = async (req, res, next) => {
    try {
        const review = await CompanyReview.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        // Check if user is the author
        if (review.authorId.toString() !== req.student._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to delete this review");
        }

        // Check if review is within 7 days (deletable window)
        const createdDate = new Date(review.createdAt);
        const now = new Date();
        const daysOld = (now - createdDate) / (1000 * 60 * 60 * 24);

        if (daysOld > 7) {
            res.status(400);
            throw new Error("Reviews can only be deleted within 7 days of creation");
        }

        await CompanyReview.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get reviews by current user
 * @route   GET /api/reviews/user/my-reviews
 * @access  Private
 */
const getUserReviews = async (req, res, next) => {
    try {
        const reviews = await CompanyReview.find({ authorId: req.student._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Flag a review as inappropriate
 * @route   PUT /api/reviews/:id/flag
 * @access  Private
 */
const flagReview = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const review = await CompanyReview.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        review.flagged = true;
        review.flagReason = reason || "";

        const updatedReview = await review.save();

        res.status(200).json({
            success: true,
            data: updatedReview,
            message: "Review flagged successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark review as helpful
 * @route   PUT /api/reviews/:id/helpful
 * @access  Public
 */
const markHelpful = async (req, res, next) => {
    try {
        const review = await CompanyReview.findByIdAndUpdate(
            req.params.id,
            { $inc: { helpful: 1 } },
            { new: true }
        );

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark review as unhelpful
 * @route   PUT /api/reviews/:id/unhelpful
 * @access  Public
 */
const markUnhelpful = async (req, res, next) => {
    try {
        const review = await CompanyReview.findByIdAndUpdate(
            req.params.id,
            { $inc: { unhelpful: 1 } },
            { new: true }
        );

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get company statistics
 * @route   GET /api/reviews/stats/all-companies
 * @access  Public
 */
const getCompanyStats = async (req, res, next) => {
    try {
        const stats = await CompanyReview.aggregate([
            { $match: { flagged: false } },
            {
                $group: {
                    _id: "$companyName",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    avgSalary: { $avg: "$salary" },
                },
            },
            { $sort: { totalReviews: -1 } },
            { $limit: 50 },
        ]);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all comments for a review
 * @route   GET /api/reviews/:id/comments
 * @access  Public
 */
const getReviewComments = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await CompanyReview.findById(id);
        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        res.status(200).json({
            success: true,
            data: review.comments || [],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a comment on a review
 * @route   POST /api/reviews/:id/comments
 * @access  Private
 */
const createReviewComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            res.status(400);
            throw new Error("Comment text is required");
        }

        const review = await CompanyReview.findById(id);
        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        // Get student info for author name
        const student = await Student.findById(req.student._id);
        const authorName = student ? `${student.firstName} ${student.lastName}` : "Anonymous";

        const newComment = {
            text: text.trim(),
            authorId: req.student._id,
            authorName: authorName,
            replies: [],
        };

        review.comments.push(newComment);
        await review.save();

        res.status(201).json({
            success: true,
            data: newComment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reply to a comment on a review
 * @route   POST /api/reviews/:id/comments/:commentId/reply
 * @access  Private (only review author can reply)
 */
const replyToComment = async (req, res, next) => {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            res.status(400);
            throw new Error("Reply text is required");
        }

        const review = await CompanyReview.findById(id);
        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        // Check if user is the review author
        if (review.authorId.toString() !== req.student._id.toString()) {
            res.status(403);
            throw new Error("Only the review author can reply to comments");
        }

        // Find the comment
        const comment = review.comments.find(c => c._id.toString() === commentId);
        if (!comment) {
            res.status(404);
            throw new Error("Comment not found");
        }

        // Get student info for reply author name
        const student = await Student.findById(req.student._id);
        const authorName = student ? `${student.firstName} ${student.lastName}` : "Anonymous";

        const newReply = {
            text: text.trim(),
            authorId: req.student._id,
            authorName: authorName,
        };

        comment.replies.push(newReply);
        await review.save();

        res.status(201).json({
            success: true,
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCompanyReview,
    getAllCompanyReviews,
    getReviewsByCompany,
    getCompanyReviewById,
    updateCompanyReview,
    deleteCompanyReview,
    getUserReviews,
    flagReview,
    markHelpful,
    markUnhelpful,
    getCompanyStats,
    getReviewComments,
    createReviewComment,
    replyToComment,
};
