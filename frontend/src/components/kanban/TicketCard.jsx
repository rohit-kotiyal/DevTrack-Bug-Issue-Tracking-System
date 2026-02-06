import { useState } from "react";
import Comments from "../comments/CommentList";

export default function TicketCard({
  ticket,
  onUpdate,
  token,
  currentUser,
}) {
  const [showComments, setShowComments] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "ticket",
      JSON.stringify({
        id: ticket.id,
        status: ticket.status,
      })
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="border rounded-lg p-4 bg-white space-y-2 cursor-move hover:shadow-lg transition-shadow"
    >
      <h3 className="font-semibold">{ticket.title}</h3>
      <p className="text-sm text-gray-600">{ticket.description}</p>

      <div className="flex justify-between items-center">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {ticket.priority}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag when clicking comment button
            setShowComments(!showComments);
          }}
          className="text-2xl hover:scale-110 transition-transform"
          title="Toggle comments"
        >
          💬
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t">
          <Comments
            ticketId={ticket.id}
            token={token}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
}