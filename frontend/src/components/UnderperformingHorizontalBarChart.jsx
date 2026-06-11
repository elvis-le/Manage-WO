import { useMemo, useState } from "react";

import {
    Card,
    Table,
    Select,
    Typography,
    Space,
    Tag,
    Statistic,
    Row,
    Col, ConfigProvider, Grid,
} from "antd";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LabelList,
} from "recharts";

const { Text } = Typography;

/* =========================================================
 * DATE HELPERS
 * =======================================================*/


const formatDate = (date) => {


    const y = date.getFullYear();

    const m = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
        date.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;
};



const getLast5WorkingDays = () => {

    const days = [];

    const current = new Date();

    current.setDate(
        current.getDate() - 1
    );

    while (days.length < 5) {

        if (
            current.getDay() !== 0
        ) {
            days.push(
                formatDate(current)
            );
        }

        current.setDate(
            current.getDate() - 1
        );
    }

    return days.sort();
};

/* =========================================================
 * COMPONENT
 * =======================================================*/

const UnderperformingHorizontalBarChart = ({
    rows = [],
}) => {


const { useBreakpoint } = Grid;
const screens = useBreakpoint();

    const [
        province,
        setProvince,
    ] = useState("ALL");

    const [
        group,
        setGroup,
    ] = useState("ALL");

    /* =====================================================
     * LAST 5 DAYS
     * ===================================================*/

    const last5Days = useMemo(
        () => getLast5WorkingDays(),
        []
    );

    /* =====================================================
     * PROVINCES
     * ===================================================*/

    const provinces = useMemo(
        () => [

            "ALL",

            ...new Set(
                rows
                    .map(
                        r => r.province
                    )
                    .filter(Boolean)
            ),
        ],
        [rows]
    );

    /* =====================================================
     * GROUPS
     * ===================================================*/

    const groups = useMemo(() => {

        let filteredRows =
            rows;

        if (
            province !== "ALL"
        ) {

            filteredRows =
                rows.filter(
                    r =>
                        r.province ===
                        province
                );
        }

        return [

            "ALL",

            ...new Set(
                filteredRows
                    .map(
                        r =>
                            r.wo_group
                    )
                    .filter(Boolean)
            ),
        ];

    }, [
        rows,
        province,
    ]);

    /* =====================================================
     * KPI ENGINE
     *
     * KPI:
     * TB WO/ngày < 5
     *
     * Tính trên TOÀN BỘ WO
     * của nhân viên
     * ===================================================*/

    const employeeViolationData =
        useMemo(() => {

            if (!rows.length) {
                return [];
            }

            const employeeMap =
                {};

            rows
                .filter(
                    row =>
                        row.dispatch_employee === true &&
            row.employee &&
            row.completed === true &&
            row.close_time
                )
                .forEach(
                    row => {

                        const closeDate = row.close_time.slice(0, 10);

                        if (
                            !last5Days.includes(
                                closeDate
                            )
                        ) {
                            return;
                        }

                        const key =
`${row.dispatch_province}_${row.employee}`;

                        if (
                            !employeeMap[
                                key
                            ]
                        ) {

                            employeeMap[
                                key
                            ] = {

                                employee:
                                    row.employee,

                                province:
    row.dispatch_province,

                                groups:
                                    new Set(),

                                dailyCounts:
                                    {},

                            };

                            last5Days.forEach(
                                d => {

                                    employeeMap[
                                        key
                                    ]
                                        .dailyCounts[
                                        d
                                    ] = 0;
                                }
                            );
                        }

                        employeeMap[
                            key
                        ].groups.add(
                            row.wo_group
                        );

                        employeeMap[
                            key
                        ].dailyCounts[
                            closeDate
                        ] += 1;
                    }
                );

            const result = [];

            Object.values(
                employeeMap
            ).forEach(
                emp => {

                    const counts =
                        last5Days.map(
                            d =>
                                emp
                                    .dailyCounts[
                                    d
                                ] || 0
                        );

                    const totalWO =
                        counts.reduce(
                            (
                                a,
                                b
                            ) =>
                                a +
                                b,
                            0
                        );

                    const avg = totalWO / 5;

// KPI chính
if (totalWO >= 25) {
    return;
}

                    result.push({

                        key:
                            `${emp.province}_${emp.employee}`,

                        employee:
                            emp.employee,

                        province:
                            emp.province,

                        groups:
                            [
                                ...emp.groups,
                            ],

                        d1:
                            counts[0],

                        d2:
                            counts[1],

                        d3:
                            counts[2],

                        d4:
                            counts[3],

                        d5:
                            counts[4],

                        totalWO,

                        avg:
                            Number(
                                avg.toFixed(
                                    2
                                )
                            ),

                        min:
                            Math.min(
                                ...counts
                            ),

                        max:
                            Math.max(
                                ...counts
                            ),
                    });
                }
            );

            return result.sort(
                (a, b) =>
                    a.avg -
                    b.avg
            );

        }, [
            rows,
            last5Days,
        ]);
        /* =====================================================
     * LEVEL 1
     * TỈNH
     * ===================================================*/

    const provinceSummary =
        useMemo(() => {

            const map = {};

            employeeViolationData.forEach(
                emp => {

                    map[
                        emp.province
                    ] =
                        (
                            map[
                                emp
                                    .province
                            ] || 0
                        ) + 1;
                }
            );

            return Object
                .entries(map)
                .map(
                    ([
                        province,
                        total,
                    ]) => ({

                        key:
                            province,

                        province,

                        total,
                    })
                )
                .sort(
                    (a, b) =>
                        b.total -
                        a.total
                );

        }, [
            employeeViolationData,
        ]);

    /* =====================================================
     * LEVEL 2
     * WO GROUP
     * ===================================================*/

    const groupSummary =
        useMemo(() => {

            if (
                province ===
                "ALL"
            ) {
                return [];
            }

            const map = {};

            employeeViolationData
                .filter(
                    emp =>
                        emp.province ===
                        province
                )
                .forEach(
                    emp => {

                        emp.groups.forEach(
                            groupName => {

                                if (
                                    !map[
                                        groupName
                                    ]
                                ) {

                                    map[
                                        groupName
                                    ] =
                                        new Set();
                                }

                                map[
                                    groupName
                                ].add(
                                    emp.employee
                                );
                            }
                        );
                    }
                );

            return Object
                .entries(map)
                .map(
                    ([
                        wo_group,
                        employees,
                    ]) => ({

                        key:
                            wo_group,

                        wo_group,

                        total:
                            employees.size,
                    })
                )
                .sort(
                    (a, b) =>
                        b.total -
                        a.total
                );

        }, [
            employeeViolationData,
            province,
        ]);

    /* =====================================================
     * LEVEL 3
     * EMPLOYEE
     * ===================================================*/

    const employeeTable =
        useMemo(() => {

            return employeeViolationData.filter(
                item => {

                    if (
                        province !==
                            "ALL" &&
                        item.province !==
                            province
                    ) {
                        return false;
                    }

                    if (
                        group !==
                            "ALL" &&
                        !item.groups.includes(
                            group
                        )
                    ) {
                        return false;
                    }

                    return true;
                }
            );

        }, [
            employeeViolationData,
            province,
            group,
        ]);

    /* =====================================================
     * KPI CARD
     * ===================================================*/

    const totalBadEmployees =
        employeeViolationData.length;

    const averageProductivity =
        employeeViolationData.length
            ? (
                  employeeViolationData.reduce(
                      (
                          sum,
                          emp
                      ) =>
                          sum +
                          emp.avg,
                      0
                  ) /
                  employeeViolationData.length
              ).toFixed(2)
            : 0;

    /* =====================================================
     * TABLE COLUMNS
     * ===================================================*/

    const provinceColumns = [
        {
            title: "Tỉnh",
            dataIndex:
                "province",

            render: v => (
                <Tag color="blue">
                    {v}
                </Tag>
            ),
        },

        {
            title:
                "NV năng suất kém",

            dataIndex:
                "total",

            sorter:
                (a, b) =>
                    a.total -
                    b.total,
        },
    ];

    const groupColumns = [
        {
            title:
                "WO Group",

            dataIndex:
                "wo_group",

            render: v => (
                <Tag color="purple">
                    {v}
                </Tag>
            ),
        },

        {
            title:
                "NV năng suất kém",

            dataIndex:
                "total",

            sorter:
                (a, b) =>
                    a.total -
                    b.total,
        },
    ];

    const getAvgColor =
        avg => {

            if (
                avg < 2
            ) {
                return "red";
            }

            if (
                avg < 4
            ) {
                return "orange";
            }

            return "gold";
        };

    const employeeColumns = [

        {
            title:
                "Nhân viên",

            dataIndex:
                "employee",

            width: 160,
    fixed: "left",
        },

        {
            title:
                "Tỉnh",

            dataIndex:
                "province",

            width: 90,
    fixed: "left",

            render: v => (
                <Tag color="blue">
                    {v}
                </Tag>
            ),
        },

        {
            title:
                "WO Group",


            dataIndex:
                "groups",

            width: 220,

            render:
                groups => (

                    <Space wrap>

                        {groups.map(
                            g => (
                                <Tag
                                    key={
                                        g
                                    }
                                    color="purple"
                                >
                                    {g}
                                </Tag>
                            )
                        )}

                    </Space>
                ),
        },

        {
            title:
                last5Days[0].slice(
                    5
                ),

            dataIndex:
                "d1",

            align:
                "center",
        },

        {
            title:
                last5Days[1].slice(
                    5
                ),

            dataIndex:
                "d2",

            align:
                "center",
        },

        {
            title:
                last5Days[2].slice(
                    5
                ),

            dataIndex:
                "d3",

            align:
                "center",
        },

        {
            title:
                last5Days[3].slice(
                    5
                ),

            dataIndex:
                "d4",

            align:
                "center",
        },

        {
            title:
                last5Days[4].slice(
                    5
                ),

            dataIndex:
                "d5",

            align:
                "center",
        },

        {
            title:
                "Tổng WO",

            dataIndex:
                "totalWO",

            align:
                "center",

            sorter:
                (a, b) =>
                    a.totalWO -
                    b.totalWO,

            render: v => (
                <Tag color="red">
                    {v}
                </Tag>
            ),
        },

        {
            title:
                "TB WO/ngày",

            dataIndex:
                "avg",

            align:
                "center",

            sorter:
                (a, b) =>
                    a.avg -
                    b.avg,

            render:
                value => (

                    <Tag
                        color={getAvgColor(
                            value
                        )}
                    >
                        {value}
                    </Tag>
                ),
        },

        {
            title:
                "Min",

            dataIndex:
                "min",

            align:
                "center",
        },

        {
            title:
                "Max",

            dataIndex:
                "max",

            align:
                "center",
        },
    ];
        /* =====================================================
     * CHART + TABLE DATA
     * ===================================================*/

    let tableData = [];
    let columns = [];
    let title = "";
    let chartData = [];

    if (
        province === "ALL" &&
        group === "ALL"
    ) {

        tableData =
            provinceSummary;

        columns =
            provinceColumns;

        chartData =
            provinceSummary.map(
                item => ({
                    name:
                        item.province,
                    value:
                        item.total,
                })
            );

        title =
            "🚨 Nhân Viên Năng Suất Kém";

    } else if (
        province !== "ALL" &&
        group === "ALL"
    ) {

        tableData =
            groupSummary;

        columns =
            groupColumns;

        chartData =
            groupSummary.map(
                item => ({
                    name:
                        item.wo_group,
                    value:
                        item.total,
                })
            );

        title =
            `🚨 ${province}`;

    } else {

        tableData =
            employeeTable;

        columns =
            employeeColumns;

        chartData =
            employeeTable.map(
                item => ({

                    name:
                        item.employee,

                    value:
                        item.avg,
                })
            );

        title =
            `🚨 ${province} - ${group}`;
    }

    /* =====================================================
     * RENDER
     * ===================================================*/

//
// const buckets = {
//   "<5": 0,
//   "5-9": 0,
//   "10-14": 0,
//   "15-19": 0,
//   "20-24": 0,
// };
//
// employeeViolationData.forEach(emp => {
//   const t = emp.totalWO;
//
//   if (t < 5) buckets["<5"]++;
//   else if (t < 10) buckets["5-9"]++;
//   else if (t < 15) buckets["10-14"]++;
//   else if (t < 20) buckets["15-19"]++;
//   else buckets["20-24"]++;
// });
//
// console.table(buckets);
//
// console.log(
//   "employees in KPI",
//   new Set(
//     rows
//       .filter(r => r.completed)
//       .map(r => r.employee)
//   ).size
// );


    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 18,
                background: "#e1f4fa",
                boxShadow: "0 12px 32px rgba(0,0,0,.15)",
                overflow: "hidden",
            }}
            bodyStyle={{ padding: screens.xs ? 16 : 24 }}
        >
            {/* PHẦN HEADER: TIÊU ĐỀ VÀ BỘ LỌC */}
            <div
                style={{
                    display: "flex",
                    flexDirection: screens.sm ? "row" : "column",
                    justifyContent: "space-between",
                    alignItems: screens.sm ? "center" : "flex-start",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                <div
                    style={{
                        fontSize: screens.xs ? 18 : 22,
                        fontWeight: 700,
                        color: "#0f172a",
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: screens.xs ? "column" : "row",
                        gap: 12,
                        width: screens.sm ? "auto" : "100%",
                    }}
                >
                    <Select
                        value={province}
                        size={screens.xs ? "middle" : "large"}
                        style={{
                            width: screens.xs ? "100%" : 200,
                            background: "#e1f4fa",
                        }}
                        onChange={(value) => {
                            setProvince(value);
                            setGroup("ALL");
                        }}
                        options={provinces.map((p) => ({
                            label: p,
                            value: p,
                        }))}
                    />

                    <Select
                        value={group}
                        size={screens.xs ? "middle" : "large"}
                        style={{
                            width: screens.xs ? "100%" : 220,
                            background: "#e1f4fa",
                        }}
                        onChange={setGroup}
                        options={groups.map((g) => ({
                            label: g,
                            value: g,
                        }))}
                    />
                </div>
            </div>

            {/* PHẦN KPI CARDS */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            background: "rgba(59, 130, 246, 0.1)", // Nền xanh nhạt hiện đại
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: "#475569", fontWeight: 500 }}>Tổng NV năng suất kém</span>}
                            value={totalBadEmployees}
                            valueStyle={{ color: "#2563eb", fontWeight: 700 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            background: "rgba(245, 158, 11, 0.1)", // Nền cam nhạt
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: "#475569", fontWeight: 500 }}>TB WO/ngày</span>}
                            value={averageProductivity}
                            precision={2}
                            valueStyle={{ color: "#d97706", fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* PHẦN NGÀY THÁNG */}
            <div style={{ marginBottom: 24 }}>
                <Text strong style={{ color: "#334155", display: "block", marginBottom: 8 }}>
                    5 ngày làm việc gần nhất:
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {last5Days.map((d) => (
                        <Tag
                            key={d}
                            color="cyan"
                            style={{ margin: 0, padding: "4px 10px", fontSize: screens.xs ? 11 : 12, borderRadius: 6 }}
                        >
                            {d}
                        </Tag>
                    ))}
                </div>
            </div>

            {/* PHẦN BIỂU ĐỒ (Thanh ngang) */}
            <div style={{ width: "100%", overflowX: "auto" }}>
                <ResponsiveContainer
                    width="100%"
                    // Tính toán động chiều cao: Càng nhiều dòng thì biểu đồ càng dài xuống dưới
                    height={Math.max(screens.xs ? 300 : 450, chartData.length * (screens.xs ? 40 : 50))}
                >
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{
                            top: 10,
                            right: screens.xs ? 30 : 40, // Chừa khoảng trống bên phải để vẽ Nhãn LabelList
                            left: screens.xs ? -10 : 0,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#cbd5e1" />

                        <XAxis
                            type="number"
                            tick={{ fontSize: screens.xs ? 10 : 12, fill: "#64748b" }}
                            axisLine={{ stroke: "#94a3b8" }}
                            tickLine={false}
                        />

                        <YAxis
                            type="category"
                            dataKey="name"
                            width={screens.xs ? 100 : 150} // Dành đủ không gian bên trái cho Tên/Tỉnh
                            tick={{ fontSize: screens.xs ? 10 : 12, fill: "#334155", fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                            contentStyle={{
                                background: "#1e293b",
                                border: "none",
                                borderRadius: 8,
                                color: "#f8fafc",
                            }}
                            itemStyle={{ color: "#e2e8f0", fontSize: 13 }}
                            labelStyle={{ color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}
                            formatter={(value) => [
                                value,
                                province === "ALL" && group === "ALL"
                                    ? "Số NV"
                                    : province !== "ALL" && group === "ALL"
                                    ? "Số NV"
                                    : "TB WO/ngày",
                            ]}
                        />

                        <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            radius={[0, 6, 6, 0]} // Chỉ bo tròn góc bên phải
                            barSize={screens.xs ? 20 : 28} // Độ dày của thanh ngang
                        >
                            <LabelList
                                dataKey="value"
                                position="right"
                                fill="#0f172a"
                                fontSize={screens.xs ? 10 : 12}
                                fontWeight={600}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* PHẦN BẢNG TỔNG HỢP (TABLE) */}
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: "#bae6fd", // Đồng bộ màu header bảng xanh nhạt
                            colorBgContainer: "#ffffff", // Nền bảng trắng để dễ đọc dữ liệu
                            rowHoverBg: "#f1f5f9",
                            borderColor: "#cbd5e1",
                            borderRadius: 8,
                        },
                    },
                }}
            >
                <div
                    style={{
                        marginTop: 24,
                        borderRadius: 8,
                        overflow: "hidden", // Cắt góc bo tròn của bảng
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                    }}
                >
                    <Table
                        rowKey="key"
                        columns={columns}
                        dataSource={tableData}
                        size={screens.xs ? "small" : "middle"} // Bảng nhỏ lại trên mobile
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            responsive: true,
                        }}
                        scroll={{
                            x: "max-content", // Bắt buộc giữ để bảng có thanh cuộn ngang khi quá nhiều cột
                        }}
                    />
                </div>
            </ConfigProvider>
        </Card>
    );
};

export default UnderperformingHorizontalBarChart;