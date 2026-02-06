import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject, deleteProject } from "../api/projects.api";
import { getProjectMembers, getTickets } from "../api/tickets.api";

export default function Projects() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [projectMembers, setProjectMembers] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token]);

  // ⭐ Load Projects + Tickets Together
  const loadProjects = async () => {
    try {
      const [projectsRes, ticketsRes] = await Promise.all([
        getProjects(token),
        getTickets(token),
      ]);

      const projectsData = projectsRes.data;
      const ticketsData = ticketsRes.data;

      setProjects(projectsData);
      setTickets(ticketsData);

      // Load member count per project
      projectsData.forEach(async (project) => {
        try {
          const membersRes = await getProjectMembers(
            project.project_id,
            token
          );

          setProjectMembers((prev) => ({
            ...prev,
            [project.project_id]: membersRes.data.length,
          }));
        } catch (error) {
          console.error(
            `Failed to load members for project ${project.project_id}:`,
            error
          );
        }
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  // ⭐ Ticket Count Helper
  const getProjectTicketCount = (projectId) => {
    return tickets.filter((t) => t.project_id === projectId).length;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createProject(newProject, token);
    setNewProject({ name: "", description: "" });
    setShowCreateModal(false);
    loadProjects();
  };

  const handleDelete = async (projectId, projectName) => {
    const ok = window.confirm(
      `Are you sure you want to delete "${projectName}"? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      await deleteProject(projectId, token);
      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      if (error.response?.status === 403) {
        alert("Only ADMIN can delete projects");
      } else {
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your team's projects
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 hover:cursor-pointer transition shadow-sm flex items-center space-x-2"
        >
          <span>Create Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects yet
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer group"
              onClick={() =>
                navigate(
                  `/projects/${p.project_id}-${p.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/tickets`
                )
              }
            >
              <div className="p-6">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {p.name}
                      </h3>

                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          p.role === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : p.role === "DEV"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ⭐ Stats Section */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  {/* Tasks */}
                  <div className="flex items-center space-x-1">
                    <span>
                      {getProjectTicketCount(p.project_id)}{" "}
                      {getProjectTicketCount(p.project_id) === 1
                        ? "task"
                        : "tasks"}
                    </span>
                  </div>

                  {/* Members */}
                  <div className="flex items-center space-x-1">
                    <span>
                      {projectMembers[p.project_id] !== undefined
                        ? `${projectMembers[p.project_id]} ${
                            projectMembers[p.project_id] === 1
                              ? "member"
                              : "members"
                          }`
                        : "Loading..."}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                {p.role === "ADMIN" && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.project_id, p.name);
                      }}
                      className="text-red-600 hover:cursor-pointer text-sm font-medium"
                    >
                      Delete Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleCreate} className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Create New Project
              </h2>

              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="Project Name"
                className="w-full border p-2 mb-4 rounded"
                required
              />

              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="w-full border p-2 mb-4 rounded"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button className="px-4 py-2 bg-blue-600 text-white rounded">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
