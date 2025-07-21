import React from 'react';
import { User, Heart, MessageSquare, Eye, Trash2 } from 'lucide-react';
// import { useBlog } from '../../context/BlogContext';
import { Post } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  // const { 
  //   handleLike, 
  //   handleDeletePost, 
  //   handleViewPost, 
  //   formatDate,
  //   currentUser
  // } = useBlog();

  return (
    <article className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 avatar">
            <span className="text-sm font-bold">{post.author.name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{post.author.name}</h4>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{formatDate(post.createdAt)}</span>
          {currentUser && post.author.username === currentUser.username && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePost(post.id);
              }}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-3">
        <span className="category-badge">
          {post.category}
        </span>
      </div>
      
      <h2 
        className="text-lg font-semibold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => handleViewPost(post)}
      >
        {post.title}
      </h2>
      <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
        {post.content.substring(0, 150)}...
      </p>
      
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(post.id);
            }}
            className={`flex items-center space-x-2 text-sm ${
              post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } transition-colors`}
            aria-label={post.isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes}</span>
          </button>
          
          <button 
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            aria-label="View comments"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments}</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{post.views}</span>
          </div>
        </div>

        <button
          onClick={() => handleViewPost(post)}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium"
          aria-label="Read more"
        >
          Devamını Oku
        </button>
      </div>
    </article>
  );
};

export default PostItem;