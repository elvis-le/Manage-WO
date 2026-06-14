import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: "http://127.0.0.1:8020/api",
});

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
//
// // Interceptor xử lý khi token hết hạn hoặc lỗi auth
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//       // Nếu lỗi auth, xóa token cũ và đẩy về trang login (tùy biến theo luồng app)
//       localStorage.clear();
//     }
//     return Promise.reject(error);
//   }
// );

export default api;