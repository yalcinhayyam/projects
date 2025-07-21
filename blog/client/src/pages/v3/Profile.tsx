import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import Input from '../components/Input';
import Button from '../components/Button';
import PostCard from '../components/PostCard';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, isLoading } = useAuthStore();
  const { posts, fetchPosts } = usePostStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch posts for the user's profile
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts]);

  const userPosts = posts.filter((post) => post.authorId === user?.id);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await updateProfile({
        username,
        bio,
        avatarUrl,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setAvatarUrl(user?.avatarUrl || '');
    setIsEditing(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="mb-6 md:mb-0 md:mr-8">
            <img 
              src={user.avatarUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'} 
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-md"
            />
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex-grow">
              <Input
                label="Username"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username}
              />
              
              <Input
                label="Bio"
                id="bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              
              <Input
                label="Avatar URL"
                id="avatarUrl"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              
              <div className="flex space-x-3 mt-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h1>
              <p className="text-gray-600 mb-4">{user.bio || 'No bio provided'}</p>
              <p className="text-sm text-gray-500 mb-4">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                
                {user.isSubscribed ? (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Subscribed
                  </div>
                ) : (
                  <Button
                    onClick={() => navigate('/subscription')}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Posts</h2>
        
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map((post) => (
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
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-500 mb-4">You haven't created any posts yet</p>
            <Button
              onClick={() => navigate('/create-post')}
            >
              Create Your First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;