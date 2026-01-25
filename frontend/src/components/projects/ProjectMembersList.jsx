import { useState, useEffect } from "react";
import { getProjectMembers } from "../../api/projects.api";

export default function ProjectMembersList({ projectId }) {
  const token = localStorage.getItem("token");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      const res = await getProjectMembers(projectId, token);
      setMembers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load members:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && projectId) {
      loadMembers();
    }
  }, [projectId, token]);

  if (loading) return <p className="text-gray-500">Loading members...</p>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Members</h3>
      
      {members.length === 0 ? (
        <p className="text-gray-500 text-sm">No members yet</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {member.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{member.email}</span>
              </div>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                member.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                member.role === 'DEV' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}