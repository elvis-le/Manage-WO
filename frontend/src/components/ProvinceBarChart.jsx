import {Card, Grid, Select} from "antd";
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

    const { useBreakpoint } = Grid;
const screens = useBreakpoint();

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
                boxShadow: "0 12px 32px rgba(0,0,0,.15)",
                overflow: "hidden" // Đảm bảo content không tràn ra ngoài viền bo góc
            }}
        >
            {/* PHẦN HEADER: TITLE VÀ BỘ LỌC */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: screens.sm ? "center" : "flex-start", // Mobile thì căn trên, PC căn giữa
                    flexDirection: screens.sm ? "row" : "column", // Mobile cho bộ lọc rớt xuống hàng dọc
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* Title Section */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            width: screens.xs ? 32 : 36,
                            height: screens.xs ? 32 : 36,
                            borderRadius: 8,
                            color: "#7cb3f2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#cce5ff" // Thêm chút nền cho icon nổi bật
                        }}
                    >
                        <FundProjectionScreenOutlined style={{ fontSize: screens.xs ? 18 : 20 }}/>
                    </div>

                    <div>
                        <div style={{ fontSize: screens.xs ? 18 : 22, fontWeight: 700, color: "#0f172a" }}>
                            Tổng Tồn Mức Khu Vực/Tỉnh
                        </div>
                        <div style={{ color: "#64748b", fontSize: screens.xs ? 12 : 13 }}>
                            Sắp xếp thứ tự theo tổng Work Order
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <Select
                    suffixIcon={<FilterOutlined style={{ color: "#94a3b8" }} />}
                    mode="multiple"
                    allowClear
                    size={screens.xs ? "middle" : "large"} // Nút nhỏ hơn một chút trên mobile
                    placeholder="Tất cả tỉnh"
                    value={selectedProvinces}
                    onChange={setSelectedProvinces}
                    maxTagCount="responsive"
                    style={{
                        width: "100%",
                        maxWidth: screens.sm ? 300 : "100%", // Full width trên mobile, giới hạn trên PC
                        background: "#e1f4fa",
                    }}
                    popupMatchSelectWidth={false}
                >
                    {provinces.map((p) => (
                        <Select.Option key={p} value={p}>
                            {p}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* PHẦN BIỂU ĐỒ */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
                {/* Dùng div bọc ngoài để dự phòng trường hợp có quá nhiều tỉnh trên mobile */}
                <ResponsiveContainer
                    width={screens.xs && chartData.length > 10 ? chartData.length * 40 : "100%"} // Tự động kéo dài width nếu quá nhiều data trên mobile để scroll ngang
                    height={screens.xs ? 350 : 450}
                >
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: screens.xs ? 0 : 20, left: screens.xs ? -20 : 10, bottom: 20 }}
                    >
                        <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" vertical={false} />

                        <XAxis
                            dataKey="province"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={screens.xs ? "preserveStartEnd" : 0} // Mobile: Ẩn bớt text trục X nếu quá chật
                            tick={{ fill: "#64748b", fontSize: screens.xs ? 10 : 12, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={{ stroke: "#94a3b8" }}
                        />

                        <YAxis
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
                        />

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

                        {/* Bar: Đã hoàn thành */}
                        <Bar
                            dataKey="completed"
                            stackId="a"
                            name="Đã hoàn thành"
                            fill="#1fc48d"
                            radius={[0, 0, 0, 0]}
                            barSize={screens.xs ? 20 : 35} // Chỉnh độ rộng cột cho mobile
                        >
                            <LabelList
                                dataKey="completed"
                                position="center"
                                fill="#ffffff"
                                fontSize={screens.xs ? 0 : 11} // Ẩn label bên trong cột trên mobile để tránh tràn text
                                fontWeight={600}
                            />
                        </Bar>

                        {/* Bar: Đang xử lý */}
                        <Bar
                            dataKey="processing"
                            stackId="a"
                            name="Đang xử lý"
                            fill="#3b82f6"
                            radius={[0, 0, 0, 0]}
                        >
                            <LabelList
                                dataKey="processing"
                                position="center"
                                fill="#ffffff"
                                fontSize={screens.xs ? 0 : 11}
                                fontWeight={600}
                            />
                            <LabelList
                                dataKey="processingTotal"
                                position="top"
                                fill="#334155"
                                fontSize={screens.xs ? 11 : 13} // Tổng số hiện trên cùng nên giữ lại trên mobile
                                fontWeight={700}
                                offset={10}
                            />
                        </Bar>

                        {/* Bar: Quá hạn trễ */}
                        <Bar
                            dataKey="overdue"
                            stackId="a"
                            name="Quá hạn trễ"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]} // Bo góc ở Bar trên cùng
                        >
                            <LabelList
                                dataKey="overdue"
                                position="center"
                                fill="#ffffff"
                                fontSize={screens.xs ? 0 : 11}
                                fontWeight={600}
                            />
                            <LabelList
                                dataKey="total"
                                position="top"
                                fill="#334155"
                                fontSize={screens.xs ? 11 : 13}
                                fontWeight={700}
                                offset={10}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

}

export default ProvinceBarChart;