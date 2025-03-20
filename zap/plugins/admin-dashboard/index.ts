import { registerPlugin, Plugin } from "..";

export const adminDashboardPlugin: Plugin = {
  name: "admin-dashboard",
  setup: () => {
    console.log("Admin Dashboard is now enabled!");
  },
};

registerPlugin(adminDashboardPlugin);
