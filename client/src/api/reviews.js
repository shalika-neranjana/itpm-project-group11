import api from './axios'

const mapReviewData = (dbReview) => {
  return {
    id: dbReview._id,
    _id: dbReview._id,
    company: dbReview.companyName,
    companyName: dbReview.companyName,
    role: dbReview.position,
    position: dbReview.position,
    rating: dbReview.rating,
    text: dbReview.description,
    description: dbReview.description,
    date: dbReview.createdAt ? new Date(dbReview.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
    createdAt: dbReview.createdAt,
    updatedAt: dbReview.updatedAt,
    authorId: dbReview.authorId,
    authorName: dbReview.authorName,
    flagged: dbReview.flagged,
    verified: dbReview.rating >= 4,
    sentiment: dbReview.rating <= 2 ? 'Negative' : dbReview.rating >= 4 ? 'Positive' : 'Neutral',
  }
}

/**
 * Create a new company review
 */
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', {
      companyName: reviewData.company,
      title: reviewData.role,
      description: reviewData.experience,
      rating: reviewData.rating,
      position: reviewData.role,
    })
    return mapReviewData(response.data.data)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Get all company reviews
 */
export const getAllReviews = async (filters = {}) => {
  try {
    const response = await api.get('/reviews', { params: filters })
    const reviews = response.data.data || []
    return reviews.map(mapReviewData)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Get reviews by company name
 */
export const getReviewsByCompany = async (companyName) => {
  try {
    const response = await api.get(`/reviews/company/${companyName}`)
    const reviews = response.data.data || []
    return reviews.map(mapReviewData)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Get user's own reviews
 */
export const getUserReviews = async () => {
  try {
    const response = await api.get('/reviews/user/my-reviews')
    const reviews = response.data.data || []
    return reviews.map(mapReviewData)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Get single review by ID
 */
export const getReviewById = async (id) => {
  try {
    const response = await api.get(`/reviews/${id}`)
    return mapReviewData(response.data.data)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Update a review
 */
export const updateReview = async (id, reviewData) => {
  try {
    const response = await api.put(`/reviews/${id}`, {
      companyName: reviewData.company,
      title: reviewData.role,
      description: reviewData.experience,
      rating: reviewData.rating,
      position: reviewData.role,
    })
    return mapReviewData(response.data.data)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Delete a review
 */
export const deleteReview = async (id) => {
  try {
    await api.delete(`/reviews/${id}`)
    return true
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Flag a review as inappropriate
 */
export const flagReview = async (id, reason) => {
  try {
    const response = await api.put(`/reviews/${id}/flag`, { reason })
    return mapReviewData(response.data.data)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (id) => {
  try {
    const response = await api.put(`/reviews/${id}/helpful`)
    return mapReviewData(response.data.data)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Mark review as unhelpful
 */
export const markReviewUnhelpful = async (id) => {
  try {
    const response = await api.put(`/reviews/${id}/unhelpful`)
    return mapReviewData(response.data.data)
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Get all comments for a review
 */
export const getReviewComments = async (reviewId) => {
  try {
    const response = await api.get(`/reviews/${reviewId}/comments`)
    const comments = response.data.data || []
    return comments.map((comment) => ({
      _id: comment._id,
      text: comment.text,
      authorId: comment.authorId,
      authorName: comment.authorName,
      date: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      replies: (comment.replies || []).map((reply) => ({
        _id: reply._id,
        text: reply.text,
        authorId: reply.authorId,
        authorName: reply.authorName,
        date: reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      })),
    }))
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Create a comment on a review
 */
export const createReviewComment = async (reviewId, commentData) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/comments`, {
      text: commentData.text,
    })
    const comment = response.data.data
    return {
      _id: comment._id,
      text: comment.text,
      authorId: comment.authorId,
      authorName: comment.authorName,
      date: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      replies: [],
    }
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Reply to a comment on a review
 */
export const replyToComment = async (reviewId, commentId, replyData) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/comments/${commentId}/reply`, {
      text: replyData.text,
    })
    const comment = response.data.data
    return {
      _id: comment._id,
      text: comment.text,
      authorId: comment.authorId,
      authorName: comment.authorName,
      date: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      replies: (comment.replies || []).map((reply) => ({
        _id: reply._id,
        text: reply.text,
        authorId: reply.authorId,
        authorName: reply.authorName,
        date: reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      })),
    }
  } catch (error) {
    throw error.response?.data || error
  }
}

export default {
  createReview,
  getAllReviews,
  getReviewsByCompany,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  flagReview,
  markReviewHelpful,
  markReviewUnhelpful,
}
