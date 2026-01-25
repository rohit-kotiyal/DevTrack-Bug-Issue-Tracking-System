import { useState } from "react";
import { updateTicket } from "../../api/tickets.api";

export default function TicketList({ tickets, onUpdate, currentUserEmail }) {
  const token = localStorage.getItem("token");

  const handleStatusChange = async (ticketId, newStatus, assignedToEmail) => {
    // Check if ticket is assigned to current user's email
    if (assignedToEmail !== currentUserEmail) {
      alert("You can only change status of tickets assigned to you");
      return;
    }

    try {
      await updateTicket(ticketId, { status: newStatus }, token);
      onUpdate(); // Refresh the ticket list
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update ticket status");
    }
  };

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <div
          key={t.id}
          className="border p-3 rounded bg-white"
        >
          <h3 className="font-semibold">{t.title}</h3>
          <p className="text-sm text-gray-600">{t.description}</p>

          <div className="text-xs mt-2 space-y-2">
            <div className="flex gap-4">
              <span>Priority: {t.priority}</span>
              <span>Type: {t.issue_type}</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <span>
                Assigned to: {t.assigned_to_email || "Unassigned"}
              </span>
              
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value, t.assigned_to_email)}
                  disabled={!t.assigned_to_email || t.assigned_to_email !== currentUserEmail}
                  className="border rounded px-2 py-1 text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}