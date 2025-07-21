import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { usePostStore } from '../../store/postStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../components/Button';
import { formatDate } from '../../utils/dateUtils';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPost, isLoading, error, fetchPostById, deletePost } = usePostStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    }
  }, [id, fetchPostById]);

  const isAuthor = currentPost && user && currentPost.authorId === user.id;

  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(id!);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center py-12">
          <p className="text-gray-500">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Cover image */}
      <div className="mb-8 rounded-lg overflow-hidden h-72 md:h-96">
        <img 
          src={currentPost.coverImageUrl} 
          alt={currentPost.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Title and actions */}
      <div className="mb-6 flex flex-wrap justify-between items-start">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-0 flex-grow">
          {currentPost.title}
        </h1>
        
        {isAuthor && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleDelete}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      
      {/* Author info */}
      <div className="flex items-center mb-8">
        <img 
          src={currentPost.author.avatarUrl || ''} 
          alt={currentPost.author.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">{currentPost.author.username}</p>
          <p className="text-xs text-gray-500">
            {formatDate(currentPost.createdAt)}
            {currentPost.createdAt !== currentPost.updatedAt && ' • Updated'}
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="prose prose-blue max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: currentPost.content }}
      />
      
      {/* Subscription prompt */}
      {isAuthenticated && !user?.isSubscribed && (
        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Enjoying this content?</h3>
          <p className="text-blue-700 mb-4">Subscribe to get access to exclusive articles and features.</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/subscription')}
          >
            Subscribe Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostDetail;