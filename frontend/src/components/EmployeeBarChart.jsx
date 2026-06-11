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

    return (

        <Card
            ref={chartRef}
            style={{
                marginTop: 0,
                borderRadius: fullscreen ? 0 : 16,
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
                    marginBottom: 20,
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >

                <div>

                    <div
                        style={{
                            fontSize:
                                screens.xs
                                    ? 16
                                    : 22,
                            fontWeight: 700,
                        }}
                    >
                        👨‍💻 WO Quá Hạn Tồn Các Nhóm
                    </div>

                    <div
                        style={{
                            color: "#fff",
                            marginTop: 4,
                        }}
                    >
                    </div>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                    }}
                >

                    <Select
                        value={province}
                        style={{
                            width: "100%",
                            maxWidth: 180,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                        }}

                        getPopupContainer={(trigger) =>
                            trigger.parentElement
                        }
                        onChange={(value) => {

                            setProvince(
                                value
                            );

                            setGroup(
                                "ALL"
                            );

                        }}
                    >

                        {provinces.map(p => (

                            <Select.Option
                                key={p}
                                value={p}
                            >
                                {p}
                            </Select.Option>

                        ))}

                    </Select>

                    <Select
                        value={group}
                        style={{
                            width: "100%",
                            maxWidth: 220,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                        }}
                        getPopupContainer={(trigger) =>
                            trigger.parentElement
                        }
                        onChange={
                            setGroup
                        }
                    >

                        {woGroups.map(g => (

                            <Select.Option
                                key={g}
                                value={g}
                            >
                                {g}
                            </Select.Option>

                        ))}

                    </Select>
                    <Button
                        type="primary"
                        icon={
                            fullscreen
                                ? <FullscreenExitOutlined/>
                                : <FullscreenOutlined/>
                        }
                        onClick={toggleFullscreen}
                    >
                        {
                            fullscreen
                                ? "Thu nhỏ"
                                : "Phóng to"
                        }
                    </Button>

                </div>

            </div>

            <div
                style={{
                    overflowX: "auto",
                }}
            >
                <div
                    style={{
                        minWidth:
                            Math.max(
                                chartData.length * 90,
                                800
                            ),
                        height:
                            fullscreen
                                ? window.innerHeight - 120
                                : screens.xs
                                    ? 320
                                    : 540,
                    }}
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 0,
                                bottom: 10,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="name"
                                angle={
                                    screens.xs
                                        ? -45
                                        : -90
                                }
                                textAnchor="end"
                                interval={0}
                                height={
                                    screens.xs
                                        ? 90
                                        : 70
                                }
                            />

                            <YAxis/>

                            <Tooltip/>


                            <Legend
                                verticalAlign="top"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{
                                    fontWeight: 600,
                                    paddingBottom: 20,
                                    fontSize:
                                        fullscreen
                                            ? 16
                                            : screens.xs
                                                ? 9
                                                : 11
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
                                    fontSize={
                                        fullscreen
                                            ? 16
                                            : screens.xs
                                                ? 9
                                                : 11
                                    }
                                    fontWeight={600}
                                /></Bar>

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
                                    fontSize={
                                        fullscreen
                                            ? 16
                                            : screens.xs
                                                ? 9
                                                : 11
                                    }
                                    fontWeight={600}
                                />
                                <LabelList
                                    dataKey="processingTotal"
                                    position="top"
                                    fill="#000000"
                                    fontSize={
                                        fullscreen
                                            ? 20
                                            : 13
                                    }
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
                                    fontSize={
                                        fullscreen
                                            ? 16
                                            : screens.xs
                                                ? 9
                                                : 11
                                    }
                                    fontWeight={600}
                                />
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    fill="#000000"
                                    fontSize={
                                        fullscreen
                                            ? 20
                                            : 13
                                    }
                                    fontWeight={700}
                                />
                            </Bar>

                        </BarChart>

                    </ResponsiveContainer>
                </div>
            </div>

        </Card>

);

}

export default EmployeeBarChart;