import { request } from "./client";

export const lifeApi = {
  createMemory: (payload) => request("/life/memories", { method: "POST", body: JSON.stringify(payload) }),
};
