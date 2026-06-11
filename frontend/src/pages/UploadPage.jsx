/*
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

export default UploadPage;*/

import { useEffect, useState } from "react";

import Dashboard from "./Dashboard";
import { getWorkOrders } from "../services/dashboardService";

function UploadPage() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getWorkOrders();

      setRows(res.data.rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Dashboard
      rows={rows}
    />
  );
}

export default UploadPage;

export default UploadPage;
