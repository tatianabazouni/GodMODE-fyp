import { request } from "./client";

export const analyticsApi = {
  getOverview: () => request("/analytics"),
};
