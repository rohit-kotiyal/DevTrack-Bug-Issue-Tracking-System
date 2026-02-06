import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectTickets } from "../api/tickets";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const token = localStorage.getItem("token");

  const [columns, setColumns] = useState({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });

  useEffect(() => {
    fetchTickets();
  }, [projectId]);

  const fetchTickets = async () => {
    try {
      const res = await getProjectTickets(projectId, token);
      const tickets = res.data;

      const grouped = {
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
      };

      tickets.forEach((ticket) => {
        grouped[ticket.status].push(ticket);
      });

      // sort by order (VERY IMPORTANT)
      STATUSES.forEach((status) => {
        grouped[status].sort((a, b) => a.order - b.order);
      });

      setColumns(grouped);
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Board</h1>

      <div className="grid grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <div key={status} className="bg-gray-100 rounded p-3">
            <h2 className="font-semibold mb-2">{status}</h2>

            {columns[status].map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white p-3 rounded shadow mb-2"
              >
                <p className="font-medium">{ticket.title}</p>
                <p className="text-sm text-gray-500">
                  {ticket.assigned_to_email || "Unassigned"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
