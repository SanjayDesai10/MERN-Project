import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data.data);
      setLiked(response.data.data.likes.some(like => like.user === user?._id));
      setError('');
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      await axios.post(`/api/posts/${id}/like`);
      // Update local state
      setLiked(!liked);
      setPost(prev => ({
        ...prev,
        likes: liked
          ? prev.likes.filter(like => like.user !== user._id)
          : [...prev.likes, { user: user._id }]
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
          {error || 'Post not found'}
        </div>
        <Link
          to="/"
          style={{
            color: '#2563eb',
            textDecoration: 'none'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const canEdit = user && (user._id === post.author._id || user.role === 'admin');

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Cover Image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}
        />
      )}

      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <span style={{
            backgroundColor: '#e5e7eb',
            color: '#6b7280',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {post.category}
          </span>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {formatDate(post.createdAt)}
          </span>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {post.readingTime} min read
          </span>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          {post.title}
        </h1>

        {/* Author and Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#6b7280'
            }}>
              {post.author.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#111827'
              }}>
                {post.author.username}
              </div>
              {post.author.bio && (
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {post.author.bio}
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {user && (
              <button
                onClick={handleLike}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: liked ? '#fef2f2' : 'white',
                  color: liked ? '#dc2626' : '#374151',
                  cursor: 'pointer'
                }}
              >
                ❤️ {post.likes.length}
              </button>
            )}

            {canEdit && (
              <Link
                to={`/edit-post/${post._id}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  textDecoration: 'none'
                }}
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          fontSize: '1.125rem',
          lineHeight: '1.8',
          color: '#374151',
          marginBottom: '3rem'
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Tags
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.tags.map((tag, index) => (
              <Link
                key={index}
                to={`/?tag=${tag}`}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  textDecoration: 'none'
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        textAlign: 'center'
      }}>
        <div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            {post.views}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Views</div>
        </div>
        <div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            {post.likes.length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Likes</div>
        </div>
        <div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            {post.commentsCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Comments</div>
        </div>
      </div>

      {/* Comments Section - Placeholder */}
      <div style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Comments ({post.commentsCount})
        </h3>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          Comments feature coming soon...
        </div>
      </div>
    </article>
  );
};

export default PostDetail;
