import {
    Card,
    Table,
    Select,
    Input,
    Typography,
    ConfigProvider,
    Grid,
    Segmented,
    Radio,
    Row,
    Col
} from "antd";

import {
    SearchOutlined,
    TableOutlined,
    BarChartOutlined
} from "@ant-design/icons";

import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList // Thêm LabelList để hiển thị số trên cột
} from "recharts";

const { Title } = Typography;

const CHART_COLORS = [
    "#ff4d4f", "#faad14", "#52c41a", "#1677ff", "#722ed1",
    "#eb2f96", "#13c2c2", "#fa8c16", "#a0d911", "#2f54eb"
];

function PendingTable({ rows }) {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const [coordGroupFilter, setCoordGroupFilter] = useState("ALL");
    const [woGroupFilter, setWoGroupFilter] = useState("ALL");
    const [searchText, setSearchText] = useState("");

    const [viewMode, setViewMode] = useState("chart");
    const [chartMetric, setChartMetric] = useState("overdue");

    const coordGroups = useMemo(
        () => ["ALL", ...new Set(rows.map(x => x.coord_group).filter(Boolean))],
        [rows]
    );

    const dynamicWoGroups = useMemo(() => {
        const groups = [...new Set(rows.map(x => x.wo_group).filter(Boolean))];
        const priorityGroups = ["KSNN", "TD", "VO TUYEN"];
        return [
            ...priorityGroups.filter(g => groups.includes(g)),
            ...groups.filter(g => !priorityGroups.includes(g)),
        ];
    }, [rows]);

    const tableData = useMemo(() => {
        let result = rows.filter(row => row.is_dispatch_employee === true);

        if (coordGroupFilter !== "ALL") {
            result = result.filter(x => x.coord_group === coordGroupFilter);
        }

        if (woGroupFilter !== "ALL") {
            result = result.filter(x => x.wo_group === woGroupFilter);
        }

        if (searchText.trim()) {
            const keyword = searchText.toLowerCase().trim();
            result = result.filter(
                x => x.employee?.toLowerCase().includes(keyword) ||
                     x.province?.toLowerCase().includes(keyword) ||
                     x.coord_group?.toLowerCase().includes(keyword)
            );
        }

        const grouped = {};
        result.forEach(row => {
            const key = [row.province, row.employee, row.phone, row.district].join("|");

            if (!grouped[key]) {
                grouped[key] = {
                    key, province: row.province, coord_group: row.coord_group, employee: row.employee,
                    total_pending: 0, total_overdue: 0, overdue: {}, near_due: {},
                };
                dynamicWoGroups.forEach(group => {
                    grouped[key].overdue[group] = 0;
                    grouped[key].near_due[group] = 0;
                });
            }

            const group = row.wo_group;

            if (row.pending) {
                grouped[key].total_pending += 1;
                if (row.overdue) grouped[key].total_overdue += 1;
            }
            if (row.pending && row.overdue && group) grouped[key].overdue[group] = (grouped[key].overdue[group] || 0) + 1;
            if (row.pending && row.near_due && group) grouped[key].near_due[group] = (grouped[key].near_due[group] || 0) + 1;
        });

        return Object.values(grouped).map((item, index) => ({
            ...item, stt: index + 1,
        }));
    }, [rows, coordGroupFilter, woGroupFilter, searchText, dynamicWoGroups]);

    // Xử lý dữ liệu riêng cho Biểu đồ
    const chartData = useMemo(() => {
        const groupedForChart = {};

        tableData.forEach(row => {
            const xKey = coordGroupFilter === "ALL" ? row.coord_group : row.employee;
            if (!xKey) return;

            if (!groupedForChart[xKey]) {
                groupedForChart[xKey] = { name: xKey };
                dynamicWoGroups.forEach(g => groupedForChart[xKey][g] = 0);
            }

            dynamicWoGroups.forEach(g => {
                const value = chartMetric === "overdue" ? row.overdue[g] : row.near_due[g];
                groupedForChart[xKey][g] += (value || 0);
            });
        });

        // Tính TỔNG (total) để gán lên đỉnh cột và Sắp xếp
        return Object.values(groupedForChart).map(item => {
            item.total = dynamicWoGroups.reduce((sum, g) => sum + (item[g] || 0), 0);
            return item;
        }).sort((a, b) => b.total - a.total);
    }, [tableData, coordGroupFilter, chartMetric, dynamicWoGroups]);

    const columns = [
        { title: "STT", dataIndex: "stt", width: 50, align: "center", fixed: "left" },
        { title: "Tỉnh", dataIndex: "province", width: 80, align: "center" },
        { title: "Nhóm ĐP", dataIndex: "coord_group", width: 120, responsive: ['md'] },
        { title: "Nhân viên", dataIndex: "employee", width: 100, fixed: "left" },
        { title: "Tổng Tồn", dataIndex: "total_pending", width: 90, align: "center" },
        { title: "Tổng Quá Hạn", dataIndex: "total_overdue", width: 100, align: "center" },
        {
            title: "WO Quá Hạn",
            children: dynamicWoGroups.map(group => ({
                title: group, width: 70, align: "center",
                render: (_, row) => row.overdue[group] || 0,
            })),
        },
        {
            title: "WO Sắp Quá Hạn 1-3 Ngày",
            children: dynamicWoGroups.map(group => ({
                title: group, width: 70, align: "center",
                render: (_, row) => row.near_due[group] || 0,
            })),
        },
    ];

    return (
        <Card style={{ marginTop: 24, borderRadius: 16, overflow: "hidden", background: "#e1f4fa", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: screens.xs ? 12 : 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={screens.xs ? 5 : 4} style={{ margin: 0, color: "#0050b3" }}>
                        📋 THEO DÕI WO CHƯA HOÀN THÀNH
                    </Title>
                </Col>
                <Col style={{ marginTop: screens.xs ? 10 : 0 }}>
                    <Segmented
                        options={[
                            { value: 'table', icon: <TableOutlined />, label: screens.xs ? '' : 'Dạng Bảng' },
                            { value: 'chart', icon: <BarChartOutlined />, label: screens.xs ? '' : 'Biểu Đồ' }
                        ]}
                        value={viewMode}
                        onChange={setViewMode}
                    />
                </Col>
            </Row>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <Input
                    prefix={<SearchOutlined/>}
                    placeholder="Tìm kiếm..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ flex: screens.xs ? "1 1 100%" : "1 1 300px", maxWidth: screens.xs ? "100%" : 340, background: "#e1f4fa", border: "1px solid #18bdf0" }}
                />
                <Select
                    value={coordGroupFilter}
                    onChange={setCoordGroupFilter}
                    style={{ flex: screens.xs ? "1 1 100%" : "0 0 200px", fontFamily: "Arial", background: "#e1f4fa", border: "1px solid #18bdf0" }}
                    optionFilterProp="children"
                    popupMatchSelectWidth={true}
                >
                    {coordGroups.map(g => (
                        <Select.Option key={g} value={g}>{g}</Select.Option>
                    ))}
                </Select>
            </div>

            {viewMode === "table" ? (
                <ConfigProvider theme={{ components: { Table: { headerBg: "#e1f4fa", colorBgContainer: "#e1f4fa", rowHoverBg: "#e1f4fa", borderColor: "#18bdf0"} } }}>
                    <Table
                        rowKey="key" columns={columns} dataSource={tableData} bordered
                        size={screens.xs ? "small" : "middle"}
                        pagination={{ pageSize: screens.xs ? 5 : 12, showSizeChanger: !screens.xs, showTotal: total => `Tổng ${total} dòng` }}
                        scroll={{ x: screens.xs ? 600 : 1200 }}
                    />
                </ConfigProvider>
            ) : (
                <div style={{ background: "#e1f4fa", padding: "16px", borderRadius: "12px", border: "1px solid #18bdf0" }}>
                    <div style={{ marginBottom: 16, textAlign: "center" }}>
                        <Radio.Group value={chartMetric} onChange={e => setChartMetric(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="overdue">WO Quá hạn</Radio.Button>
                            <Radio.Button value="near_due">WO Sắp quá hạn 1-3 ngày</Radio.Button>
                        </Radio.Group>
                    </div>

                    {/* Tăng chiều cao lên 480 trên mobile để chữ không đè vào Legend */}
                    <div style={{ width: "100%", height: screens.xs ? 480 : 500 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {/* Chỉnh margin bottom lớn trên mobile để tạo khoảng trống cho trục X */}
                            <BarChart data={chartData} margin={{ top: 30, right: 10, left: screens.xs ? -15 : 0, bottom: screens.xs ? 70 : 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: screens.xs ? 10 : 12 }}
                                    interval={0}
                                    angle={screens.xs ? -45 : -30}
                                    textAnchor="end"
                                />
                                <YAxis tick={{ fontSize: 12 }} />

                                {/* Thêm wrapperStyle zIndex siêu cao để Tooltip luôn đè lên trước */}
                                <Tooltip
                                    wrapperStyle={{ zIndex: 1000 }}
                                    contentStyle={{ fontSize: screens.xs ? 11 : 13, borderRadius: 8 }}
                                />

                                {/* Dời Legend xuống thấp hơn một chút */}
                                <Legend
                            verticalAlign="top"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: screens.xs ? 11 : 13,
                                fontWeight: 600,
                                paddingBottom: 20,
                                color: "#334155"
                            }}
                        />

                                {dynamicWoGroups.map((group, index) => {
                                    const isLast = index === dynamicWoGroups.length - 1;
                                    return (
                                        <Bar
                                            key={group}
                                            dataKey={group}
                                            stackId="a"
                                            name={group}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        >
                                            {/* Số liệu bên TRONG cột (ẩn số 0 để đỡ rối mắt) */}
                                            <LabelList
                                                dataKey={group}
                                                position="inside"
                                                fill="#fff"
                                                fontSize={screens.xs ? 9 : 11}
                                                formatter={(val) => val > 0 ? val : ""}
                                            />

                                            {/* TỔNG bên TRÊN cột (chỉ gắn vào cấu phần xếp trên cùng của Stack) */}
                                            {isLast && (
                                                <LabelList
                                                    dataKey="total"
                                                    position="top"
                                                    fill="#000"
                                                    fontSize={screens.xs ? 10 : 12}
                                                    fontWeight="bold"
                                                />
                                            )}
                                        </Bar>
                                    );
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Card>
    );
}

export default PendingTable;