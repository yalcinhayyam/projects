import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_PROFILE, FOLLOW_USER, UNFOLLOW_USER } from "../graphql";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { id },
    skip: !id,
    errorPolicy: "all"
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    update: (cache, { data: { followUser: updatedUser } }) => {
      cache.writeQuery({
        query: GET_USER_PROFILE,
        variables: { id },
        data: {
          user: updatedUser
        }
      });
    },
    onCompleted: (data) => {
      toast.success(`Followed ${data.followUser.username}`);
      refetch();
    },
    onError: (err) => {
      console.error("Follow error:", err);
      toast.error(err.message);
    },
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [
      { query: GET_USER_PROFILE, variables: { id } }
    ],
    onCompleted: () => {
      toast.success(`Unfollowed ${data.user.username}`);
    },
    onError: (err) => {
      console.error("Unfollow error:", err);
      toast.error(err.message);
    },
  });

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }

    if (!id) return;

    try {
      if (isFollowing) {
        await unfollowUser({ variables: { userId: id } });
      } else {
        await followUser({ variables: { userId: id } });
      }
    } catch (err) {
      console.error("Follow/unfollow error:", err);
    }
  };

  if (!id) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid profile URL
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading profile: {error.message}
        </div>
        <button 
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          User not found
        </div>
      </div>
    );
  }

  const profileUser = data.user;
  const isFollowing = profileUser.followers?.some(follower => follower.id === user?.id);
  const isOwnProfile = user?.id === profileUser.id;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              {profileUser.username}
            </h2>
            <p className="text-gray-600 mb-4">{profileUser.email}</p>
            <div className="flex gap-6 mb-4">
              <span className="text-gray-700">
                <strong className="text-lg">{profileUser.followers?.length || 0}</strong>
                <span className="ml-1">Followers</span>
              </span>
              <span className="text-gray-700">
                <strong className="text-lg">{profileUser.following?.length || 0}</strong>
                <span className="ml-1">Following</span>
              </span>
              <span className="text-gray-700">
                <strong className="text-lg">{profileUser.posts?.length || 0}</strong>
                <span className="ml-1">Posts</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Member since {new Date(profileUser.createdAt).toLocaleDateString()}
            </p>
          </div>
          {!isOwnProfile && user && (
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isFollowing 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
          {!user && !isOwnProfile && (
            <div className="text-sm text-gray-500">
              Login to follow users
            </div>
          )}
        </div>
      </div>

      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        Posts by {profileUser.username}
      </h3>
      
      {!profileUser.posts || profileUser.posts.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          <p className="text-lg">No posts found for this user.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {profileUser.posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200"
            >
              <h4 className="text-xl font-semibold mb-3 text-gray-800">
                {post.title}
              </h4>
              <div 
                className="text-gray-700 mb-4 prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
              <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4 mt-4">
                <span>
                  Published on {new Date(post.createdAt).toLocaleDateString()}
                  {post.updatedAt !== post.createdAt && (
                    <span className="ml-2">
                      (Updated {new Date(post.updatedAt).toLocaleDateString()})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="text-red-400">♥</span>
                    {post.likesCount || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;