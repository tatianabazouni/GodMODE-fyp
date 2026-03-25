import { request } from "./client";

export const dailyPhotoApi = {
  getAll: () => request("/daily-photo"),
  create: (payload) => request("/daily-photo", { method: "POST", body: JSON.stringify(payload) }),
};
