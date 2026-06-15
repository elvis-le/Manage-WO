import { useMemo, useState } from "react";
import {
    Card,
    Table,
    Select,
    Typography,
    Space,
    Tag,
    Statistic,
    Row,
    Col,
    ConfigProvider,
    Grid,
    Button,
    Modal,
} from "antd";

import {
    UserOutlined,
    BarChartOutlined,
} from "@ant-design/icons";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LabelList,
    Cell,
    Legend,
} from "recharts";

const { Text, Title } = Typography;

/* =========================================================
 * HELPER: COLOR GENERATOR & MAP FOR WO GROUPS
 * =======================================================*/
// Bảng màu cố định cho các nhóm phổ biến để đảm bảo tính nhất quán
const FIXED_GROUP_COLORS = {
    'CĐBR': '#ef4444', // Đỏ
    'Vận hành': '#3b82f6', // Xanh dương
    'Ứng cứu thông tin': '#f97316', // Cam
    'Bảo dưỡng': '#22c55e', // Xanh lá
    'Lắp đặt': '#eab308', // Vàng
    'Khác': '#8b5cf6', // Tím
};

// Hàm tạo màu ngẫu nhiên nhưng cố định dựa trên tên nhóm cho các nhóm mới
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const getGroupColor = (groupName) => {
    return FIXED_GROUP_COLORS[groupName] || stringToColor(groupName);
};

/* =========================================================
 * HELPER: DATE FUNCTIONS
 * =======================================================*/
const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const getLast5WorkingDays = () => {
    const days = [];
    const current = new Date();
    // Bắt đầu tính từ ngày hôm qua để đảm bảo dữ liệu đã đóng gói hoàn tất
    current.setDate(current.getDate() - 1);
    while (days.length < 5) {
        // Chỉ lấy các ngày làm việc (Thứ 2 đến Thứ 7), bỏ qua Chủ nhật (getDay() === 0)
        if (current.getDay() !== 0) {
            days.push(formatDate(current));
        }
        current.setDate(current.getDate() - 1);
    }
    // Trả về danh sách ngày đã được sắp xếp từ cũ đến mới
    return days.sort();
};



/* =========================================================
 * MAIN COMPONENT
 * =======================================================*/
