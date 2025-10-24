import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    category: 'General',
    coverImage: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    },
  });

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError('Content is required');
        setLoading(false);
        return;
      }

      const postData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const response = await axios.post('/api/posts', postData);

      if (response.data.success) {
        navigate(`/post/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const buttons = [
      {
        command: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive('bold'),
        label: 'B',
        title: 'Bold'
      },
      {
        command: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive('italic'),
        label: 'I',
        title: 'Italic'
      },
      {
        command: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive('strike'),
        label: 'S',
        title: 'Strikethrough'
      },
      {
        command: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive('code'),
        label: '<>',
        title: 'Code'
      },
      {
        command: () => editor.chain().focus().setParagraph().run(),
        active: editor.isActive('paragraph'),
        label: 'P',
        title: 'Paragraph'
      },
      {
        command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive('heading', { level: 1 }),
        label: 'H1',
        title: 'Heading 1'
      },
      {
        command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive('heading', { level: 2 }),
        label: 'H2',
        title: 'Heading 2'
      },
      {
        command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive('heading', { level: 3 }),
        label: 'H3',
        title: 'Heading 3'
      },
      {
        command: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive('bulletList'),
        label: '•',
        title: 'Bullet List'
      },
      {
        command: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive('orderedList'),
        label: '1.',
        title: 'Ordered List'
      },
      {
        command: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive('blockquote'),
        label: '"',
        title: 'Quote'
      }
    ];

    return (
      <div style={{
        border: '1px solid #d1d5db',
        borderBottom: 'none',
        borderTopLeftRadius: '0.375rem',
        borderTopRightRadius: '0.375rem',
        padding: '0.5rem',
        backgroundColor: '#f9fafb',
        display: 'flex',
        gap: '0.25rem',
        flexWrap: 'wrap'
      }}>
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.command}
            style={{
              padding: '0.375rem 0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              backgroundColor: button.active ? '#2563eb' : 'white',
              color: button.active ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              minWidth: '2rem'
            }}
            title={button.title}
          >
            {button.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Create New Post
        </h1>
        <p style={{ color: '#6b7280' }}>
          Share your thoughts with the community
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="title"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter an engaging title..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1.125rem',
              fontWeight: '500'
            }}
          />
        </div>

        {/* Content Editor */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Content *
          </label>
          <div style={{
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            overflow: 'hidden'
          }}>
            <MenuBar editor={editor} />
            <div style={{
              minHeight: '300px',
              padding: '1rem',
              outline: 'none'
            }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="excerpt"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Excerpt (Optional)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Brief summary of your post..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Category and Tags */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <label
              htmlFor="category"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            >
              <option value="General">General</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Travel">Travel</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tags"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="javascript, react, tutorial (comma-separated)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Cover Image */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="coverImage"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Cover Image URL (Optional)
          </label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            htmlFor="status"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          >
            <option value="draft">Draft (Save as draft)</option>
            <option value="published">Published (Make public)</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
