import React, { useEffect } from 'react';
import { usePostStore } from '../../store/postStore';
import PostCard from '../components/PostCard';

const Home: React.FC = () => {
  const { posts, isLoading, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Posts</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              coverImageUrl={post.coverImageUrl}
              authorName={post.author.username}
              authorAvatarUrl={post.author.avatarUrl || ''}
              createdAt={post.createdAt}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
};

export default Home;