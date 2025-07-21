import React from "react";
import { User } from "lucide-react";
import { useBlog } from "../context/BlogContext";

const Users: React.FC = () => {
  const { users, setUsers } = useBlog();

  const handleFollowToggle = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              isFollowing: !user.isFollowing,
              followers: user.isFollowing
                ? user.followers
                  ? user.followers - 1
                  : 0
                : user.followers
                ? user.followers + 1
                : 1,
            }
          : user
      )
    );
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Kullanıcılar</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 avatar">
                  <span className="text-lg font-bold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{user.followers} takipçi</span>
                    <span>{user.following} takip</span>
                    <span>
                      Katılım:{" "}
                      {new Date(user.joinDate || "").toLocaleDateString(
                        "tr-TR"
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleFollowToggle(user.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  user.isFollowing
                    ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    : "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                }`}
                aria-label={user.isFollowing ? "Unfollow user" : "Follow user"}
              >
                {user.isFollowing ? "Takip Ediliyor" : "Takip Et"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
