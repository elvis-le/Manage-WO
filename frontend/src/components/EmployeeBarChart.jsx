import {
    useMemo,
    useState,
    useRef,
    useEffect,
} from "react";

import {
    FullscreenOutlined,
    FullscreenExitOutlined,
} from "@ant-design/icons";

import {
    Button,
    Card, Grid,
    Select,
} from "antd";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid, LabelList,
} from "recharts";

function EmployeeBarChart({
                              rows,
                          }) {

    const { useBreakpoint } = Grid;

const screens = useBreakpoint();


    const [group, setGroup] =
        useState("ALL");

    const chartRef = useRef(null);

    const [fullscreen, setFullscreen] =
        useState(false);


    const provinces = useMemo(
        () => [
            "ALL",
            ...new Set(
                rows.map(
                    x => x.province
                )
            ),
        ],
        [rows]
    );

    const [province, setProvince] =
        useState("ALL");

    const woGroups =
        useMemo(() => {

            const filtered =
                province === "ALL"
                    ? rows
                    : rows.filter(
                        x =>
                            x.province ===
                            province
                    );

            return [
                "ALL",
                ...new Set(
                    filtered.map(
                        x => x.wo_group
                    )
                ),
            ];

        }, [
            rows,
            province,
        ]);


    const filteredRows =
        rows.filter(row => {

            const provinceMatch =
                province === "ALL"
                    ? true
                    : row.province === province;

            const groupMatch =
                group === "ALL"
                    ? true
                    : row.wo_group === group;

            return (
                provinceMatch &&
                groupMatch
            );

        });

    const chartData =
        useMemo(() => {

            const result = {};

            if (group === "ALL") {

                filteredRows.forEach(row => {

                    const key =
                        row.wo_group;

                    if (!result[key]) {

                        result[key] = {
                            name: key,
                            completed: 0,
                            processing: 0,
                            overdue: 0,
                            total: 0,
                        };

                    }
                    result[key].total++;

                    if (row.completed) {
                        result[key].completed++;
                    }

                    if (row.pending && !row.overdue) {
                        result[key].processing++;
                    }

                    if (row.overdue && !row.completed) {
                        result[key].overdue++;
                    }

                });

            } else {

                filteredRows.forEach(row => {

    const key =
        row.district ||
        "Chưa xác định";

    if (!result[key]) {

        result[key] = {
            name: key,
            completed: 0,
            processing: 0,
            overdue: 0,
            total: 0,
        };

    }

    result[key].total++;

    if (row.completed) {
        result[key].completed++;
    }

    if (
        row.pending &&
        !row.overdue
    ) {
        result[key].processing++;
    }

    if (
        row.overdue &&
        !row.completed
    ) {
        result[key].overdue++;
    }

});

            }

            return Object.values(result).map(item => ({
                ...item,

                processingTotal:
                    item.overdue === 0
                        ? item.total
                        : null,

                overdueTotal:
                    item.overdue > 0
                        ? item.total
                        : null,
            }));

        }, [
            filteredRows,
            group,
        ]);

    const toggleFullscreen = async () => {

        try {

            if (!document.fullscreenElement) {

                await chartRef.current?.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (err) {

            console.error(err);

        }

    };

    useEffect(() => {

        const handleFullscreenChange = () => {

            setFullscreen(
                !!document.fullscreenElement
            );

        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );

    }, []);

    // --- Các phần import và logic state/calculations ở trên giữ nguyên ---

    return (
        <Card
            ref={chartRef}
            bordered={false}
            style={{
                marginTop: 0,
                borderRadius: fullscreen ? 0 : 18,
                background: "#e1f4fa",
                boxShadow: "0 12px 32px rgba(0,0,0,.15)",
                overflow: "hidden", // Chống tràn viền khi bo góc
            }}
            bodyStyle={{ padding: screens.xs ? 16 : 24 }}
        >
            {/* PHẦN HEADER: TITLE VÀ BỘ LỌC */}
            <div
                style={{
                    display: "flex",
                    flexDirection: screens.lg ? "row" : "column", // Chuyển dọc trên màn hình nhỏ
                    justifyContent: "space-between",
                    alignItems: screens.lg ? "center" : "flex-start",
                    marginBottom: 24,
                    gap: 16
                }}
            >
                {/* Title Section */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            fontSize: screens.xs ? 18 : 22,
                            fontWeight: 700,
                            color: "#0f172a"
                        }}
                    >
                        👨‍💻 WO Quá Hạn Tồn Các Nhóm
                    </div>
                </div>

                {/* Filter & Action Section */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: screens.xs ? "column" : "row",
                        flexWrap: "wrap",
                        gap: 12,
                        width: screens.lg ? "auto" : "100%", // Full width trên mobile
                        alignItems: screens.xs ? "stretch" : "center"
                    }}
                >
                    <Select
                        value={province}
                        size={screens.xs ? "middle" : "large"}
                        style={{
                            flex: screens.xs ? "1 1 100%" : "none",
                            width: screens.xs ? "100%" : 160,
                            background: "#e1f4fa"
                        }}
                        getPopupContainer={(trigger) => trigger.parentElement}
                        onChange={(value) => {
                            setProvince(value);
                            setGroup("ALL");
                        }}
                    >
                        {provinces.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                    </Select>

                    <Select
                        value={group}
                        size={screens.xs ? "middle" : "large"}
                        style={{
                            flex: screens.xs ? "1 1 100%" : "none",
                            width: screens.xs ? "100%" : 160,
                            background: "#e1f4fa"
                        }}
                        getPopupContainer={(trigger) => trigger.parentElement}
                        onChange={setGroup}
                    >
                        {woGroups.map(g => <Select.Option key={g} value={g}>{g}</Select.Option>)}
                    </Select>

                    <Button
                        type="primary"
                        size={screens.xs ? "middle" : "large"}
                        icon={fullscreen ? <FullscreenExitOutlined/> : <FullscreenOutlined/>}
                        onClick={toggleFullscreen}
                        style={{ flex: screens.xs ? "1 1 100%" : "none" }} // Nút kéo dài 100% trên mobile
                    >
                        {fullscreen ? "Thu nhỏ" : "Phóng to"}
                    </Button>
                </div>
            </div>

            {/* PHẦN BIỂU ĐỒ */}
            <div style={{ width: '100%', overflowX: "auto" }}>
                <ResponsiveContainer
                    // Tự động dãn chiều ngang nếu data nhiều và đang ở màn hình điện thoại
                    width={screens.xs && chartData.length > 6 ? chartData.length * 55 : "100%"}
                    height={fullscreen ? window.innerHeight - 120 : (screens.xs ? 400 : 500)}
                >
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: screens.xs ? 0 : 20,
                            left: screens.xs ? -20 : 10,
                            bottom: 20
                        }}
                    >
                        <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" vertical={false}/>

                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={90}
                            interval={screens.xs ? "preserveStartEnd" : 0} // Mobile tự động ẩn bớt text cho đỡ rối
                            tick={{ fontSize: screens.xs ? 10 : 12, fill: "#64748b", fontWeight: 500 }}
                            tickLine={false}
                            axisLine={{ stroke: "#94a3b8" }}
                        />

                        <YAxis
                            tick={{ fontSize: screens.xs ? 10 : 12, fill: "#64748b" }}
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
                            barSize={screens.xs ? 22 : 35} // Bo hẹp cột trên mobile
                        >
                            <LabelList
                                dataKey="completed"
                                position="center"
                                fill="#ffffff"
                                fontSize={screens.xs ? 0 : 11} // Ẩn nhãn nội bộ trên mobile tránh rối mắt
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
                                fontSize={screens.xs ? 11 : 13}
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
                            radius={[4, 4, 0, 0]}
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

export default EmployeeBarChart;