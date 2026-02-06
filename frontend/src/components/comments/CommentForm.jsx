import { useState } from "react";
import { createComment, updateComment } from "../../api/comments.api";

export default function CommentForm({
  ticketId,
  token,
  onSuccess,
  existingComment = null,
}) {
  const [comment, setComment] = useState(existingComment?.comment || "");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(existingComment);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      setLoading(true);

      if (isEdit) {
        // UPDATE comment
        await updateComment(
          existingComment.id,
          { comment }, // ✅ matches CommentUpdate schema
          token
        );
      } else {
        // CREATE comment
        await createComment(
          ticketId,
          { comment }, // ✅ MUST be { comment: string }
          token
        );
      }

      setComment("");
      onSuccess();
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isEdit ? "Update" : "Comment"}
        </button>
      </div>
    </form>
  );
}
