import { useState } from "react";
import UploadExcel from "../components/UploadExcel";
import Dashboard from "./Dashboard";

function UploadPage() {
  const [rows, setRows] = useState([]);

  // Nếu đã kéo dữ liệu về thành công, hiển thị Dashboard
  if (rows.length > 0) {
    return (
      <Dashboard rows={rows} />
    );
  }

  // Màn hình lúc chưa có dữ liệu
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#070b14",
        color: "#ffffff"
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Quản Lý Dữ Liệu Work Order</h2>
      <UploadExcel setRows={setRows} />
    </div>
  );
}

export default UploadPage;