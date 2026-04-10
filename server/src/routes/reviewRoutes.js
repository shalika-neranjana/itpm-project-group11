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
    getReviewComments,
    createReviewComment,
    replyToComment,
    voteComment,
    voteReply,
} = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

/**
 * Public routes
 */

// Get all reviews with filters and pagination
router.get("/", getAllCompanyReviews);

// Get company statistics (must come before /:id to avoid parameter matching)
router.get("/stats/all-companies", getCompanyStats);

// Get reviews by company name
router.get("/company/:companyName", getReviewsByCompany);

// Get single review
router.get("/:id", getCompanyReviewById);

// Get comments for a review
router.get("/:id/comments", getReviewComments);

// Mark review as helpful
router.put("/:id/helpful", markHelpful);

// Mark review as unhelpful
router.put("/:id/unhelpful", markUnhelpful);

/**
 * Private routes (require authentication)
 */

// Get user's reviews (must come before other param-based routes)
router.get("/user/my-reviews", protect, getUserReviews);

// Create new review
router.post("/", protect, createCompanyReview);

// Update review
router.put("/:id", protect, updateCompanyReview);

// Delete review
router.delete("/:id", protect, deleteCompanyReview);

// Flag review as inappropriate
router.put("/:id/flag", protect, flagReview);

// Create a comment on a review
router.post("/:id/comments", protect, createReviewComment);

// Reply to a comment on a review
router.post("/:id/comments/:commentId/reply", protect, replyToComment);

// Vote on a comment in a review thread
router.put("/:id/comments/:commentId/vote", protect, voteComment);

// Vote on a reply in a review thread
router.put("/:id/comments/:commentId/replies/:replyId/vote", protect, voteReply);

module.exports = router;
