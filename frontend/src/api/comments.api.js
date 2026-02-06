import axios from "./axios";

/**
 * Get all comments for a specific ticket
 * @param {number} ticketId - The ticket ID
 * @param {string} token - JWT authentication token
 * @param {number} skip - Number of comments to skip (pagination)
 * @param {number} limit - Maximum number of comments to return
 */
export const getTicketComments = (ticketId, token, skip = 0, limit = 50) => {
  return axios.get(`/tickets/${ticketId}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      skip,
      limit,
    },
  });
};

/**
 * Create a new comment on a ticket
 * @param {number} ticketId - The ticket ID
 * @param {object} commentData - { comment: string, ticket_id: number }
 * @param {string} token - JWT authentication token
 */
export const createComment = (ticketId, commentData, token) => {
  return axios.post(
    `/tickets/${ticketId}/comments`,
    {
      comment: commentData.comment,
      ticket_id: ticketId,  // ✅ Ensure ticket_id is included
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Get a single comment by ID
 * @param {number} commentId - The comment ID
 * @param {string} token - JWT authentication token
 */
export const getComment = (commentId, token) => {
  return axios.get(`/tickets/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Update a comment (author only)
 * @param {number} commentId - The comment ID
 * @param {object} commentData - { comment: string }
 * @param {string} token - JWT authentication token
 */
export const updateComment = (commentId, commentData, token) => {
  return axios.put(
    `/tickets/comments/${commentId}`,
    {
      comment: commentData.comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Partially update a comment (author only)
 * @param {number} commentId - The comment ID
 * @param {object} commentData - { comment: string }
 * @param {string} token - JWT authentication token
 */
export const patchComment = (commentId, commentData, token) => {
  return axios.patch(
    `/tickets/comments/${commentId}`,
    {
      comment: commentData.comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Delete a comment (author only)
 * @param {number} commentId - The comment ID
 * @param {string} token - JWT authentication token
 */
export const deleteComment = (commentId, token) => {
  return axios.delete(`/tickets/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Get comment count for a ticket
 * @param {number} ticketId - The ticket ID
 */
export const getCommentCount = (ticketId) => {
  return axios.get(`/tickets/${ticketId}/comments/count`);
};