const UnderperformingHorizontalBarChart = ({ rows = [] }) => {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const [province, setProvince] = useState("ALL");
    const [group, setGroup] = useState("ALL");

    // State quản lý việc đóng/mở hộp thoại "Show ALL FT"
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Tính toán danh sách 5 ngày làm việc gần nhất
    const last5Days = useMemo(() => getLast5WorkingDays(), []);

    // Tạo danh sách Tỉnh/Thành phố duy nhất từ dữ liệu gốc để bỏ vào Dropdown
    const provinces = useMemo(() => [
        "ALL",
        ...new Set(rows.map(r => r.province).filter(Boolean)),
    ], [rows]);

    // Tạo danh sách Nhóm WO duy nhất, tự động lọc lại khi Tỉnh được chọn thay đổi
    const groups = useMemo(() => {
        let filteredRows = rows;
        if (province !== "ALL") {
            filteredRows = rows.filter(r => r.province === province);
        }
        return ["ALL", ...new Set(filteredRows.map(r => r.wo_group).filter(Boolean))];
    }, [rows, province]);

    /* Logic lõi: Tính toán năng suất 5 ngày gần nhất của tất cả FT */
    const employeeViolationData = useMemo(() => {
        if (!rows.length) return [];
        const employeeMap = {};

        // Chỉ lọc lấy các nhân viên điều phối (FT), đã hoàn thành công việc và có thời gian đóng WO
        rows.filter(row =>
            row.dispatch_employee === true &&
            row.employee &&
            row.completed === true &&
            row.close_time
        ).forEach(row => {
            // Chỉ lấy phần ngày (YYYY-MM-DD) từ chuỗi thời gian đóng
            const closeDate = row.close_time.slice(0, 10);
            // Nếu ngày đóng nằm ngoài khoảng 5 ngày gần nhất đang xét, bỏ qua
            if (!last5Days.includes(closeDate)) return;

            // Tạo Key duy nhất kết hợp Tỉnh và Tên để phân biệt nhân viên trùng tên khác tỉnh
            const key = `${row.dispatch_province}_${row.employee}`;
            if (!employeeMap[key]) {
                employeeMap[key] = {
                    employee: row.employee,
                    province: row.dispatch_province,
                    groups: new Set(),
                    dailyCounts: {},
                };
                // Khởi tạo bộ đếm WO cho từng ngày bằng 0
                last5Days.forEach(d => { employeeMap[key].dailyCounts[d] = 0; });
            }
            // Thêm nhóm WO vào tập hợp (Set) để biết FT này thuộc những nhóm nào
            employeeMap[key].groups.add(row.wo_group);
            // Tăng số lượng WO của nhân viên trong ngày đó lên 1
            employeeMap[key].dailyCounts[closeDate] += 1;
        });

        const result = [];
        // Duyệt qua bản đồ dữ liệu để tính toán Tổng và Trung bình năng suất
        Object.values(employeeMap).forEach(emp => {
            const counts = last5Days.map(d => emp.dailyCounts[d] || 0);
            const totalWO = counts.reduce((a, b) => a + b, 0);
            const avg = totalWO / 5;

            // Áp dụng ngưỡng KPI: Chỉ lấy những nhân viên có < 25 WO trong 5 ngày (TB < 5/ngày)
            if (totalWO >= 25) return;

            result.push({
                key: `${emp.province}_${emp.employee}`,
                employee: emp.employee,
                province: emp.province,
                // Chuyển tập hợp Set thành Mảng và lấy nhóm đầu tiên để định nghĩa màu cột
                groups: [...emp.groups],
                primary_group: [...emp.groups][0] || 'Khác',
                totalWO,
                avg: Number(avg.toFixed(2)), // Làm tròn số trung bình đến 2 chữ số thập phân
            });
        });
        // Sắp xếp danh sách theo năng suất trung bình tăng dần
        return result.sort((a, b) => a.avg - b.avg);
    }, [rows, last5Days]);

    /* Dữ liệu cho Modal "Show ALL FT": Phụ thuộc hoàn toàn vào 2 Dropdown lọc */
    const allFTModalData = useMemo(() => {
        return employeeViolationData.filter(item => {
            // Lọc theo Tỉnh
            if (province !== "ALL" && item.province !== province) return false;
            // Lọc theo Nhóm WO
            if (group !== "ALL" && !item.groups.includes(group)) return false;
            return true;
        });
    }, [employeeViolationData, province, group]);

    // Tạo danh sách các nhóm WO duy nhất và màu sắc tương ứng để hiển thị trong Chú thích (Legend)
    const legendData = useMemo(() => {
        const uniqueGroups = [...new Set(allFTModalData.map(item => item.primary_group))];
        return uniqueGroups.map(groupName => ({
            value: groupName,
            color: getGroupColor(groupName)
        }));
    }, [allFTModalData]);

    // Thống kê cho bảng hiện tại (Tập hợp theo Tỉnh)
    const provinceSummary = useMemo(() => {
        const map = {};
        employeeViolationData.forEach(emp => {
            map[emp.province] = (map[emp.province] || 0) + 1;
        });
        return Object.entries(map).map(([province, total]) => ({
            key: province, province, total,
        })).sort((a, b) => b.total - a.total);
    }, [employeeViolationData]);

    // Thống kê cho bảng hiện tại (Tập hợp theo Nhóm WO khi đã chọn Tỉnh)
    const groupSummary = useMemo(() => {
        if (province === "ALL") return [];
        const map = {};
        employeeViolationData.filter(emp => emp.province === province).forEach(emp => {
            emp.groups.forEach(groupName => {
                if (!map[groupName]) map[groupName] = new Set();
                map[groupName].add(emp.employee);
            });
        });
        return Object.entries(map).map(([wo_group, employees]) => ({
            key: wo_group, wo_group, total: employees.size,
        })).sort((a, b) => b.total - a.total);
    }, [employeeViolationData, province]);

    // Dữ liệu cho mảng nhân viên chi tiết
    const employeeTable = useMemo(() => {
        return allFTModalData;
    }, [allFTModalData]);

    // Tính toán 2 số liệu KPI tổng quát cho 2 thẻ Statistic trên Dashboard
    const totalBadEmployees = employeeTable.length;
    const averageProductivity = totalBadEmployees > 0
        ? employeeTable.reduce((sum, emp) => sum + emp.avg, 0) / totalBadEmployees
        : 0;

    // Logic xác định Level hiển thị dữ liệu cho Bảng và Biểu đồ chính
    let tableData = [];
    let columns = [];
    let chartTitle = "";
    let mainChartData = [];

    // Cấp 1: Toàn quốc - Hiển thị tổng số FT năng suất kém theo từng Tỉnh
    if (province === "ALL" && group === "ALL") {
        tableData = provinceSummary;
        columns = [{ title: "Tỉnh", dataIndex: "province", render: v => <Tag color="blue">{v}</Tag> }, { title: "NV năng suất kém", dataIndex: "total", sorter: (a, b) => a.total - b.total }];
        mainChartData = provinceSummary.map(item => ({ name: item.province, value: item.total }));
        chartTitle = "🚨 Nhân Viên Năng Suất Kém (Toàn quốc)";
    }
    // Cấp 2: Đã chọn Tỉnh - Hiển thị tổng số FT năng suất kém theo từng Nhóm WO của tỉnh đó
    else if (province !== "ALL" && group === "ALL") {
        tableData = groupSummary;
        columns = [{ title: "WO Group", dataIndex: "wo_group", render: v => <Tag color="purple">{v}</Tag> }, { title: "NV năng suất kém", dataIndex: "total", sorter: (a, b) => a.total - b.total }];
        mainChartData = groupSummary.map(item => ({ name: item.wo_group, value: item.total }));
        chartTitle = `🚨 ${province} - Năng suất theo nhóm`;
    }
    // Cấp 3: Đã chọn Tỉnh & Nhóm WO - Hiển thị danh sách nhân viên chi tiết
    else {
        tableData = employeeTable;
        columns = [
            { title: "Nhân viên", dataIndex: "employee", width: 160, fixed: "left" },
            { title: "Tỉnh", dataIndex: "province", width: 90, render: v => <Tag color="blue">{v}</Tag> },
            { title: "TB WO/ngày", dataIndex: "avg", align: "center", render: value => <Tag color={value < 2 ? "red" : value < 4 ? "orange" : "gold"}>{value}</Tag> },
            { title: "Tổng WO (5 ngày)", dataIndex: "totalWO", align: "center", render: v => <Tag color="red">{v}</Tag> }
        ];
        mainChartData = employeeTable.map(item => ({ name: item.employee, value: item.avg }));
        chartTitle = `🚨 ${province} - ${group} - Danh sách chi tiết`;
    }

    return (
        <Card
            bordered={false}
            // Thiết kế Card với màu nền xanh nhạt, bo góc lớn và bóng đổ sâu tạo cảm giác nổi bật
            style={{ borderRadius: 18, background: "#e1f4fa", boxShadow: "0 12px 32px rgba(0,0,0,.15)", overflow: "hidden" }}
            bodyStyle={{ padding: screens.xs ? 16 : 24 }}
        >
            {/* PHẦN ĐẦU CARD: TIÊU ĐỀ VÀ THANH CÔNG CỤ (NÚT & DROPDOWNS) */}
            <div style={{ display: "flex", flexDirection: screens.lg ? "row" : "column", justifyContent: "space-between", alignItems: screens.lg ? "center" : "flex-start", gap: 16, marginBottom: 24 }}>
                <div style={{ fontSize: screens.xs ? 18 : 22, fontWeight: 700, color: "#0f172a" }}>
                    {chartTitle}
                </div>

                <div style={{ display: "flex", flexDirection: screens.xs ? "column" : "row", gap: 12, width: screens.lg ? "auto" : "100%", alignItems: "center" }}>
                    {/* Nút bấm để mở Modal xem tất cả nhân viên */}
                    <Button
                        icon={<UserOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        // Sử dụng mã màu #34b1b3 cho nút chính
                        style={{ background: "#34b1b3", color: "#fff", border: "none", borderRadius: 8, height: screens.xs ? 32 : 40, fontWeight: 600 }}
                    >
                        Show ALL FT
                    </Button>
                    {/* Dropdown chọn Tỉnh/Thành */}
                    <Select
                        value={province}
                        size={screens.xs ? "middle" : "large"}
                        style={{ width: screens.xs ? "100%" : 160, background: "#e1f4fa" }}
                        onChange={(value) => { setProvince(value); setGroup("ALL"); }}
                        options={provinces.map((p) => ({ label: p, value: p }))}
                    />
                    {/* Dropdown chọn Nhóm WO (tự động thay đổi theo tỉnh) */}
                    <Select
                        value={group}
                        size={screens.xs ? "middle" : "large"}
                        style={{ width: screens.xs ? "100%" : 180, background: "#e1f4fa" }}
                        onChange={setGroup}
                        options={groups.map((g) => ({ label: g, value: g }))}
                    />
                </div>
            </div>

            {/* CÁC THẺ KPI TRẠNG THÁI (STATISTIC CARDS) */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card size="small" bordered={false} style={{ background: "rgba(59, 130, 246, 0.1)", borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: "#475569", fontWeight: 500 }}>Tổng NV năng suất kém</span>} value={totalBadEmployees} valueStyle={{ color: "#2563eb", fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card size="small" bordered={false} style={{ background: "rgba(245, 158, 11, 0.1)", borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: "#475569", fontWeight: 500 }}>TB WO/ngày (Của nhóm kém)</span>} value={averageProductivity} precision={2} valueStyle={{ color: "#d97706", fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            {/* =========================================================
             * KHU VỰC CHÍNH: BIỂU ĐỒ VÀ BẢNG DỮ LIỆU NẰM CHUNG 1 HÀNG
             * =======================================================*/}
            <Row gutter={[24, 24]}>

                {/* CỘT TRÁI: BIỂU ĐỒ THANH NGANG */}
                <Col xs={24} lg={14}>
                    <div style={{ width: "100%", overflowX: "auto" }}>
                        <ResponsiveContainer width="100%" height={Math.max(screens.xs ? 300 : 400, mainChartData.length * (screens.xs ? 40 : 50))}>
                            <BarChart layout="vertical" data={mainChartData} margin={{ top: 10, right: 30, left: screens.xs ? -10 : 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#cbd5e1" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                                <YAxis type="category" dataKey="name" width={screens.xs ? 100 : 150} tick={{ fontSize: 11, fill: "#334155", fontWeight: 500 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={25}>
                                    <LabelList dataKey="value" position="right" fontSize={11} fontWeight={600} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* CỘT PHẢI: BẢNG DỮ LIỆU CHI TIẾT */}
                <Col xs={24} lg={10}>
                    <ConfigProvider theme={{ components: { Table: { headerBg: "#bae6fd", colorBgContainer: "#ffffff", borderRadius: 8 } } }}>
                        {/* Bỏ marginTop 24 ở đây vì đã dùng khoảng cách gutter của Row */}
                        <div style={{ borderRadius: 8, overflow: "hidden", height: "100%" }}>
                            <Table
                                rowKey="key"
                                columns={columns}
                                dataSource={tableData}
                                size="small"
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: "max-content" }}
                            />
                        </div>
                    </ConfigProvider>
                </Col>

            </Row>

            {/* =========================================================
             * MODAL: SHOW ALL FT (Hộp thoại hiển thị tất cả nhân viên)
             * =======================================================*/}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BarChartOutlined style={{ color: '#34b1b3' }} />
                        <span>Xếp hạng năng suất tất cả FT ({province === "ALL" ? "Toàn quốc" : province})</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={screens.xs ? "100%" : 1000}
                style={{ top: 20 }}
            >
                <div style={{ padding: "10px 0" }}>
                    <div style={{ marginBottom: 15 }}>
                        <Tag color="cyan">Nhóm: {group === "ALL" ? "Tất cả" : group}</Tag>
                        <Tag color="blue">Số lượng: {allFTModalData.length} nhân viên</Tag>
                    </div>

                    <div style={{ width: '100%', height: screens.xs ? 450 : 550, overflowX: 'auto' }}>
                        <ResponsiveContainer width={Math.max(800, allFTModalData.length * (screens.xs ? 60 : 80))} height="100%">
                            <BarChart data={allFTModalData} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="employee"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    tick={{ fontSize: 10, fill: "#475569", fontWeight: 500 }}
                                    height={100}
                                />
                                <YAxis tick={{ fontSize: 12 }} label={{ value: 'TB WO/Ngày', angle: -90, position: 'insideLeft', offset: 10 }} />
                                <Tooltip formatter={(value, name, props) => [`${value} WO/Ngày (Tổng: ${props.payload.totalWO})`, "TB Năng suất"]} />
                                <Legend payload={legendData} wrapperStyle={{ paddingTop: 20 }} />

                                <Bar dataKey="avg" name="TB WO/Ngày" radius={[6, 6, 0, 0]} barSize={screens.xs ? 25 : 40}>
                                    {allFTModalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getGroupColor(entry.primary_group)} />
                                    ))}

                                    <LabelList
                                        dataKey="avg"
                                        content={(props) => {
                                            const { x, y, width, value, index } = props;
                                            if (typeof x !== 'number' || typeof y !== 'number') return null;

                                            const totalWO = allFTModalData[index]?.totalWO || 0;

                                            return (
                                                <g>
                                                    <text
                                                        x={x + width / 2}
                                                        y={y - 20}
                                                        fill="#1e293b"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        style={{ fontSize: 11, fontWeight: 700 }}
                                                    >
                                                        Tổng: {totalWO}
                                                    </text>
                                                    <text
                                                        x={x + width / 2}
                                                        y={y - 8}
                                                        fill="#64748b"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        style={{ fontSize: 10, fontWeight: 500 }}
                                                    >
                                                        TB: {value}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export default UnderperformingHorizontalBarChart;