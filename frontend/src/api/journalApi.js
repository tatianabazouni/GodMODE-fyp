import { request } from "./client";

export const journalApi = {
  getAll: () => request("/journal"),
  create: (payload) => request("/journal", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/journal/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(`/journal/${id}`, { method: "DELETE" }),
};
