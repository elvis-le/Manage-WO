import { useState } from "react";
import UploadExcel from "../components/UploadExcel";
import Dashboard from "./Dashboard";

function UploadPage() {

  const [rows, setRows] = useState([]);

  if (rows.length > 0) {
    return (
      <Dashboard
        rows={rows}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#070b14",
      }}
    >
      <UploadExcel
        setRows={setRows}
      />
    </div>
  );
}

export default UploadPage;