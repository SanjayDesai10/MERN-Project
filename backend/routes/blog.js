const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  likePost,
  getCategories,
  getTags
} = require('../controllers/blogController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createPostValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt must be less than 300 characters'),
  body('tags')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Tags string too long'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

const updatePostValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt must be less than 300 characters'),
  body('tags')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Tags string too long'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

// @route   GET /api/posts
// @desc    Get all published posts
// @access  Public
router.get('/', getPosts);

// @route   GET /api/posts/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/posts/tags
// @desc    Get all tags
// @access  Public
router.get('/tags', getTags);

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', getPost);

// @route   GET /api/posts/user/:userId
// @desc    Get user's posts
// @access  Public
router.get('/user/:userId', getUserPosts);

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', protect, createPostValidation, createPost);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Author or Admin)
router.put('/:id', protect, updatePostValidation, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Author or Admin)
router.delete('/:id', protect, deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/:id/like', protect, likePost);

module.exports = router;
