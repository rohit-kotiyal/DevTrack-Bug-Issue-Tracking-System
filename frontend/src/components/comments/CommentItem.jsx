import { useState } from "react";
import { deleteComment } from "../../api/comments.api";
import CommentForm from "./CommentForm";

export default function CommentItem({
  comment,
  currentUser,
  token,
  onRefresh,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const isAuthor = currentUser?.id === comment.user_id;

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;

    try {
      await deleteComment(comment.id, token);
      onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium">{comment.username}</p>
          <p className="text-xs text-gray-500">{comment.user_email}</p>
        </div>

        {isAuthor && !isEditing && (
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <CommentForm
          existingComment={comment}
          token={token}
          onSuccess={() => {
            setIsEditing(false);
            onRefresh();
          }}
        />
      ) : (
        <p className="text-sm text-gray-700">{comment.comment}</p>
      )}
    </div>
  );
}
