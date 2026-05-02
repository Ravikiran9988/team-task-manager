const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

if (!API) {
  throw new Error("VITE_API_URL is not set. Configure it in your environment.");
}

const request = async (path, options = {}) => {
  const token = localStorage.getItem("ttm_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const details = data.errors
        .map((error) => {
          const field = error.field ? `${error.field}: ` : "";
          return `${field}${error.message}`;
        })
        .join("\n");
      throw new Error(`${data.message || "Validation failed"}\n${details}`);
    }

    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getDashboard: () => request("/dashboard"),
  getProjects: () => request("/projects"),
  createProject: (payload) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addMemberToProject: (projectId, email) =>
    request(`/projects/${projectId}/add-member`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  getTasksByProject: (projectId) => request(`/tasks/project/${projectId}`),
  createTask: (payload) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTask: (taskId, payload) =>
    request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteTask: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: "DELETE",
    }),
};
