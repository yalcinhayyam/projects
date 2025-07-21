import React, { useState } from "react";
import { useBlog } from "../../context/BlogContext";
import { User, Heart } from "lucide-react";

interface Comment {
  id: number;
  content: string;
  author: {
    name: string;
    username: string;
  };
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const { formatDate, currentUser } = useBlog();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      content: "Harika bir yazı olmuş, çok teşekkürler!",
      author: {
        name: "Mehmet Yılmaz",
        username: "mehmetyilmaz",
      },
      createdAt: "2024-12-01T11:30:00Z",
      likes: 3,
      isLiked: false,
    },
  ]);

  const handleAddComment = () => {
    if (!commentText.trim() || !currentUser) return;

    const newComment: Comment = {
      id: Date.now(),
      content: commentText,
      author: {
        name: currentUser.name,
        username: currentUser.username,
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  const handleLikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked,
            }
          : comment
      )
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Yorumlar ({comments.length})
      </h3>

      {/* Add Comment */}
      {currentUser && (
        <div className="mb-8">
          <div className="flex space-x-4">
            <div className="w-10 h-10 avatar flex-shrink-0">
              <span className="text-sm font-bold">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="btn btn-primary"
                >
                  Yorum Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <div className="w-10 h-10 avatar flex-shrink-0">
              <span className="text-sm font-bold">
                {comment.author.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {comment.author.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      @{comment.author.username}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{comment.content}</p>
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center space-x-1 text-xs ${
                    comment.isLiked
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500"
                  } transition-colors`}
                >
                  <Heart
                    className={`w-3 h-3 ${
                      comment.isLiked ? "fill-current" : ""
                    }`}
                  />
                  <span>{comment.likes} beğeni</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
