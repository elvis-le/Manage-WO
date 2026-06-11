import axios from "axios";

const api = axios.create({
  baseURL: "manage-wo-production.up.railway.app/api",
});

export default api;