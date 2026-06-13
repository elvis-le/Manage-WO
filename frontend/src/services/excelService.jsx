import api from "../api/axios";

// Cập nhật nhận song song 2 file gửi lên server
export const uploadExcel = (file1, file2) => {
  const formData = new FormData();
  formData.append("file1", file1);
  formData.append("file2", file2);

  return api.post("/upload/", formData); // URL match với urls.py của backend
};

export const fetchWorkOrders = () => {
  return api.get("/work-orders/");
};