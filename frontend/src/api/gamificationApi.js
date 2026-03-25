import { request } from "./client";

export const gamificationApi = {
  getSnapshot: () => request("/gamification"),
};
