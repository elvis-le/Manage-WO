import { useMemo, useState } from "react";
import {
    Card,
    Table,
    Select,
    Typography,
    Tag,
    Statistic,
    Row,
    Col,
    ConfigProvider,
    Grid,
    Button,
    Modal,
} from "antd";
import { UserOutlined, BarChartOutlined } from "@ant-design/icons";
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

const FIXED_GROUP_COLORS = {
    'CĐBR': '#ef4444',
    'Vận hành': '#3b82f6',
    'Ứng cứu thông tin': '#f97316',
    'Bảo dưỡng': '#22c55e',
    'Lắp đặt': '#eab308',
    'Khác': '#8b5cf6',
};

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
 * MAIN COMPONENT
 * Thay prop `rows` thành `apiData` (dữ liệu trả về từ API Backend)
 * =======================================================*/
const UnderperformingHorizontalBarChart = ({ apiData = [] }) => {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const [province, setProvince] = useState("ALL");
    const [group, setGroup] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Lấy danh sách Tỉnh từ apiData
    const provinces = useMemo(() => [
        "ALL",
        ...new Set(apiData.map(r => r.province).filter(Boolean)),
    ], [apiData]);

    // Lấy danh sách Nhóm WO theo Tỉnh
    const groups = useMemo(() => {
        let filteredRows = apiData;
        if (province !== "ALL") {
            filteredRows = apiData.filter(r => r.province === province);
        }
        // Vì Backend gộp thành mảng groups: [group], ta lấy phần tử đầu tiên
        return ["ALL", ...new Set(filteredRows.map(r => r.primary_group).filter(Boolean))];
    }, [apiData, province]);

    // Dữ liệu cho Modal "Show ALL FT"
    const allFTModalData = useMemo(() => {
        return apiData.filter(item => {
            if (province !== "ALL" && item.province !== province) return false;
            if (group !== "ALL" && !item.groups.includes(group)) return false;
            return true;
        });
    }, [apiData, province, group]);

    const legendData = useMemo(() => {
        const uniqueGroups = [...new Set(allFTModalData.map(item => item.primary_group))];
        return uniqueGroups.map(groupName => ({
            value: groupName,
            color: getGroupColor(groupName)
        }));
    }, [allFTModalData]);

    const provinceSummary = useMemo(() => {
        const map = {};
        apiData.forEach(emp => {
            map[emp.province] = (map[emp.province] || 0) + 1;
        });
        return Object.entries(map).map(([province, total]) => ({
            key: province, province, total,
        })).sort((a, b) => b.total - a.total);
    }, [apiData]);

    const groupSummary = useMemo(() => {
        if (province === "ALL") return [];
        const map = {};
        apiData.filter(emp => emp.province === province).forEach(emp => {
            emp.groups.forEach(groupName => {
                if (!map[groupName]) map[groupName] = new Set();
                map[groupName].add(emp.employee);
            });
        });
        return Object.entries(map).map(([wo_group, employees]) => ({
            key: wo_group, wo_group, total: employees.size,
        })).sort((a, b) => b.total - a.total);
    }, [apiData, province]);

    const employeeTable = useMemo(() => allFTModalData, [allFTModalData]);

    console.log("employeeTable: " + employeeTable);

    const totalBadEmployees = employeeTable.length;
    const averageProductivity = totalBadEmployees > 0
        ? employeeTable.reduce((sum, emp) => sum + emp.avg, 0) / totalBadEmployees
        : 0;

    let tableData = [];
    let columns = [];
    let chartTitle = "";
    let mainChartData = [];

    if (province === "ALL" && group === "ALL") {
        tableData = provinceSummary;
        columns = [
            { title: "Tỉnh", dataIndex: "province", render: v => <Tag color="blue">{v}</Tag> },
            { title: "NV năng suất kém", dataIndex: "total", sorter: (a, b) => a.total - b.total }
        ];
        mainChartData = provinceSummary.map(item => ({ name: item.province, value: item.total }));
        chartTitle = "🚨 Nhân Viên Năng Suất Kém (Toàn quốc)";
    } else if (province !== "ALL" && group === "ALL") {
        tableData = groupSummary;
        columns = [
            { title: "WO Group", dataIndex: "wo_group", render: v => <Tag color="purple">{v}</Tag> },
            { title: "NV năng suất kém", dataIndex: "total", sorter: (a, b) => a.total - b.total }
        ];
        mainChartData = groupSummary.map(item => ({ name: item.wo_group, value: item.total }));
        chartTitle = `🚨 ${province} - Năng suất theo nhóm`;
    } else {
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
            style={{ borderRadius: 18, background: "#e1f4fa", boxShadow: "0 12px 32px rgba(0,0,0,.15)", overflow: "hidden" }}
            bodyStyle={{ padding: screens.xs ? 16 : 24 }}
        >
            <div style={{ display: "flex", flexDirection: screens.lg ? "row" : "column", justifyContent: "space-between", alignItems: screens.lg ? "center" : "flex-start", gap: 16, marginBottom: 24 }}>
                <div style={{ fontSize: screens.xs ? 18 : 22, fontWeight: 700, color: "#0f172a" }}>
                    {chartTitle}
                </div>

                <div style={{ display: "flex", flexDirection: screens.xs ? "column" : "row", gap: 12, width: screens.lg ? "auto" : "100%", alignItems: "center" }}>
                    <Button
                        icon={<UserOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        style={{ background: "#34b1b3", color: "#fff", border: "none", borderRadius: 8, height: screens.xs ? 32 : 40, fontWeight: 600 }}
                    >
                        Show ALL FT
                    </Button>
                    <Select
                        value={province}
                        size={screens.xs ? "middle" : "large"}
                        style={{ width: screens.xs ? "100%" : 160, background: "#e1f4fa" }}
                        onChange={(value) => { setProvince(value); setGroup("ALL"); }}
                        options={provinces.map((p) => ({ label: p, value: p }))}
                    />
                    <Select
                        value={group}
                        size={screens.xs ? "middle" : "large"}
                        style={{ width: screens.xs ? "100%" : 180, background: "#e1f4fa" }}
                        onChange={setGroup}
                        options={groups.map((g) => ({ label: g, value: g }))}
                    />
                </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card size="small" bordered={false} style={{ background: "rgba(59, 130, 246, 0.1)", borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: "#475569", fontWeight: 500 }}>Tổng NV năng suất kém</span>} value={totalBadEmployees} valueStyle={{ color: "#34b1b3", fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card size="small" bordered={false} style={{ background: "rgba(245, 158, 11, 0.1)", borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: "#475569", fontWeight: 500 }}>TB WO/ngày (Của nhóm kém)</span>} value={averageProductivity} precision={2} valueStyle={{ color: "#d97706", fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <div style={{ width: "100%", overflowX: "auto" }}>
                <ResponsiveContainer width="100%" height={Math.max(screens.xs ? 300 : 400, mainChartData.length * (screens.xs ? 40 : 50))}>
                    <BarChart layout="vertical" data={mainChartData} margin={{ top: 10, right: 30, left: screens.xs ? -10 : 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#cbd5e1" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis type="category" dataKey="name" width={screens.xs ? 100 : 150} tick={{ fontSize: 11, fill: "#334155", fontWeight: 500 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="value" fill="#34b1b3" radius={[0, 6, 6, 0]} barSize={25}>
                            <LabelList dataKey="value" position="right" fontSize={11} fontWeight={600} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <ConfigProvider theme={{ components: { Table: { headerBg: "#bae6fd", colorBgContainer: "#ffffff", borderRadius: 8 } } }}>
                <div style={{ marginTop: 24, borderRadius: 8, overflow: "hidden" }}>
                    <Table rowKey="key" columns={columns} dataSource={tableData} size="small" pagination={{ pageSize: 5 }} scroll={{ x: "max-content" }} />
                </div>
            </ConfigProvider>

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
                            <BarChart data={allFTModalData} margin={{ top: 40, right: 30, left: 0, bottom: 80 }}>
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
                                                    <text x={x + width / 2} y={y - 20} fill="#1e293b" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fontWeight: 700 }}>
                                                        Tổng: {totalWO}
                                                    </text>
                                                    <text x={x + width / 2} y={y - 8} fill="#64748b" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fontWeight: 500 }}>
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
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 10 }}>
                        * Số trên đầu cột thể hiện "Tổng WO (5 ngày)" và "TB WO/ngày". <br />
                        * Màu sắc cột đại diện cho Nhóm WO chính của FT. <br />
                        * Kéo ngang biểu đồ để xem thêm nhân viên nếu danh sách dài.
                    </p>
                </div>
            </Modal>
        </Card>
    );
};

export default UnderperformingHorizontalBarChart;