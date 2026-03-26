/**
 * Company Review routes.
 * Defines all endpoints for managing company reviews.
 */

const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

/**
 * Public routes
 */

// Get all reviews with filters and pagination
router.get("/", getAllCompanyReviews);

// Get reviews by company name
router.get("/company/:companyName", getReviewsByCompany);

// Get single review
router.get("/:id", getCompanyReviewById);

// Get company statistics
router.get("/stats/all-companies", getCompanyStats);

// Mark review as helpful
router.put("/:id/helpful", markHelpful);

// Mark review as unhelpful
router.put("/:id/unhelpful", markUnhelpful);

/**
 * Private routes (require authentication)
 */

// Create new review
router.post("/", protect, createCompanyReview);

// Get user's reviews
router.get("/user/my-reviews", protect, getUserReviews);

// Update review
router.put("/:id", protect, updateCompanyReview);

// Delete review
router.delete("/:id", protect, deleteCompanyReview);

// Flag review as inappropriate
router.put("/:id/flag", protect, flagReview);

module.exports = router;
