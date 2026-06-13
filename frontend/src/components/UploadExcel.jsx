import React, { useState } from "react";
import { Button, Table, message, Card, Row, Col, Space, Upload, Typography } from "antd";
import { UploadOutlined, SyncOutlined, CloudUploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import api from "../api/axios";

const { Title, Text } = Typography;

// Mapping dịch cột tiếng Việt sang tiếng Anh (Giống hệt Streamlit)
const COLUMNS_MAPPING = {
  "Mã Công Việc": "wo_code",
  "Mã WO": "wo_code",
  "Loại Công Việc": "work_type",
  "Trạng Thái": "status",
  "Hệ Thống": "system_name",
  "Mức Độ Ưu Tiên": "priority_level",
  "Mã Tỉnh": "province_code",
  "Mã Huyện": "district_code",
  "Tên Huyện": "district_name",
  "Khu Vực": "area",
  "Mã Trạm": "station_code",
  "Nhóm WO": "wo_group",
  "Nhóm Điều Phối": "dispatch_group",
  "Nhân Viên Khởi Tạo": "creator",
  "Nhân Viên Thực Hiện": "assignee",
  "Comment của FT": "ft_comment",
  "FT Comment": "ft_comment",
  "Số Điện Thoại FT": "ft_phone",
  "SĐT FT": "ft_phone",
  "Thời Điểm Tạo": "created_at",
  "Thời Điểm Bắt Đầu Thực Hiện": "started_at",
  "Thời Điểm Yêu Cầu Kết Thúc": "due_at",
  "Thời Gian Còn Lại (Giờ)": "remaining_hours",
  "Số Ngày Quá Hạn": "overdue_days",
  "Thời Điểm FT Hoàn Thành": "completed_at",
  "Thời Điểm CD Đóng": "closed_at",
  "Thời Điểm Đóng": "closed_at",
  "Nội Dung Công Việc": "work_content",
  "Mô Tả": "description",
  "Tiền Phạt Quá Hạn": "penalty_amount",
  "Tiền Phạt": "penalty_amount"
};

export default function UploadExcel({ setRows }) {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [mergedData, setMergedData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Đọc file, bỏ 6 dòng đầu và lọc rác
  const readFileAndFilter = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve([]);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          // Bỏ qua 6 dòng đầu (skiprows=6 trong Pandas)
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { range: 6 });

          // Lọc dữ liệu: Hệ thống != SPM/SPM_VTNET và Nhóm WO != CĐBR
          const filteredJson = rawJson.filter((row) => {
            const system = String(row["Hệ Thống"] || "");
            const woGroup = String(row["Nhóm WO"] || "");

            const isSpm = system.includes("SPM") || system.includes("SPM_VTNET");
            const isCdbr = woGroup.includes("CĐBR");

            return !isSpm && !isCdbr;
          });

          resolve(filteredJson);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleProcessFiles = async () => {
    if (!file1 || !file2) {
      message.warning("Vui lòng tải lên cả 2 file để ghép!");
      return;
    }

    setIsProcessing(true);
    try {
      const data1 = await readFileAndFilter(file1);
      const data2 = await readFileAndFilter(file2);

      // Gộp 2 mảng dữ liệu
      const combined = [...data1, ...data2];

      // Đổi tên cột sang tiếng Anh theo Mapping
      const finalData = combined.map((row) => {
        const newRow = {};
        for (const key in row) {
          if (COLUMNS_MAPPING[key]) {
            newRow[COLUMNS_MAPPING[key]] = row[key];
          } else {
            newRow[key] = row[key]; // Giữ nguyên các cột không nằm trong mapping
          }
        }
        return newRow;
      });

      setMergedData(finalData);

      // Tạo cấu trúc cột cho bảng Preview của Ant Design (chỉ lấy khoảng 10 cột đầu cho gọn)
      if (finalData.length > 0) {
        const sampleKeys = Object.keys(finalData[0]).slice(0, 10);
        const cols = sampleKeys.map((key) => ({
          title: key,
          dataIndex: key,
          key: key,
          width: 150,
          ellipsis: true,
        }));
        setPreviewColumns(cols);
      }

      message.success(`Đã xử lý & ghép xong! Tổng cộng ${finalData.length} hàng.`);
    } catch (error) {
      message.error("Lỗi khi xử lý: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadToDB = async () => {
    if (mergedData.length === 0) return;

    setIsUploading(true);
    try {
      // Gửi thẳng mảng JSON sạch này tới Django Backend
      const response = await api.post("/admin/upload_excel/", {
        data: mergedData,
        file_name: `Merged_${file1.name}_${file2.name}`
      });

      message.success(`Đã upload trực tiếp ${response.data.total_records} dòng vào Database!`);

      // Xóa state để làm mới giao diện
      setFile1(null);
      setFile2(null);
      setMergedData([]);
      if (setRows) setRows(); // Chạy callback của AdminPage để fetch lại dữ liệu
    } catch (error) {
      message.error("Lỗi khi upload lên máy chủ: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card size="small" title="File dữ liệu 1">
            <Upload
              beforeUpload={(file) => { setFile1(file); return false; }}
              maxCount={1}
              onRemove={() => setFile1(null)}
            >
              <Button icon={<UploadOutlined />}>Chọn File 1</Button>
            </Upload>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="File dữ liệu 2">
            <Upload
              beforeUpload={(file) => { setFile2(file); return false; }}
              maxCount={1}
              onRemove={() => setFile2(null)}
            >
              <Button icon={<UploadOutlined />}>Chọn File 2</Button>
            </Upload>
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          style={{ backgroundColor: "#34b1b3", borderColor: "#34b1b3" }}
          icon={<SyncOutlined spin={isProcessing} />}
          onClick={handleProcessFiles}
          loading={isProcessing}
          disabled={!file1 || !file2}
        >
          Xử lý & Ghép File (Xem trước)
        </Button>
      </Space>

      {mergedData.length > 0 && (
        <Card title={`Dữ liệu xem trước (Preview 5 dòng đầu) - Tổng ${mergedData.length} dòng`} style={{ marginBottom: 16, border: '1px dashed #34b1b3' }}>
          <Table
            dataSource={mergedData.slice(0, 5)}
            columns={previewColumns}
            rowKey={(record, index) => index}
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="small"
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<CloudUploadOutlined />}
              onClick={handleUploadToDB}
              loading={isUploading}
            >
              Upload trực tiếp lên Database
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}