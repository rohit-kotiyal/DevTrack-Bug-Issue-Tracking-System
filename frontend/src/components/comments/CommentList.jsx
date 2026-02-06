import { useEffect, useState } from "react";
import { getTicketComments } from "../../api/comments.api";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

export default function CommentList({
  ticketId,
  currentUser,
}) {
  const token = localStorage.getItem("token");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await getTicketComments(ticketId, token);
      setComments(res.data);
    } catch (err) {
      console.error("Fetch comments failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Comments</h3>

      {/* Add Comment */}
      <CommentForm
        ticketId={ticketId}
        token={token}
        onSuccess={loadComments}
      />

      {/* Comment List */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUser={currentUser}
              token={token}
              onRefresh={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
