import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard.jsx";
import AdminPage from "../pages/AdminPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { DataProvider } from "../context/DataContext.jsx"; // Bổ sung import

function AppRoutes() {
  return (
    <AuthProvider>
      {/* Đặt DataProvider ở đây, mọi component con đều xài chung được data */}
      <DataProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default AppRoutes;