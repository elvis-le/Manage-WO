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
    LabelList,
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

    return provinceList
        .map(province => {

            const provinceRows =
                rows.filter(
                    x =>
                        x.province ===
                        province
                );

            const completed =
                provinceRows.filter(
                    x => x.completed
                ).length;

            const overdue =
                provinceRows.filter(
                    x => x.overdue &&
                        !x.completed
                ).length;

            const processing =
                provinceRows.filter(
                    x =>
                        x.pending &&
                        !x.overdue
                ).length;

            return {

                province,

                completed,

                processing,

                overdue,

                total:
                    provinceRows.length,

                processingTotal:
        overdue === 0
            ? provinceRows.length
            : null,

    overdueTotal:
        overdue > 0
            ? provinceRows.length
            : null,


            };

        })
        .sort(
            (a, b) =>
                b.total - a.total
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
                marginTop: 0,
                borderRadius: 18,
                background: "#e1f4fa",
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.15)",
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
                            color: "#7cb3f2",
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
                                fontSize: 22,
                                fontWeight: 700,
                            }}
                        >
                            Tổng mức tồn khu vực
                        </div>

                        <div
                            style={{
                                color: "#64748b",
                                fontSize: 13,
                            }}
                        >
                            Sắp xếp thứ tự theo tổng Work Order
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
                        width: 300,
                        background: "#e1f4fa",
                        border: "1px solid #18bdf0"
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
                    >
                        <LabelList
                            dataKey="completed"
                            position="center"
                            fill="#000000"
                            fontSize={11}
                            fontWeight={600}
                        />
                    </Bar>

                    <Bar
                        dataKey="processing"
                        stackId="a"
                        name="Đang xử lý"
                        fill="#4285f4"
                        radius={[4, 4, 0, 0]}
                    >
                        <LabelList
                            dataKey="processing"
                            position="center"
                            fill="#000000"
                            fontSize={11}
                            fontWeight={600}
                        />
                        <LabelList
    dataKey="processingTotal"
    position="top"
    fill="#000000"
    fontSize={13}
    fontWeight={700}
/>
                    </Bar>


                    <Bar
                        dataKey="overdue"
                        stackId="a"
                        name="Quá hạn trễ"
                        fill="#ff4d57"
                        radius={[4, 4, 0, 0]}
                    >
                        <LabelList
                            dataKey="overdue"
                            position="center"
                            fill="#000000"
                            fontSize={11}
                            fontWeight={600}
                        />
                        <LabelList
        dataKey="total"
        position="top"
        fill="#000000"
        fontSize={13}
        fontWeight={700}
    />
                    </Bar>

                </BarChart>

            </ResponsiveContainer>

        </Card>

    );

}

export default ProvinceBarChart;