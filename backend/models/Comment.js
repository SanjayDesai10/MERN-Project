const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });

// Update parent comment's replies when a reply is added
commentSchema.pre('save', async function(next) {
  if (this.parentComment && this.isNew) {
    await mongoose.model('Comment').findByIdAndUpdate(
      this.parentComment,
      { $push: { replies: this._id } }
    );
  }
  next();
});

// Update post's comment count when comment is created/deleted
commentSchema.post('save', async function(doc) {
  if (doc.isNew) {
    await mongoose.model('BlogPost').findByIdAndUpdate(
      doc.post,
      { $inc: { commentsCount: 1 } }
    );
  }
});

commentSchema.post('remove', async function(doc) {
  // Remove from parent comment's replies array
  if (doc.parentComment) {
    await mongoose.model('Comment').findByIdAndUpdate(
      doc.parentComment,
      { $pull: { replies: doc._id } }
    );
  }

  // Update post's comment count
  await mongoose.model('BlogPost').findByIdAndUpdate(
    doc.post,
    { $inc: { commentsCount: -1 } }
  );

  // Recursively delete all replies
  if (doc.replies && doc.replies.length > 0) {
    await mongoose.model('Comment').deleteMany({ _id: { $in: doc.replies } });
  }
});

module.exports = mongoose.model('Comment', commentSchema);
