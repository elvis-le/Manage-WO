import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/*<Route path="/dashboard" element={<Dashboard />} />*/}
    </Routes>
  );
}

export default AppRoutes;