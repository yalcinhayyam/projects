import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostStore } from '../../store/postStore';
import { useAuthStore } from '../../store/authStore';
import Input from '../components/Input';
import Button from '../components/Button';
import RichTextEditor from '../components/RichTextEditor';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { createPost, isLoading } = usePostStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (!coverImageUrl.trim()) newErrors.coverImageUrl = 'Cover image URL is required';
    if (!excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await createPost({
        title,
        content,
        coverImageUrl,
        excerpt,
        authorId: user?.id || '',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <Input
          label="Title"
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          error={errors.title}
        />
        
        <Input
          label="Cover Image URL"
          id="coverImageUrl"
          type="text"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Enter URL for cover image"
          error={errors.coverImageUrl}
        />
        
        <Input
          label="Excerpt"
          id="excerpt"
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary of your post"
          error={errors.excerpt}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            error={errors.content}
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Publish Post
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;