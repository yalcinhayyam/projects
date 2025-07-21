import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  authorName: string;
  authorAvatarUrl: string;
  createdAt: string;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  excerpt,
  coverImageUrl,
  authorName,
  authorAvatarUrl,
  createdAt,
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-gray-100">
      <Link to={`/post/${id}`}>
        <div className="h-48 overflow-hidden">
          <img 
            src={coverImageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/post/${id}`} className="block">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center">
          <img 
            src={authorAvatarUrl}
            alt={authorName}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;