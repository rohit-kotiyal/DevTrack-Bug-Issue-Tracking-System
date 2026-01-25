import { useState } from "react";
import { addProjectMember } from "../../api/projects.api";

export default function AddProjectMember({ projectId, onAdded }) {
  const token = localStorage.getItem("token");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("DEV");

  const submit = async (e) => {
    e.preventDefault();

    await addProjectMember(
      projectId,
      { email, role },
      token
    );

    setEmail("");
    onAdded();
  };

  return (
    <form onSubmit={submit}>
      <h3>Add Project Member</h3>

      <input
        type="email"
        placeholder="User email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ADMIN">Admin</option>
        <option value="DEV">Developer</option>
        <option value="VIEWER">Viewer</option>
      </select>

      <button>Add</button>
    </form>
  );
}
