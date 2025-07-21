import React from 'react';
import { Calendar, Eye, Heart, MessageSquare } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import Comments from '../components/post/Comments';

const PostView: React.FC = () => {
  const { selectedPost, formatDate, handleLike } = useBlog();

  if (!selectedPost) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in">
      <div className="mb-6">
        <span className="category-badge mb-4">
          {selectedPost.category}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
        
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 avatar">
              <span className="text-lg font-bold">{selectedPost.author.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{selectedPost.author.name}</h3>
              <p className="text-sm text-gray-500">@{selectedPost.author.username}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedPost.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{selectedPost.views} görüntülenme</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="prose max-w-none mb-8">
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {selectedPost.content}
        </div>
      </div>

      {selectedPost.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedPost.tags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleLike(selectedPost.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedPost.isLiked 
                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={selectedPost.isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`w-5 h-5 ${selectedPost.isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{selectedPost.likes}</span>
          </button>
          
          <button 
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="View comments"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">{selectedPost.comments}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <Comments postId={selectedPost.id} />
    </div>
  );
};

export default PostView;