import { useEffect, useState } from "react";
import { createTicket } from "../../api/tickets.api";
import { getProjectMembers } from "../../api/projects.api";

export default function TicketForm({ projectId, onCreated }) {
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    issue_type: "TASK",
    priority: "MEDIUM",
    assigned_to_id: "",
  });

  // 🔹 Load project members (filter out VIEWERs)
  useEffect(() => {
    async function loadMembers() {
      try {
        setLoadingMembers(true);
        const res = await getProjectMembers(projectId, token);

        if (Array.isArray(res.data)) {
          // Filter out VIEWER role members
          const eligibleMembers = res.data.filter(m => m.role !== "VIEWER");
          setMembers(eligibleMembers);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Failed to load project members", err);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    }

    if (projectId && token) {
      loadMembers();
    }
  }, [projectId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createTicket(
      {
        title: form.title,
        description: form.description || null,
        issue_type: form.issue_type,
        priority: form.priority,
        project_id: Number(projectId),
        assigned_to_id: form.assigned_to_id
          ? Number(form.assigned_to_id)
          : null,
      },
      token
    );

    setForm({
      title: "",
      description: "",
      issue_type: "TASK",
      priority: "MEDIUM",
      assigned_to_id: "",
    });

    onCreated?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
      <h3>Create Ticket</h3>

      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <select name="issue_type" value={form.issue_type} onChange={handleChange}>
        <option value="TASK">Task</option>
        <option value="BUG">Bug</option>
        <option value="FEATURE">Feature</option>
      </select>

      <select name="priority" value={form.priority} onChange={handleChange}>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {/* ✅ Assign by email (only ADMIN and DEV) */}
      <select
        name="assigned_to_id"
        value={form.assigned_to_id}
        onChange={handleChange}
      >
        <option value="">Unassigned</option>

        {loadingMembers && <option disabled>Loading members...</option>}

        {!loadingMembers &&
          members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.email} ({m.role})
            </option>
          ))}
      </select>

      <button type="submit">Create</button>
    </form>
  );
}