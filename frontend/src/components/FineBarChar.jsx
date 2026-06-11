import {
    Button,
    Card, Grid,
    Select, Space,
} from "antd";

import {
    DollarOutlined,
    FilterOutlined,
} from "@ant-design/icons";

import {
    useMemo,
    useState,
} from "react";

import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LabelList,
} from "recharts";

function FineBarChart({
                          rows,
                      }) {

    const { useBreakpoint } = Grid;

const screens = useBreakpoint();

    const [viewType, setViewType] =
        useState("PROVINCE");

    const provinces = useMemo(
        () => [
            "ALL",
            ...new Set(
                rows
                    .map(
                        x => x.province
                    )
                    .filter(Boolean)
            ),
        ],
        [rows]
    );

    const [
        province,
        setProvince,
    ] = useState("ALL");

    const dropdownOptions =
        useMemo(() => {

            if (
                viewType ===
                "PROVINCE"
            ) {

                return [
                    "ALL",
                    ...new Set(
                        rows.map(
                            x =>
                                x.province
                        )
                    ),
                ];

            }

            return [
                "ALL",
                ...new Set(
                    rows.map(
                        x =>
                            x.wo_group
                    )
                ),
            ];

        }, [
            rows,
            viewType,
        ]);

    const formatMoney = (value) => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }

    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }

    return value;
};

    const chartData =
        useMemo(() => {

            const map = {};

            if (
                viewType ===
                "PROVINCE"
            ) {

                rows.forEach(row => {

                    const key =
                        province ===
                        "ALL"
                            ? row.province
                            : province;

                    if (
                        province !==
                        "ALL" &&
                        row.province !==
                        province
                    ) {
                        return;
                    }

                    if (
                        !map[key]
                    ) {

                        map[key] = {
                            name: key,

                            overdue_open: 0,
                            overdue_closed: 0,

                            penalty_open: 0,
                            penalty_closed: 0,

                            total_overdue: 0,
                        };

                    }

                    if (row.overdue) {


                        if (!row.completed) {

                            map[key].overdue_open++;

                            map[key].penalty_open +=
                                Number(row.penalty || 0);

                        } else {

                            map[key].overdue_closed++;

                            map[key].penalty_closed +=
                                Number(row.penalty || 0);

                        }

                    }

                });

            } else {

                const filteredRows =
                    province === "ALL"
                        ? rows
                        : rows.filter(
                            x =>
                                x.province ===
                                province
                        );

                filteredRows.forEach(row => {

                    const key =
                        row.wo_group;

                    if (!map[key]) {

                        map[key] = {
                            name: key,

                            overdue_open: 0,
                            overdue_closed: 0,

                            penalty_open: 0,
                            penalty_closed: 0,

                            total_overdue: 0,
                        };

                    }

                    if (row.overdue) {


                        if (!row.completed) {

                            map[key].overdue_open++;

                            map[key].penalty_open +=
                                Number(row.penalty || 0);

                        } else {

                            map[key].overdue_closed++;

                            map[key].penalty_closed +=
                                Number(row.penalty || 0);

                        }

                    }

                });

            }

            return Object.values(map)
                .map(item => ({
                    ...item,
                    total_overdue:
                        item.overdue_open +
                        item.overdue_closed,
                }))
                .sort(
                    (a, b) =>
                        b.total_overdue -
                        a.total_overdue,
                );

        }, [
            rows,
            province,
            viewType,
        ]);

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 18,
                background: "#e1f4fa",
                boxShadow: "0 12px 32px rgba(0,0,0,.15)",
                overflow: "hidden"
            }}
            bodyStyle={{ padding: screens.xs ? 16 : 24 }}
        >
            {/* PHẦN HEADER: TITLE VÀ ACTIONS */}
            <div
                style={{
                    display: "flex",
                    flexDirection: screens.lg ? "row" : "column", // Màn hình lớn nằm ngang, nhỏ dọc
                    justifyContent: "space-between",
                    alignItems: screens.lg ? "center" : "flex-start",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* Title Section */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: screens.xs ? 32 : 36,
                            height: screens.xs ? 32 : 36,
                            borderRadius: 8,
                            color: "#ff4d4f",
                            background: "rgba(255, 77, 79, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <DollarOutlined style={{ fontSize: screens.xs ? 18 : 20 }} />
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: screens.xs ? 18 : 22,
                                fontWeight: 700,
                                color: "#0f172a"
                            }}
                        >
                            WO Quá Hạn & Tiền Phạt
                        </div>

                        <div
                            style={{
                                color: "#64748b",
                                fontSize: screens.xs ? 12 : 13,
                            }}
                        >
                            Thống kê số lượng và tiền phạt
                        </div>
                    </div>
                </div>

                {/* Filter & Buttons Section */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: screens.xs ? "column" : "row",
                        gap: 12,
                        width: screens.lg ? "auto" : "100%"
                    }}
                >
                    {/* Nút bấm chọn View */}
                    <div style={{ display: "flex", gap: 8, width: screens.xs ? "100%" : "auto" }}>
                        <Button
                            type={viewType === "PROVINCE" ? "primary" : "default"}
                            size={screens.xs ? "middle" : "large"}
                            style={{ flex: 1 }} // Chia đều 50/50 trên mobile
                            onClick={() => {
                                setViewType("PROVINCE");
                                setProvince("ALL");
                            }}
                        >
                            Tỉnh
                        </Button>

                        <Button
                            type={viewType === "WO_GROUP" ? "primary" : "default"}
                            size={screens.xs ? "middle" : "large"}
                            style={{ flex: 1 }} // Chia đều 50/50 trên mobile
                            onClick={() => {
                                setViewType("WO_GROUP");
                                setProvince("ALL");
                            }}
                        >
                            Nhóm WO
                        </Button>
                    </div>

                    {/* Dropdown chọn Tỉnh/Nhóm */}
                    <Select
                        value={province}
                        onChange={setProvince}
                        size={screens.xs ? "middle" : "large"}
                        style={{
                            width: screens.xs ? "100%" : 250,
                            background: "#e1f4fa",
                        }}
                    >
                        {dropdownOptions.map(item => (
                            <Select.Option key={item} value={item}>
                                {item}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* PHẦN BIỂU ĐỒ TRUNG TÂM */}
            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                {/* Tính toán chiều rộng động dựa trên lượng data để trải dài đồ thị nếu dùng mobile */}
                <ResponsiveContainer
                    width={screens.xs && chartData.length > 6 ? chartData.length * 60 : "100%"}
                    height={screens.xs ? 400 : 450}
                >
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: screens.xs ? -10 : 0,
                            left: screens.xs ? -20 : 0, // Kéo sát trục Y bên trái trên mobile
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" vertical={false} />

                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fill: "#64748b", fontSize: screens.xs ? 10 : 12, fontWeight: 500 }}
                            interval={screens.xs ? "preserveStartEnd" : 0} // Giảm tải nhãn trục X nếu chật
                            tickLine={false}
                            axisLine={{ stroke: "#94a3b8" }}
                        />

                        {/* Trục Y cho số lượng (Trái) */}
                        <YAxis
                            yAxisId="left"
                            allowDecimals={false}
                            tick={{ fill: "#64748b", fontSize: screens.xs ? 10 : 12 }}
                            tickLine={false}
                            axisLine={false}
                        />

                        {/* Trục Y cho Tiền (Phải) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={formatMoney}
                            tick={{ fill: "#64748b", fontSize: screens.xs ? 10 : 12 }}
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip
                            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                            contentStyle={{
                                background: "#1e293b",
                                border: "none",
                                borderRadius: 8,
                                color: "#f8fafc",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ color: "#e2e8f0", fontSize: 13 }}
                            labelStyle={{ color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}
                            formatter={(value, name) => {
                                if (name.includes("Tiền phạt")) {
                                    return [
                                        Number(value).toLocaleString("vi-VN") + " VND",
                                        name,
                                    ];
                                }
                                return [value, name];
                            }}
                        />

                        <Legend
                            wrapperStyle={{
                                fontSize: screens.xs ? 11 : 13,
                                fontWeight: 600,
                                color: "#334155",
                                paddingTop: 10
                            }}
                        />

                        {/* Cột: Quá hạn đã đóng */}
                        <Bar
                            yAxisId="left"
                            dataKey="overdue_closed"
                            stackId="wo"
                            name="Quá hạn đã đóng"
                            fill="#faad14"
                            barSize={screens.xs ? 20 : 35}
                        >
                            <LabelList
                                dataKey="overdue_closed"
                                position="center"
                                fill="#ffffff"
                                fontWeight={600}
                                fontSize={screens.xs ? 0 : 12} // Ẩn label trong cột nhỏ trên mobile
                            />
                        </Bar>

                        {/* Cột: Quá hạn chưa đóng */}
                        <Bar
                            yAxisId="left"
                            dataKey="overdue_open"
                            stackId="wo"
                            name="Quá hạn chưa đóng"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList
                                dataKey="overdue_open"
                                position="center"
                                fill="#ffffff"
                                fontWeight={600}
                                fontSize={screens.xs ? 0 : 12}
                            />
                            <LabelList
                                dataKey="total_overdue"
                                position="top"
                                fill="#334155"
                                fontSize={screens.xs ? 11 : 13}
                                fontWeight={700}
                                offset={10}
                            />
                        </Bar>

                        {/* Đường: Tiền phạt chưa đóng */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="penalty_open"
                            name="Tiền phạt quá hạn chưa đóng"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: screens.xs ? 3 : 5, fill: "#10b981" }}
                            activeDot={{ r: 6 }}
                        >
                            <LabelList
                                dataKey="penalty_open"
                                position="top"
                                fill="#0f172a"
                                fontSize={screens.xs ? 0 : 10} // Ẩn bớt text Line trên mobile tránh rối
                                fontWeight={600}
                                formatter={formatMoney}
                            />
                        </Line>

                        {/* Đường: Tiền phạt đã đóng */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="penalty_closed"
                            name="Tiền phạt quá hạn đã đóng"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: screens.xs ? 3 : 5, fill: "#3b82f6" }}
                            activeDot={{ r: 6 }}
                        >
                            <LabelList
                                dataKey="penalty_closed"
                                position="top"
                                fill="#0f172a"
                                fontSize={screens.xs ? 0 : 10}
                                fontWeight={600}
                                formatter={formatMoney}
                            />
                        </Line>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

}

export default FineBarChart;