import React from "react";
import { Trash2, Edit } from "lucide-react";
// import { useBlog } from "../context/BlogContext";
import { useNavigate } from "react-router-dom";
import { IAuthContext, useAuth } from "../context/AuthContext";
import { Post } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/redux/store";
import { deletePost } from "../store/redux/slices/postSlice";

const Profile: React.FC = () => {
  const { user: currentUser } = useAuth() as { user: NonNullable<IAuthContext['user']> };
  const { posts } = useSelector((state: RootState) => state.posts);
  const dispatch = useDispatch<AppDispatch>();
  // const {
  //   // currentUser,
  //   posts,
  //   formatDate,
  //   // handleDeletePost,
  //   // handleEditPost,
  //   setShowAuth,
  // } = useBlog();

  const navigate = useNavigate();

  const userPosts = posts.filter((post) => post.author.id === currentUser.id);

  // Düzenleme işlemi için yeni fonksiyon
  const handleEdit = (post: Post) => {
    navigate(`/edit-post/${post.id}`, { state: { post } });
    // Ya da direkt create-post sayfasına yönlendirip state ile post bilgisini gönderebilirsiniz
    // navigate('/create-post', { state: { postToEdit: post } });
  };

  // Silme işlemi için yeni fonksiyon
  const handleDelete = async (postId: string) => {
    dispatch(deletePost(postId));
    // await handleDeletePost(postId);
    // Silme işleminden sonra güncel post listesini göstermek için sayfayı yenileyebilirsiniz
    // navigate(0); // Sayfayı yeniler
    // Veya başka bir sayfaya yönlendirebilirsiniz
    navigate("/home");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-8">
          <div className="w-20 h-20 avatar mb-4 md:mb-0">
            <span className="text-2xl font-bold">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentUser.name}
            </h1>
            <p className="text-gray-500">@{currentUser.username}</p>
            <p className="text-gray-600 mt-1">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {userPosts.length}
            </div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-sm text-gray-500">Takipçi</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-500">Takip</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <button className="btn btn-primary flex-1">Profili Düzenle</button>
          <button
            onClick={() => setShowAuth(true)}
            className="btn btn-secondary"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Postlarım</h2>
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Henüz post oluşturmadınız.
            </p>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <div className="flex items-center space-x-4">
                    <span>{post.likes} beğeni</span>
                    <span>{post.views} görüntülenme</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        aria-label="Edit post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
