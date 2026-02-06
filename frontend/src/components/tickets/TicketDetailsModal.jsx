import { useEffect, useState } from "react";
import {
  getTicketComments,
  createComment,
  updateComment,
  deleteComment,
} from "../../api/comments.api";

export default function TicketDetailsModal({
  ticket,
  token,
  currentUser,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const loadComments = async () => {
    const res = await getTicketComments(ticket.id, token);
    setComments(res.data);
  };

  useEffect(() => {
    loadComments();
  }, [ticket.id]);

  const handleCreate = async () => {
    if (!newComment.trim()) return;
    await createComment(ticket.id, { comment: newComment }, token);
    setNewComment("");
    loadComments();
  };

  const handleUpdate = async (commentId) => {
    await updateComment(commentId, { comment: editingText }, token);
    setEditingId(null);
    setEditingText("");
    loadComments();
  };

  const handleDelete = async (commentId) => {
    await deleteComment(commentId, token);
    loadComments();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{ticket.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Ticket info */}
        <div className="px-6 py-4 space-y-2 text-sm text-gray-700 border-b">
          <p>{ticket.description}</p>
          <div className="flex gap-4 text-xs">
            <span>Status: {ticket.status}</span>
            <span>Priority: {ticket.priority}</span>
            <span>Assigned: {ticket.assigned_to_email || "Unassigned"}</span>
          </div>
        </div>

        {/* Comments */}
        <div className="px-6 py-4 space-y-4 max-h-[400px] overflow-y-auto">
          <h3 className="font-medium">Comments</h3>

          {comments.map((c) => (
            <div key={c.id} className="border rounded p-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{c.username}</span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>

              {editingId === c.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(c.id)}
                      className="text-blue-600 text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm">{c.comment}</p>
              )}

              {c.user_id === currentUser.id && editingId !== c.id && (
                <div className="flex gap-3 mt-2 text-xs">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditingText(c.comment);
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add comment */}
        <div className="px-6 py-4 border-t">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded p-2 text-sm"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
