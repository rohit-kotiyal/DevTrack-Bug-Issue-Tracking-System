import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getProjectTickets, updateTicket, deleteTicket } from "../api/tickets.api";
import { getProject } from "../api/projects.api";
import { getCurrentUser } from "../api/users.api";

import TicketForm from "../components/tickets/TicketForm";
import KanbanColumn from "../components/kanban/KanbanColumn";
import AddProjectMember from "../components/projects/AddProjectMember";
import ProjectMembersList from "../components/projects/ProjectMembersList";

export default function ProjectTickets() {
  const { projectIdAndName } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const projectId = projectIdAndName.split("-")[0];

  const [tickets, setTickets] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [refreshMembers, setRefreshMembers] = useState(0);

  /* -------------------- API LOADERS -------------------- */

  const loadTickets = async () => {
    try {
      setError(null);
      const res = await getProjectTickets(projectId, token, {
        status_filter: statusFilter || undefined,
        priority: priority || undefined,
        search: search || undefined,
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async () => {
    try {
      const res = await getProject(projectId, token);
      setProjectName(res.data.name);
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Failed to load project details.");
    }
  };

  const loadCurrentUser = async () => {
    try {
      const res = await getCurrentUser(token);
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Failed to load current user:", err);
    }
  };


  const handleUpdate = async (ticketId, updatedData) => {
    try {
      await updateTicket(ticketId, updatedData, token);
      await loadTickets();
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Failed to update ticket. Only ADMINS & DEV's can update the tickets.");
    }
  };

  const handleDelete = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      await deleteTicket(ticketId, token);
      await loadTickets();
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      alert("Failed to delete ticket. Please try again.");
    }
  };


  const stats = {
    total: tickets.length,
    todo: tickets.filter((t) => t.status === "TODO").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    done: tickets.filter((t) => t.status === "DONE").length,
  };


  useEffect(() => {
    if (token && projectId) {
      loadProject();
      loadTickets();
      loadCurrentUser();
    }
  }, [projectId, token]);

  useEffect(() => {
    if (!token || !projectId) return;

    const timeout = setTimeout(() => {
      loadTickets();
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, statusFilter, priority]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="text-sm text-blue-600 hover:text-blue-700 hover:cursor-pointer font-medium mb-2 flex items-center space-x-1"
          >
            <span>←</span>
            <span>Back to Projects</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <p className="text-gray-600 mt-1">Manage tickets and track progress</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddMember(true)}
            className="bg-white border border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition-colors"
          >
            👥 Add Member
          </button>

          <button
            onClick={() => setShowCreateTicket(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:cursor-pointer transition-colors"
          >
            ➕ Create Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tickets</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
          <div className="text-sm text-blue-700">To Do</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-yellow-700">In Progress</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-sm text-green-700">Done</div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="🔍 Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-50 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-900 hover:cursor-pointer px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border border-gray-300 hover:cursor-pointer px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {(search || statusFilter || priority) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setPriority("");
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid md:grid-cols-3 gap-4">
            <KanbanColumn
              title="To Do"
              status="TODO"
              tickets={tickets}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              token={token}
              currentUser={currentUser}
            />
            <KanbanColumn
              title="In Progress"
              status="IN_PROGRESS"
              tickets={tickets}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              token={token}
              currentUser={currentUser}
            />
            <KanbanColumn
              title="Done"
              status="DONE"
              tickets={tickets}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              token={token}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Project Members Sidebar */}
        <div className="lg:col-span-1">
          <ProjectMembersList projectId={projectId} token={token} key={refreshMembers} />
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Ticket</h2>
              <button
                onClick={() => setShowCreateTicket(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <TicketForm
              projectId={projectId}
              token={token}
              onCreated={() => {
                loadTickets();
                setShowCreateTicket(false);
              }}
              onCancel={() => setShowCreateTicket(false)}
            />
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Project Member</h2>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <AddProjectMember
              projectId={projectId}
              token={token}
              onAdded={() => {
                setRefreshMembers((v) => v + 1);
                setShowAddMember(false);
              }}
              onCancel={() => setShowAddMember(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}