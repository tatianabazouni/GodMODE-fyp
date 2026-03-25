import { request } from "./client";

export const goalsApi = {
  getAll: () => request("/goals"),
  create: (payload) => request("/goals", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(`/goals/${id}`, { method: "DELETE" }),
};
