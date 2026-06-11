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
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.15)",
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 24,
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >

                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            color: "#ff4d4f",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <DollarOutlined/>
                    </div>

                    <div>

                        <div
                            style={{
                                fontSize: screens.xs ? 16 : 22,
                                fontWeight: 700,
                            }}
                        >
                            WO Quá Hạn & Tiền Phạt
                        </div>

                        <div
                            style={{
                                color: "#64748b",
                                fontSize: 13,
                            }}
                        >
                            Thống kê tiền phạt
                        </div>

                    </div>

                </div>

                <Space
                    wrap
                >
                    <Button
                        type={
                            viewType === "PROVINCE"
                                ? "primary"
                                : "default"
                        }
                        onClick={() => {

                            setViewType(
                                "PROVINCE"
                            );

                            setProvince(
                                "ALL"
                            );

                        }}
                    >
                        Tỉnh
                    </Button>

                    <Button
                        type={
                            viewType === "WO_GROUP"
                                ? "primary"
                                : "default"
                        }
                        onClick={() => {

                            setViewType(
                                "WO_GROUP"
                            );

                            setProvince(
                                "ALL"
                            );

                        }}
                    >
                        Nhóm WO
                    </Button>
                </Space>

                <Select
                    value={province}
                    onChange={setProvince}
                    style={{
                        width: "100%",
                        maxWidth: 250,
                    }}
                >
                    {provinces.map(
                        item => (
                            <Select.Option
                                key={item}
                                value={item}
                            >
                                {item}
                            </Select.Option>
                        )
                    )}
                </Select>

            </div>
            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <div
                    style={{
                        minWidth:
                            chartData.length * 80,
                        height:
                            screens.xs
                                ? 320
                                : 450,
                    }}
                >
                    <ResponsiveContainer
            width="100%"
            height="100%"
                    >

                        <ComposedChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 0,
                                left: 0,
                                bottom: 20,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{
                                    fontSize: 11,
                                }}
                            />

                            <YAxis
                                yAxisId="left"
                                allowDecimals={false}
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={formatMoney}
                            />

                            <Tooltip
                                formatter={(value, name) => {

                                    if (
                                        name.includes("Tiền phạt")
                                    ) {
                                        return [
                                            Number(value).toLocaleString("vi-VN") + " VND",
                                            name,
                                        ];
                                    }

                                    return [value, name];
                                }}
                            />

                            <Legend/>

                            <Bar
                                yAxisId="left"
                                dataKey="overdue_closed"
                                stackId="wo"
                                name="Quá hạn đã đóng"
                                fill="#faad14"
                            >
                                <LabelList
                                    dataKey="overdue_closed"
                                    position="center"
                                    fill="#ffffff"
                                    fontWeight={600}
                                />
                            </Bar>

                            <Bar
                                yAxisId="left"
                                dataKey="overdue_open"
                                stackId="wo"
                                name="Quá hạn chưa đóng"
                                fill="#ff4d4f"
                            >
                                <LabelList
                                    dataKey="overdue_open"
                                    position="center"
                                    fill="#ffffff"
                                    fontWeight={600}
                                />

                                <LabelList
                                    dataKey="total_overdue"
                                    position="top"
                                    fill="#000000"
                                    fontSize={13}
                                    fontWeight={700}
                                />
                            </Bar>


                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="penalty_open"
                                name="Tiền phạt quá hạn chưa đóng"
                                stroke="#52c41a"
                                strokeWidth={3}
                                dot={{r: 5}}
                            >
                                <LabelList
                                    dataKey="penalty_open"
                                    position="top"
                                    fill="#000000"
                                    fontSize={10}
                                    fontWeight={600}
                                    formatter={formatMoney}
                                />
                            </Line>

                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="penalty_closed"
                                name="Tiền phạt quá hạn đã đóng"
                                stroke="#1677ff"
                                strokeWidth={3}
                                dot={{r: 5}}
                            >
                                <LabelList
                                    dataKey="penalty_closed"
                                    position="top"
                                    fill="#000000"
                                    fontSize={10}
                                    fontWeight={600}
                                    formatter={formatMoney}
                                />
                            </Line>

                        </ComposedChart>

                    </ResponsiveContainer>
                </div>
            </div>

        </Card>

);

}

export default FineBarChart;