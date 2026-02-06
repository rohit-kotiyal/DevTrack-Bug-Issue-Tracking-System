import TicketCard from "./TicketCard";
import { updateTicket } from "../../api/tickets.api";

export default function KanbanColumn({
  title,
  status,
  tickets,
  onUpdate,
  currentUser,
  token,
}) {
  const filteredTickets = tickets.filter(t => t.status === status);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData("ticket"));
      
      console.log("Dropped ticket:", data); 
      if (data.status === status) return;


      if (!data.id) {
        console.error("ERROR: No ticket ID in dropped data:", data);
        alert("Cannot move ticket: Missing ID");
        return;
      }

      console.log("Updating ticket ID:", data.id, "to status:", status); 

      await onUpdate(data.id, { status });

    } catch (error) {
      console.error("Failed to update ticket:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to move ticket. Please try again.");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
    >
      <h3 className="font-semibold text-gray-700 mb-3">
        {title} ({filteredTickets.length})
      </h3>

      <div className="space-y-3">
        {filteredTickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            token={token}
            currentUser={currentUser}
            onUpdate={onUpdate}
          />
        ))}
        
        {filteredTickets.length === 0 && (
          <div className="text-center text-gray-400 py-8 text-sm">
            Drop tickets here
          </div>
        )}
      </div>
    </div>
  );
}