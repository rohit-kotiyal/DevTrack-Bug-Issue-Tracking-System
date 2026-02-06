import { useEffect, useState } from "react";
import { createTicket } from "../../api/tickets.api";
import { getProjectMembers } from "../../api/projects.api";

export default function TicketForm({ projectId, onCreated }) {
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    issue_type: "TASK",
    priority: "MEDIUM",
    assigned_to_id: "",
  });

  // Load project members
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
    setSubmitting(true);

    try {
      await createTicket(
        {
          title: form.title,
          description: form.description || null,
          issue_type: form.issue_type,
          priority: form.priority,
           status: "TODO",
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
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g., Fix login button not working"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Provide detailed information about the issue..."
          value={form.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">Add any relevant details, steps to reproduce, or expected behavior</p>
      </div>

      {/* Two Column Layout for Type and Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Issue Type */}
        <div>
          <label htmlFor="issue_type" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Type
          </label>
          <div className="relative">
            <select
              id="issue_type"
              name="issue_type"
              value={form.issue_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm appearance-none bg-white"
            >
              <option value="TASK">📋 Task</option>
              <option value="BUG">🐛 Bug</option>
              <option value="FEATURE">✨ Feature</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="relative">
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm appearance-none bg-white"
            >
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🟠 High</option>
              <option value="URGENT">🔴 Urgent</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Assign To Field */}
      <div>
        <label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700 mb-2">
          Assign To
        </label>
        {loadingMembers ? (
          <div className="flex items-center justify-center py-3 border border-gray-300 rounded-lg bg-gray-50">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-sm text-gray-600">Loading members...</span>
          </div>
        ) : (
          <div className="relative">
            <select
              id="assigned_to_id"
              name="assigned_to_id"
              value={form.assigned_to_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm appearance-none bg-white"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.email} ({m.role})
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
        {members.length === 0 && !loadingMembers && (
          <p className="mt-1 text-xs text-gray-500">No team members available. Add members to the project first.</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onCreated?.()}
          className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Ticket</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}