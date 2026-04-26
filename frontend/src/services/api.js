// frontend/src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Helper ─────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("dsa_token");
}

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw {
      response: {
        data: data,
      },
    };
  }

  // ✅ IMPORTANT: return axios-like response
  return {
    data: data,
    status: res.status,
  };
}

// ─── Auth ─────────────────────────────────────────────────────

export const authApi = {
  signup: (payload) => request("POST", "/auth/signup", payload),
  login: (payload) => request("POST", "/auth/login", payload),
};

// ─── Stats ────────────────────────────────────────────────────

export const statsApi = {
  getDashboard: () => request("GET", "/stats/dashboard"),
};

// ─── Progress ─────────────────────────────────────────────────

export const progressApi = {
  getAll: () => request("GET", "/progress"),
  getToday: () => request("GET", "/progress/today"),
  getSummary: () => request("GET", "/progress/summary"),
  create: (payload) => request("POST", "/progress", payload),
  update: (id, payload) => request("PUT", `/progress/${id}`, payload),
  remove: (id) => request("DELETE", `/progress/${id}`),
};