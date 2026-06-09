import { Routes, Route } from "react-router-dom";

import UploadPage from "../pages/UploadPage.jsx";
import Dashboard from "../pages/Dashboard.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default AppRoutes;