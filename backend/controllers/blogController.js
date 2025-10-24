const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all blog posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: 'published' };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by tags
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (req.query.sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (req.query.sort === 'popular') {
      sortOptions = { views: -1 };
    } else if (req.query.sort === 'likes') {
      sortOptions = { likeCount: -1 };
    }

    // Execute query
    const posts = await BlogPost.find(query)
      .populate('author', 'username avatar bio')
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex)
      .select('-__v');

    // Get total count for pagination
    const total = await BlogPost.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.json({
      success: true,
      data: posts,
      pagination
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single blog post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('likes.user', 'username avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new blog post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, tags, category, coverImage, status } = req.body;

    const post = await BlogPost.create({
      title,
      content,
      excerpt,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'General',
      coverImage,
      status: status || 'draft',
      author: req.user._id
    });

    // Populate author info
    await post.populate('author', 'username avatar bio');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update blog post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
const updatePost = async (req, res) => {
  try {
    let post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership (middleware should handle this, but double check)
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { title, content, excerpt, tags, category, coverImage, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (tags !== undefined) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (category !== undefined) updateData.category = category;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status !== undefined) updateData.status = status;

    post = await BlogPost.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'username avatar bio');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await BlogPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const posts = await BlogPost.find({
      author: req.params.userId,
      status: 'published'
    })
      .populate('author', 'username avatar bio')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await BlogPost.countDocuments({
      author: req.params.userId,
      status: 'published'
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like the post
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    await post.populate('likes.user', 'username avatar');

    res.json({
      success: true,
      data: {
        likes: post.likes,
        likeCount: post.likes.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all categories
// @route   GET /api/posts/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await BlogPost.distinct('category', { status: 'published' });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all tags
// @route   GET /api/posts/tags
// @access  Public
const getTags = async (req, res) => {
  try {
    const tags = await BlogPost.distinct('tags', { status: 'published' });

    // Flatten array and remove duplicates
    const uniqueTags = [...new Set(tags.flat())];

    res.json({
      success: true,
      data: uniqueTags
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  likePost,
  getCategories,
  getTags
};
