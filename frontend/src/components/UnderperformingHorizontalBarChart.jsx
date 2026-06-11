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

            style={{

                borderRadius: 16,

                background: "#e1f4fa",
                boxShadow:
                    "0 8px 24px rgba(0,0,0,0.08)",
            }}
>


            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    }}
>

    <div
        style={{
            fontSize: 20,
            fontWeight: 700,
        }}
    >
        {title}
    </div>
    <Space wrap>

                    <Select

                        value={
                            province
                        }

                        style={{
        width: "100%",
        minWidth: 140,
        maxWidth: 200,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                        }}

                        onChange={
                            value => {

                                setProvince(
                                    value
                                );

                                setGroup(
                                    "ALL"
                                );
                            }
                        }

                        options={provinces.map(
                            p => ({
                                label:
                                    p,
                                value:
                                    p,
                            })
                        )}

                    />

                    <Select

                        value={
                            group
                        }

                        style={{
        width: "100%",
        minWidth: 140,
        maxWidth: 220,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                        }}

                        onChange={
                            setGroup
                        }

                        options={groups.map(
                            g => ({
                                label:
                                    g,
                                value:
                                    g,
                            })
                        )}

                    />

                </Space>

            </div>

            {/* KPI CARDS */}

            <Row
                gutter={16}
                style={{
                    marginBottom: 20,
                }}
            >

                <Col
    xs={24}
    sm={12}
>

                    <Card
                        size="small"
                style={{
                background: "#e1f4fa",
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.15)",

                            border: "1px solid #18bdf0"
                }}
                    >

                        <Statistic
                            title="Tổng NV năng suất kém"
                            value={
                                totalBadEmployees
                            }
                        />

                    </Card>

                </Col>

                <Col
    xs={24}
    sm={12}
>

                    <Card
                        size="small"
                style={{
                background: "#e1f4fa",
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.15)",

                            border: "1px solid #18bdf0"
                }}
                    >

                        <Statistic
                            title="TB WO/ngày"
                            value={
                                averageProductivity
                            }
                            precision={
                                2
                            }
                        />

                    </Card>

                </Col>

            </Row>

            <div
                style={{
                    marginBottom: 20,
                }}
            >

                <Text
                    strong
                >

                    5 ngày làm việc gần nhất:

                </Text>

                <br />

                <Space
                    wrap
                    style={{
                        marginTop: 8,
                    }}
                >

                    {last5Days.map(
                        d => (

                            <Tag
                                key={d}
                                color="cyan"
                            >
                                {d}
                            </Tag>
                        )
                    )}

                </Space>

            </div>

            {/* CHART */}

            <ResponsiveContainer

                width="100%"

                height={
    screens.xs
        ? Math.max(
              250,
              chartData.length * 32
          )
        : Math.max(
              450,
              chartData.length * 42
          )
}
            >

                <BarChart

                    layout="vertical"

                    data={
                        chartData
                    }

                    margin={{

                        top: 10,

                        right: 40,

                        left: 0,

                        bottom: 10,
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        type="number"
                    />

                    <YAxis
    type="category"
    dataKey="name"
    width={
        screens.xs
            ? 90
            : 140
    }
/>

                    <Tooltip

                        formatter={(
                            value
                        ) => [

                            value,

                            province ===
                                "ALL" &&
                            group ===
                                "ALL"

                                ? "Số NV"

                                : province !==
                                      "ALL" &&
                                  group ===
                                      "ALL"

                                ? "Số NV"

                                : "TB WO/ngày",
                        ]}
                    />

                    <Bar

                        dataKey="value"

                        fill="#1890ff"

                        radius={[
                            0,
                            8,
                            8,
                            0,
                        ]}
                    >

                        <LabelList
    dataKey="value"
    position="right"
    fontSize={
        screens.xs
            ? 10
            : 12
    }
/>

                    </Bar>

                </BarChart>

            </ResponsiveContainer>

            {/* TABLE */}
<ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg:
                                "#e1f4fa",
                            colorBgContainer:
                                "#e1f4fa",
                            rowHoverBg:
                                "#e1f4fa",
                            borderColor:
                                "#18bdf0",
                        },
                    },
                }}
            >
            <Table

                rowKey="key"

                columns={
                    columns
                }

                dataSource={
                    tableData
                }

                bordered

                size="small"

                pagination={{
    pageSize: 10,
    showSizeChanger: false,
}}

                scroll={{
                    x: "max-content",
                }}

                style={{
                    marginTop: 24,
                background: "#e1f4fa",
                }}
            />
</ConfigProvider>

        </Card>
    );
};

export default UnderperformingHorizontalBarChart;