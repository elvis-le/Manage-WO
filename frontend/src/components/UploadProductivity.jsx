import React, { useState } from "react";
import { Button, Table, message, Card, Upload } from "antd";
import { UploadOutlined, CloudUploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import api from "../api/axios";

export default function UploadProductivity({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const processExcel = (uploadedFile) => {
    if (!uploadedFile) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // rawJson lấy toàn bộ data, nếu rỗng thì thay bằng 0
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { range: 6, defval: 0 });

        if (rawJson.length === 0) {
          message.warning("File Excel không có dữ liệu!");
          setIsProcessing(false);
          return;
        }

        // TÌM TỰ ĐỘNG CÁC CỘT NGÀY:
        // Lấy danh sách tất cả tiêu đề cột
        const allColumns = Object.keys(rawJson[0]);
        // Lọc ra các cột có chứa chữ "WO thực hiện ngày"
        const dateColumns = allColumns
            .filter(col => col.includes("WO thực hiện ngày"))
            .sort(); // Sắp xếp theo bảng chữ cái (ngày cũ đến ngày mới)

        if (dateColumns.length === 0) {
          message.error("Không tìm thấy cột nào có tiêu đề bắt đầu bằng 'WO thực hiện ngày'!");
          setIsProcessing(false);
          return;
        }

        // Chỉ lấy 5 cột ngày cuối cùng (5 ngày mới nhất trong file)
        const targetColumns = dateColumns.slice(-5);
        const normalizedData = [];

        // Lọc và chuyển dữ liệu từ ngang sang dọc
        rawJson.forEach(row => {
          const ft = row["FT"];
          const tt_cum = row["TT cụm"];
          const ma_tinh = row["Mã Tỉnh"];

          // Bỏ qua nếu không có tên FT (dòng rác, dòng tổng)
          if (!ft) return;

          targetColumns.forEach(colName => {
            // Tách lấy cái ngày: "WO thực hiện ngày 2026-06-14" -> "2026-06-14"
            const dateStr = colName.replace("WO thực hiện ngày", "").trim();

            normalizedData.push({
              ft: ft,
              tt_cum: tt_cum,
              province_code: ma_tinh,
              daytime: dateStr,
              wo_done: Number(row[colName]) || 0 // Ép kiểu số, nếu lỗi thì ra 0
            });
          });
        });

        // Xóa Duplicate (chỉ lấy 1 dòng cho 1 người/1 ngày)
        const uniqueData = normalizedData.filter((v, i, a) =>
            a.findIndex(t => (t.ft === v.ft && t.daytime === v.daytime)) === i
        );

        setPreviewData(uniqueData);
        if(uniqueData.length > 0) {
          message.success(`Trích xuất thành công ${uniqueData.length} dữ liệu cho 5 ngày gần nhất.`);
        } else {
          message.warning("Không lấy được dòng dữ liệu nào, vui lòng kiểm tra lại file!");
        }

      } catch (error) {
        message.error("Lỗi đọc file: " + error.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleUploadToDB = async () => {
    if (previewData.length === 0) return;
    setIsUploading(true);
    try {
      const response = await api.post("/admin/upload_productivity/", {
        data: previewData
      });
      message.success(response.data.message);
      setFile(null);
      setPreviewData([]); // Reset bảng sau khi up xong
      if(onSuccess) onSuccess();
    } catch (error) {
      message.error("Lỗi Upload: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const columns = [
    { title: 'Tên FT', dataIndex: 'ft', key: 'ft' },
    { title: 'TT Cụm', dataIndex: 'tt_cum', key: 'tt_cum' },
    { title: 'Mã Tỉnh', dataIndex: 'province_code', key: 'province_code' },
    { title: 'Ngày', dataIndex: 'daytime', key: 'daytime' },
    {
      title: 'WO Hoàn Thành',
      dataIndex: 'wo_done',
      key: 'wo_done',
      render: (val) => <strong style={{color: '#34b1b3'}}>{val}</strong>
    },
  ];

  return (
    <Card title="Cập nhật năng suất NSLĐ (FTNT)" style={{ marginBottom: 20 }}>
      <Upload
        beforeUpload={(f) => {
          setFile(f);
          processExcel(f); // Vừa đưa file vào là tự chạy tính toán luôn
          return false;
        }}
        fileList={file ? [file] : []}
        maxCount={1}
        onRemove={() => { setFile(null); setPreviewData([]); }}
      >
        <Button icon={<UploadOutlined />} loading={isProcessing}>
          Chọn file Năng Suất (Excel/CSV)
        </Button>
      </Upload>

      {/* CHỈ KHI CÓ DATA BẢNG NÀY VÀ NÚT UPLOAD MỚI HIỆN RA */}
      {previewData.length > 0 && (
        <div style={{ marginTop: 20, border: '1px solid #e8e8e8', padding: 16, borderRadius: 8 }}>
          <Table
            dataSource={previewData.slice(0, 5)}
            columns={columns}
            pagination={false}
            size="small"
            rowKey={(record, index) => index}
            title={() => <strong>Xem trước dữ liệu (Hiển thị 5 / {previewData.length} dòng)</strong>}
          />

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              size="large"
              icon={<CloudUploadOutlined />}
              onClick={handleUploadToDB}
              loading={isUploading}
            >
              Xác nhận & Cập nhật vào Database
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}