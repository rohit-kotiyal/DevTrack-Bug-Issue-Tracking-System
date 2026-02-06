import { useState, useEffect } from "react";
import { getProjectMembers } from "../../api/projects.api";

export default function ProjectMembersList({ projectId, refreshTrigger }) {
  const token = localStorage.getItem("token");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      setLoading(true);
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
  }, [projectId, token, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
        <button
          onClick={loadMembers}
          className="text-blue-600 hover:text-blue-700 transition"
          title="Refresh members"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {members.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-sm">No members yet</p>
          <p className="text-gray-400 text-xs mt-1">Add members to start collaborating</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {member.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{member.email}</p>
                  {member.name && (
                    <p className="text-xs text-gray-500">{member.name}</p>
                  )}
                </div>
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
      
      {/* Member count */}
      {members.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {members.length} {members.length === 1 ? 'member' : 'members'} total
          </p>
        </div>
      )}
    </div>
  );
}