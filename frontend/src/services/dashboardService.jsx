import api from "../api/axios";

export const getWorkOrders = () => {
  return api.get("/work-orders/");
};
export const uploadDashboard =
  (file) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    return api.post(
      "/dashboard/upload/",
      formData
    );
  };