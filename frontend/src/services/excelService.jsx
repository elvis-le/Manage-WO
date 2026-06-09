import api from "../api/axios";

export const uploadExcel = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/excel/", formData);
};