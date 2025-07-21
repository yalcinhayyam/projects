import React from 'react';
import { Home as HomeIcon, Users as UsersIcon, BookOpen as BookOpenIcon } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import PostItem from '../components/post/PostItem';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTab, posts, searchTerm } = useBlog();

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
        <button
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white"
          aria-label="Home page"
        >
          <HomeIcon className="w-4 h-4" />
          <span>Ana Sayfa</span>
        </button>
        
        <button
          onClick={() => navigate('/users')}
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Users page"
        >
          <UsersIcon className="w-4 h-4" />
          <span>Kullanıcılar</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4 animate-fade-in">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz post bulunmuyor.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostItem key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;