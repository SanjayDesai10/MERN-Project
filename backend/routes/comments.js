const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  getUserComments
} = require('../controllers/commentController');

// Import middleware
const { protect } = require('../middleware/auth');

// Validation rules
const createCommentValidation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('postId')
    .isMongoId()
    .withMessage('Valid post ID is required'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Valid parent comment ID is required')
];

const updateCommentValidation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a post
// @access  Public
router.get('/post/:postId', getPostComments);

// @route   GET /api/comments/user/:userId
// @desc    Get user's comments
// @access  Public
router.get('/user/:userId', getUserComments);

// @route   POST /api/comments
// @desc    Create a comment
// @access  Private
router.post('/', protect, createCommentValidation, createComment);

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (Comment Author or Admin)
router.put('/:id', protect, updateCommentValidation, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (Comment Author or Admin)
router.delete('/:id', protect, deleteComment);

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/:id/like', protect, likeComment);

module.exports = router;
