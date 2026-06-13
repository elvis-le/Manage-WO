import {
    Card,
    Grid,
    Select,
    Typography,
    Modal,
    Row,
    Col,
} from "antd";

import {
    useMemo,
    useState,
} from "react";

import {
    TrophyOutlined,
    FilterOutlined,
} from "@ant-design/icons";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    LabelList,
} from "recharts";

const { Title } = Typography;

function TopProvinceChart({ rows }) {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const [metric, setMetric] = useState("pending");
    const [province, setProvince] = useState("ALL");
    const [woGroup, setWoGroup] = useState("ALL");

    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const employeeChartData = useMemo(() => {
        if (!selectedEmployee) return [];

        const filtered = rows.filter(row =>
            row.employee === selectedEmployee &&
            row.province === province &&
            row.wo_group === woGroup &&
            (
                metric === "pending" ? row.pending :
                metric === "overdue" ? (row.overdue && !row.completed) : false
            )
        );

        const grouped = {};
        filtered.forEach(row => {
            const key = row.work_type || "Khác";
            grouped[key] = (grouped[key] || 0) + 1;
        });

        return Object.entries(grouped).map(([type, count]) => ({ type, count }));
    }, [rows, selectedEmployee, metric, province, woGroup]);

    const status = useMemo(() => {
        switch (metric) {
            case "pending": return "Tồn";
            case "overdue": return "Quá hạn";
            case "ontime": return "Tỷ lệ đúng hạn";
            default: return "";
        }
    }, [metric]);

    const provinces = useMemo(() => ["ALL", ...new Set(rows.map(x => x.province).filter(Boolean))], [rows]);

    const woGroups = useMemo(() => {
        const filtered = province === "ALL" ? rows : rows.filter(x => x.province === province);
        return ["ALL", ...new Set(filtered.map(x => x.wo_group).filter(Boolean))];
    }, [rows, province]);

    const chartData = useMemo(() => {
        let data = [];
        const map = {};

        if (province === "ALL" && woGroup === "ALL") {
            rows.forEach(row => {
                if (!map[row.province]) map[row.province] = [];
                map[row.province].push(row);
            });
        } else if (province !== "ALL" && woGroup === "ALL") {
            rows.filter(x => x.province === province).forEach(row => {
                if (!map[row.wo_group]) map[row.wo_group] = [];
                map[row.wo_group].push(row);
            });
        } else if (province === "ALL" && woGroup !== "ALL") {
            rows.filter(x => x.wo_group === woGroup).forEach(row => {
                const key = row.province || "Chưa xác định";
                if (!map[key]) map[key] = [];
                map[key].push(row);
            });
        } else {
            rows.filter(x => x.province === province && x.wo_group === woGroup).forEach(row => {
                const key = row.employee || "Chưa gán";
                if (!map[key]) map[key] = [];
                map[key].push(row);
            });
        }

        data = Object.entries(map).map(([key, items]) => ({
            name: key,
            value: calculateMetric(items, metric),
        }));

        return data.sort((a, b) => b.value - a.value).slice(0, 10);
    }, [rows, metric, province, woGroup]);

    let title = `Ranking Tỉnh ${status} Cao`;
    if (province !== "ALL" && woGroup === "ALL") title = `Ranking Nhóm WO - ${province} ${status} Cao`;
    if (province === "ALL" && woGroup !== "ALL") title = `Ranking Tỉnh - ${woGroup} ${status} Cao`;
    if (province !== "ALL" && woGroup !== "ALL") title = `Ranking NV - ${province} - ${woGroup}`;

    const COLORS = ["#1677ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2", "#eb2f96"];

    return (
        <>
            <Card
                bordered={false}
                style={{
                    marginTop: 0,
                    borderRadius: 18,
                    background: "#e1f4fa",
                    boxShadow: "0 12px 32px rgba(0,0,0,.15)"
                }}
                bodyStyle={{ padding: screens.xs ? 12 : 24 }}
            >
                {/* Header Title & Dropdowns sử dụng Ant Design Row/Col để responsive chuẩn xác */}
                <Row gutter={[12, 12]} justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col xs={24} lg={10}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ minWidth: 36, height: 36, borderRadius: 8, color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <TrophyOutlined style={{ fontSize: 20 }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: screens.xs ? 16 : 20, color: "#0050b3", lineHeight: 1.2 }}>{title}</div>
                                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Bảng xếp hạng hệ thống</div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} lg={14}>
                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={8}>
                                <Select
                                    suffixIcon={<FilterOutlined style={{ color: "#94a3b8" }} />}
                                    value={metric}
                                    onChange={setMetric}
                                    style={{ width: "100%", background: "#e1f4fa", border: "1px solid #18bdf0" }}
                                >
                                    <Select.Option value="pending">Tồn</Select.Option>
                                    <Select.Option value="overdue">Quá hạn</Select.Option>
                                    <Select.Option value="ontime">Tỷ lệ đúng hạn</Select.Option>
                                </Select>
                            </Col>
                            <Col xs={12} sm={8}>
                                <Select
                                    suffixIcon={<FilterOutlined style={{ color: "#94a3b8" }} />}
                                    value={province}
                                    style={{ width: "100%", background: "#e1f4fa", border: "1px solid #18bdf0" }}
                                    onChange={value => { setProvince(value); setWoGroup("ALL"); }}
                                >
                                    {provinces.map(p => <Select.Option key={p} value={p}>{p === "ALL" ? "Tất cả Tỉnh" : p}</Select.Option>)}
                                </Select>
                            </Col>
                            <Col xs={12} sm={8}>
                                <Select
                                    suffixIcon={<FilterOutlined style={{ color: "#94a3b8" }} />}
                                    value={woGroup}
                                    style={{ width: "100%", background: "#e1f4fa", border: "1px solid #18bdf0" }}
                                    onChange={setWoGroup}
                                >
                                    {woGroups.map(g => <Select.Option key={g} value={g}>{g === "ALL" ? "Tất cả Nhóm WO" : g}</Select.Option>)}
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Danh sách Ranking Items */}
                <div style={{ maxHeight: screens.xs ? 350 : 520, overflowY: "auto", paddingRight: 8 }}>
                    {chartData.map((item, index) => {
                        const maxValue = chartData[0]?.value || 1;
                        const percent = (item.value * 100) / maxValue;

                        let rankColor = "#64748b";
                        if (index === 0) rankColor = "#fbbf24";
                        if (index === 1) rankColor = "#94a3b8";
                        if (index === 2) rankColor = "#f97316";

                        // Check khả năng click (Chỉ khi đã chọn cụ thể Province và WoGroup mới bật Modal xem Nhân viên)
                        const isClickable = province !== "ALL" && woGroup !== "ALL";

                        return (
                            <div
                                key={item.name}
                                onClick={() => {
                                    if (isClickable) {
                                        setSelectedEmployee(item.name);
                                        setEmployeeModalOpen(true);
                                    }
                                }}
                                style={{
                                    background: "#e1f4fa",
                                    border: "1px solid #18bdf0",
                                    borderRadius: 14,
                                    padding: 14,
                                    marginBottom: 12,
                                    cursor: isClickable ? "pointer" : "default",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "70%" }}>
                                        <div style={{
                                            minWidth: 28, height: 28, borderRadius: "50%",
                                            border: `1px solid ${rankColor}`, color: rankColor,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 700, fontSize: 13,
                                        }}>
                                            {index + 1}
                                        </div>
                                        <span style={{
                                            fontWeight: 600, overflow: "hidden",
                                            textOverflow: "ellipsis", whiteSpace: "nowrap"
                                        }} title={item.name}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 600, textAlign: "right" }}>
                                        {item.value} <span style={{ color: "#64748b", marginLeft: 2, fontSize: 12 }}>{metric === "ontime" ? "%" : "WO"}</span>
                                    </div>
                                </div>

                                {/* Custom Progress Bar */}
                                <div style={{ height: 8, background: "#1e293b", borderRadius: 10, overflow: "hidden" }}>
                                    <div style={{ width: `${percent}%`, height: "100%", background: "#0ea5e9", borderRadius: 10 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Modal Chi Tiết Nhân Viên */}
            <Modal
                open={employeeModalOpen}
                footer={null}
                width={screens.xs ? "95%" : 800} // Cập nhật responsive width thay vì Fix cứng 1200
                style={{ top: screens.xs ? 20 : 50 }}
                onCancel={() => setEmployeeModalOpen(false)}
                title={`WO của ${selectedEmployee}`}
            >
                <ResponsiveContainer width="100%" height={Math.max(300, employeeChartData.length * (screens.xs ? 40 : 50))}>
                    <BarChart
                        data={employeeChartData}
                        layout="vertical"
                        margin={{ top: 20, right: screens.xs ? 30 : 50, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: screens.xs ? 10 : 12 }} />
                        <YAxis
                            type="category"
                            dataKey="type"
                            width={screens.xs ? 110 : 200} // Rút ngắn YAxis trên mobile
                            tick={{ fontSize: screens.xs ? 10 : 12 }}
                            interval={0}
                        />
                        <Tooltip />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                            {employeeChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="count" position="right" fontSize={screens.xs ? 10 : 12} fontWeight="bold" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Modal>
        </>
    );
}

function calculateMetric(items, metric) {
    if (metric === "pending") {
        return items.filter(x => x.pending).length;
    }
    if (metric === "overdue") {
        return items.filter(x => x.overdue && !x.completed).length;
    }
    if (metric === "ontime") {
        const completed = items.filter(x => x.completed);
        if (completed.length === 0) return 0;
        return Number((completed.filter(x => x.on_time).length * 100 / completed.length).toFixed(2));
    }
    return 0;
}

export default TopProvinceChart;