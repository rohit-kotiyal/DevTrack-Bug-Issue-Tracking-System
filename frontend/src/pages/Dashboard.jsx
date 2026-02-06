import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects.api";
import { getProjectTickets } from "../api/tickets.api";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [projects, setProjects] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTickets: 0,
    activeTickets: 0,
    completedTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    } else {
      navigate('/login');
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all projects
      const projectsRes = await getProjects(token);
      const projectsData = projectsRes.data;
      
      setProjects(projectsData.slice(0, 5)); // Show only 5 recent projects

      // Then, fetch tickets for each project
      const ticketPromises = projectsData.map(project => 
        getProjectTickets(project.project_id, token, {})
          .then(res => res.data)
          .catch(err => {
            console.error(`Failed to load tickets for project ${project.project_id}:`, err);
            return [];
          })
      );

      const ticketsArrays = await Promise.all(ticketPromises);
      const allTicketsData = ticketsArrays.flat(); // Combine all tickets into one array

      setAllTickets(allTicketsData);

      // Calculate real stats from all tickets
      const totalTickets = allTicketsData.length;
      const inProgressTickets = allTicketsData.filter(t => t.status === "IN_PROGRESS").length;
      const completedTickets = allTicketsData.filter(t => t.status === "DONE").length;

      setStats({
        totalProjects: projectsData.length,
        totalTickets,
        activeTickets: inProgressTickets,
        completedTickets,
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  // Count tickets per project
  const getProjectTicketCount = (projectId) => {
    return allTickets.filter(t => t.project_id === projectId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your project overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalProjects}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Projects</p>
        </div>

        {/* Total Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalTickets}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Tickets</p>
        </div>

        {/* In Progress Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.activeTickets}</h3>
          <p className="text-sm text-gray-600 mt-1">In Progress</p>
        </div>

        {/* Completed Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              Done
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.completedTickets}</h3>
          <p className="text-sm text-gray-600 mt-1">Completed</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-4">No projects yet</p>
              <button
                onClick={() => navigate('/projects')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const ticketCount = getProjectTicketCount(project.project_id);
                
                return (
                  <div
                    key={project.project_id}
                    onClick={() => navigate(`/projects/${project.project_id}-${project.name.toLowerCase().replace(/\s+/g, '-')}/tickets`)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      project.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      project.role === 'DEV' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.role}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition text-left group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">New Project</p>
                <p className="text-xs text-gray-500">Create a new project</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition text-left group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">New Ticket</p>
                <p className="text-xs text-gray-500">Report a bug or task</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition text-left group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Invite Team</p>
                <p className="text-xs text-gray-500">Add project members</p>
              </div>
            </button>
          </div>

          {/* Quick Stats Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ticket Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">To Do</span>
                <span className="font-medium text-gray-900">
                  {allTickets.filter(t => t.status === 'TODO').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium text-orange-600">
                  {allTickets.filter(t => t.status === 'IN_PROGRESS').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-green-600">
                  {allTickets.filter(t => t.status === 'DONE').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}