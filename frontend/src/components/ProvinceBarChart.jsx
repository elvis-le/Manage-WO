import {Card, Select} from "antd";
import {useMemo, useState} from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

import {
    FundProjectionScreenOutlined,
    FilterOutlined,
} from "@ant-design/icons";

function ProvinceBarChart({rows}) {

    const provinces = useMemo(
        () => [
            ...new Set(
                rows
                    .map(x => x.province)
                    .filter(Boolean)
            ),
        ].sort(),
        [rows]
    );

    const [
        selectedProvinces,
        setSelectedProvinces,
    ] = useState([]);

    const chartData = useMemo(() => {

        const provinceList =
            selectedProvinces.length > 0
                ? selectedProvinces
                : provinces;

        return provinceList.map(
            province => {

                const provinceRows =
                    rows.filter(
                        x =>
                            x.province ===
                            province
                    );

                return {

                    province,

                    completed:
                    provinceRows.filter(
                        x =>
                            x.status ===
                            "completed"
                    ).length,

                    pending:
                    provinceRows.filter(
                        x =>
                            x.status ===
                            "in_progress"
                    ).length,

                    overdue:
                    provinceRows.filter(
                        x =>
                            x.status ===
                            "overdue"
                    ).length,

                    total:
                    provinceRows.length,

                };

            }
        ).sort(
            (a, b) => b.total - a.total
        );

    }, [
        rows,
        provinces,
        selectedProvinces,
    ]);

    return (

        <Card
            bordered={false}
            style={{
                marginTop: 24,
                borderRadius: 18,
                background: "#0f172a",
                border: "1px solid #1e293b",
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.35)",
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
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
                            border:
                                "1px solid #1e293b",
                            background: "#020617",
                            color: "#60a5fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FundProjectionScreenOutlined/>
                    </div>

                    <div>
                        <div
                            style={{
                                color: "#fff",
                                fontSize: 22,
                                fontWeight: 700,
                            }}
                        >
                            Hiệu suất xử lý theo Tỉnh
                        </div>

                        <div
                            style={{
                                color: "#64748b",
                                fontSize: 13,
                            }}
                        >
                            Sắp xếp theo thứ tự tổng sản lượng Work Order
                        </div>
                    </div>
                </div>

                <Select
                    suffixIcon={
                        <FilterOutlined
                            style={{
                                color: "#94a3b8",
                            }}
                        />
                    }
                    mode="multiple"
                    allowClear
                    size="large"
                    placeholder="Tất cả tỉnh"
                    value={
                        selectedProvinces
                    }
                    onChange={
                        setSelectedProvinces
                    }
                    maxTagCount="responsive"
                    style={{
                        width: 320,
        background: "#0f172a",
        color: "#fff",
                    }}
                    popupMatchSelectWidth={false}
                >

                    {
                        provinces.map(
                            p => (

                                <Select.Option
                                    key={p}
                                    value={p}
                                >
                                    {p}
                                </Select.Option>

                            )
                        )
                    }

                </Select>

            </div>

            <ResponsiveContainer
                width="100%"
                height={450}
            >

                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 10,
                    }}
                >

                    <CartesianGrid
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="province"
                        tick={{
                            fill: "#94a3b8",
                            fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        tick={{
                            fill: "#64748b",
                            fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                    />

                    <Tooltip
                        contentStyle={{
                            background: "#111827",
                            border: "1px solid #1e293b",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                        labelStyle={{
                            color: "#fff",
                        }}
                        itemStyle={{
                            color: "#fff",
                        }}
                    />

                    <Legend
                        verticalAlign="top"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{
                            color: "#fff",
                            fontWeight: 600,
                            paddingBottom: 20,
                        }}
                    />

                    <Bar
                        dataKey="completed"
                        stackId="a"
                        name="Đã hoàn thành"
                        fill="#1fc48d"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="pending"
                        stackId="a"
                        name="Đang xử lý"
                        fill="#4285f4"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="overdue"
                        stackId="a"
                        name="Quá hạn trễ"
                        fill="#ff4d57"
                        radius={[4, 4, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </Card>

    );

}

export default ProvinceBarChart;