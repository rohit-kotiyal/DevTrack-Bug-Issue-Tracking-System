import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getProjectTickets } from "../api/tickets.api";
import { getProject } from "../api/projects.api";
import { getCurrentUser } from "../api/users.api";

import TicketForm from "../components/tickets/TicketForm";
import TicketList from "../components/tickets/TicketList";
import AddProjectMember from "../components/projects/AddProjectMember";
import ProjectMembersList from "../components/projects/ProjectMembersList";

export default function ProjectTickets() {
  const { projectIdAndName } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const projectId = projectIdAndName.split("-")[0];

  const [tickets, setTickets] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [refreshMembers, setRefreshMembers] = useState(0);

  const loadTickets = async () => {
    const res = await getProjectTickets(projectId, token);
    setTickets(res.data);
  };

  const loadProject = async () => {
    const res = await getProject(projectId, token);
    setProjectName(res.data.name);
  };

  const loadCurrentUser = async () => {
    const res = await getCurrentUser(token);
    setCurrentUser(res.data);
  };

  useEffect(() => {
    if (token) {
      loadProject();
      loadTickets();
      loadCurrentUser();
    }
  }, [projectId, token]);

  // Calculate stats - using TODO instead of OPEN
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'TODO').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    done: tickets.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <p className="text-gray-600 mt-1">Manage tickets and track progress</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddMember(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Add Member</span>
          </button>
          <button
            onClick={() => setShowCreateTicket(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Tickets</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              <p className="text-sm text-gray-600">To Do</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
              <p className="text-sm text-gray-600">Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Tickets */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tickets Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
              <div className="flex space-x-2">
                {/* Filter buttons can go here */}
              </div>
            </div>
            
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first ticket</p>
                <button
                  onClick={() => setShowCreateTicket(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Create First Ticket
                </button>
              </div>
            ) : (
              <TicketList 
                tickets={tickets} 
                onUpdate={loadTickets}
                currentUserEmail={currentUser?.email}
              />
            )}
          </div>
        </div>

        {/* Sidebar - Project Info */}
        <div className="space-y-6">
          {/* Project Members */}
          <ProjectMembersList 
            projectId={projectId} 
            key={refreshMembers}
          />
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Ticket</h2>
              <button
                onClick={() => setShowCreateTicket(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <TicketForm
                projectId={projectId}
                onCreated={() => {
                  loadTickets();
                  setShowCreateTicket(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <AddProjectMember
                projectId={projectId}
                onAdded={() => {
                  loadProject();
                  setRefreshMembers(prev => prev + 1);
                  setShowAddMember(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
