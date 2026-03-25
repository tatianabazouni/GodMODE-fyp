import { request } from "./client";

export const visionApi = {
  getBoards: () => request("/boards"),
  createBoard: (title) => request("/boards", { method: "POST", body: JSON.stringify({ title }) }),
  deleteBoard: (id) => request(`/boards/${id}`, { method: "DELETE" }),
  getVisionItems: (boardId) => request(boardId ? `/vision-items?boardId=${boardId}` : "/vision-items"),
  createVisionItem: (payload) => request("/vision-items", { method: "POST", body: JSON.stringify(payload) }),
  updateVisionItem: (id, payload) => request(`/vision-items/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteVisionItem: (id) => request(`/vision-items/${id}`, { method: "DELETE" }),
  convertToGoal: (id) => request(`/vision-items/${id}/convert-to-goal`, { method: "POST" }),
};
