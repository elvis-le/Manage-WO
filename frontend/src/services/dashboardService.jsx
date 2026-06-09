import api from "../api/axios";

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