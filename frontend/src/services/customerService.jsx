import api from "../api/axios";

export const getCustomers = () => {
  return api.get("/customers/");
};