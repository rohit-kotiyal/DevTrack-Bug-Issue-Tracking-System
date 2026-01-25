import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getProjectTickets } from "../api/tickets.api";
import { getProject } from "../api/projects.api";
import { getCurrentUser } from "../api/users.api";

import TicketForm from "../components/tickets/TicketForm";
import TicketList from "../components/tickets/TicketList";
import AddProjectMember from "../components/projects/AddProjectMember";
import ProjectMembersList from "../components/projects/ProjectMembersList"; // ← Add this import

export default function ProjectTickets() {
  const { projectIdAndName } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const projectId = projectIdAndName.split("-")[0];

  const [tickets, setTickets] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [currentUser, setCurrentUser] = useState(null); 

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/projects")}
        style={{ marginBottom: "12px" }}
      >
        ← Back to Projects
      </button>

      <h1 className="text-xl font-bold mb-6">
        {projectName || "Project"} — Tickets
      </h1>

      {/* PROJECT MEMBERS LIST */}
      <ProjectMembersList projectId={projectId} />

      {/* ADD MEMBER (ADMIN ONLY) */}
      <AddProjectMember
        projectId={projectId}
        onAdded={loadProject}
      />

      {/* CREATE TICKET */}
      <TicketForm
        projectId={projectId}
        onCreated={loadTickets}
      />

      {/* LIST TICKETS */}
      <TicketList 
        tickets={tickets} 
        onUpdate={loadTickets} 
        currentUserEmail={currentUser?.email} 
      />
    </div>
  );
}