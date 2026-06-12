import {
    Card,
    Table,
    Input,
    Typography,
    ConfigProvider,
    Grid, Select,
} from "antd";

import {
    SearchOutlined,
} from "@ant-design/icons";

import {
    useMemo,
    useState,
} from "react";

const {Title} = Typography;

function OverdueDispatchTable({
                                  rows,
                              }) {

    const [searchText, setSearchText] =
        useState("");

    const [province, setProvince] =
        useState("ALL");

    const [woGroup, setWoGroup] =
        useState("ALL");

    const [coordGroup, setCoordGroup] =
        useState("ALL");

    const {useBreakpoint} = Grid;

    const screens =
        useBreakpoint();

    const provinces = useMemo(
    () => [

        "ALL",

        ...new Set(

            rows
                .filter(
                    x =>
                        !x.completed &&
                        x.overdue &&
                        x.employee
                )

                .map(
                    x => x.province
                )

                .filter(Boolean)

        ),

    ],

    [rows]
);

    const woGroups = useMemo(() => {

        const filtered = rows.filter(
    x =>
                        !x.completed &&
        x.overdue &&
        x.employee
);

        return [
            "ALL",
            ...new Set(
                filtered
                    .map(
                        x => x.wo_group
                    )
                    .filter(Boolean)
            ),
        ];

    }, [
        rows,
        province,
    ]);

    const coordGroups = useMemo(() => {

        let filtered = rows.filter(
    x =>
        !x.completed &&
        x.overdue &&
        x.employee
);

        if (
            province !== "ALL"
        ) {

            filtered =
                filtered.filter(
                    x =>
                        x.province ===
                        province
                );
        }

        if (
            woGroup !== "ALL"
        ) {

            filtered =
                filtered.filter(
                    x =>
                        x.wo_group ===
                        woGroup
                );
        }

        return [
            "ALL",
            ...new Set(
                filtered
                    .map(
                        x =>
                            x.coord_group
                    )
                    .filter(Boolean)
            ),
        ];

    }, [
        rows,
        province,
        woGroup,
    ]);

    const tableData =
        useMemo(() => {

            let result =
                rows.filter(
                    row =>
                        !row.completed &&
                        row.overdue &&
                        row.employee
                );
            if (
                province !== "ALL"
            ) {

                result =
                    result.filter(
                        x =>
                            x.province ===
                            province
                    );
            }

            if (
                woGroup !== "ALL"
            ) {

                result =
                    result.filter(
                        x =>
                            x.wo_group ===
                            woGroup
                    );
            }

            if (
                coordGroup !== "ALL"
            ) {

                result =
                    result.filter(
                        x =>
                            x.coord_group ===
                            coordGroup
                    );
            }

            if (
                searchText.trim()
            ) {

                const keyword =
                    searchText
                        .toLowerCase()
                        .trim();

                result =
                    result.filter(
                        row =>
                            row.employee
                                ?.toLowerCase()
                                .includes(
                                    keyword
                                )

                            ||

                            row.district
                                ?.toLowerCase()
                                .includes(
                                    keyword
                                )

                            ||

                            row.province
                                ?.toLowerCase()
                                .includes(
                                    keyword
                                )
                    );
            }

            console.log(
    "Filtered WO:",
    result.length
);

            const grouped =
                {};

            result.forEach(
                row => {

                    const key =
                        [
                            row.employee,
                            row.district,
                        ].join("|");

                    if (
                        !grouped[key]
                    ) {

                        grouped[
                            key
                            ] = {

                            key,

                            employee:
                            row.employee,

                            district:
                            row.district,

                            province:
                            row.province,

                            total_overdue:
                                0,

                            details:
                                {},
                        };
                    }

                    grouped[
                        key
                        ].total_overdue++;

                    const system =
                        row.system_name ||
                        "Khác";

                    const workType =
                        row.work_type ||
                        "Khác";

                    const detailKey =
                        `${system}|${workType}`;

                    if (
                        !grouped[key]
                            .details[
                            detailKey
                            ]
                    ) {

                        grouped[key]
                            .details[
                            detailKey
                            ] = {

                            system,

                            workType,

                            count: 0,
                        };
                    }

                    grouped[key]
                        .details[
                        detailKey
                        ].count++;
                }
            );

            return Object
                .values(
                    grouped
                )
                .map(
                    item => ({

                        ...item,

                        details:
                            Object
                                .values(
                                    item.details
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        b.count -
                                        a.count
                                ),
                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.total_overdue -
                        a.total_overdue
                )
                .map(
                    (
                        item,
                        index
                    ) => ({
                        ...item,
                        stt:
                            index + 1,
                    })
                );


        }, [
    rows,
    searchText,
    province,
    woGroup,
    coordGroup,
])




    const columns = [

        {
            title: "STT",
            dataIndex: "stt",
            width: 60,
            align: "center",
        },

        {
            title: "Nhân viên",
            dataIndex:
                "employee",
            width: 180,
            fixed: "left",
        },

        {
            title: "Huyện",
            dataIndex:
                "district",
            width: 220,
        },

        {
            title: "Tỉnh",
            dataIndex:
                "province",
            width: 100,
            align: "center",
        },

        {
            title:
                "Tổng WO Quá Hạn",

            dataIndex:
                "total_overdue",

            width: 140,

            align:
                "center",

            sorter:
                (
                    a,
                    b
                ) =>
                    a.total_overdue -
                    b.total_overdue,

            render:
                value => {

                    let color =
                        "#52c41a";

                    if (
                        value >=
                        10
                    ) {
                        color =
                            "#cf1322";
                    } else if (
                        value >=
                        5
                    ) {
                        color =
                            "#fa8c16";
                    }

                    return (
                        <span
                            style={{
                                fontWeight:
                                    700,

                                color,
                            }}
                        >
                            {value}
                        </span>
                    );
                },
        },
    ];

    const detailColumns =
        [
            {
                title:
                    "System",

                dataIndex:
                    "system",

                width:
                    150,
            },

            {
                title:
                    "WO Type",

                dataIndex:
                    "workType",
            },

            {
                title:
                    "SL",

                dataIndex:
                    "count",

                width:
                    80,

                align:
                    "center",
            },
        ];

    return (
        <Card
            style={{

                borderRadius:
                    16,

                overflow:
                    "hidden",

                background:
                    "#e1f4fa",

                boxShadow:
                    "0 8px 24px rgba(0,0,0,0.08)",
            }}

            bodyStyle={{
                padding:
                    screens.xs
                        ? 12
                        : 24,
            }}
        >

            <Title
                level={
                    screens.xs
                        ? 5
                        : 4
                }

                style={{
                    marginBottom:
                        20,
                }}
            >
                Điều Phối WO
                Quá Hạn
            </Title>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 20,
                    alignItems: "center",
                }}
            >

                <Input
                    prefix={<SearchOutlined/>}
                    placeholder="Tìm kiếm..."
                    allowClear
                    value={searchText}
                    onChange={e =>
                        setSearchText(
                            e.target.value
                        )
                    }
                    style={{
                        flex:
                            screens.xs
                                ? "1 1 100%"
                                : "1 1 280px",

                        maxWidth:
                            screens.xs
                                ? "100%"
                                : 320,

                        background:
                            "#e1f4fa",

                        border:
                            "1px solid #18bdf0",
                    }}
                />

                <Select
                    value={province}
                    style={{
                        width:
                            screens.xs
                                ? "100%"
                                : 150,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                    }}
                    onChange={value => {

                        setProvince(
                            value
                        );

                        setWoGroup(
                            "ALL"
                        );

                        setCoordGroup(
                            "ALL"
                        );
                    }}
                >
                    {provinces.map(
                        p => (
                            <Select.Option
                                key={p}
                                value={p}
                            >
                                {p}
                            </Select.Option>
                        )
                    )}
                </Select>

                <Select
                    value={woGroup}
                    style={{
                        width:
                            screens.xs
                                ? "100%"
                                : 180,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                    }}
                    onChange={setWoGroup}
                >
                    {woGroups.map(
                        g => (
                            <Select.Option
                                key={g}
                                value={g}
                            >
                                {g}
                            </Select.Option>
                        )
                    )}
                </Select>

                <Select
                    value={coordGroup}
                    style={{
                        width:
                            screens.xs
                                ? "100%"
                                : 180,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                    }}
                    onChange={setCoordGroup}
                >
                    {coordGroups.map(
                        g => (
                            <Select.Option
                                key={g}
                                value={g}
                            >
                                {g}
                            </Select.Option>
                        )
                    )}
                </Select>

            </div>

            <ConfigProvider
                theme={{
                    components:
                        {
                            Table:
                                {
                                    headerBg:
                                        "#e1f4fa",

                                    colorBgContainer:
                                        "#e1f4fa",

                                    rowHoverBg:
                                        "#d0f0fa",

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

                    size={
                        screens.xs
                            ? "small"
                            : "middle"
                    }

                    expandable={{

                        expandedRowRender:
                            record => (

                                <Table

                                    rowKey={
                                        row =>
                                            `${row.system}-${row.workType}`
                                    }

                                    columns={
                                        detailColumns
                                    }

                                    dataSource={
                                        record.details
                                    }

                                    pagination={
                                        false
                                    }

                                    size="small"
                                />
                            ),
                    }}

                    pagination={{
                        pageSize:
                            screens.xs
                                ? 5
                                : 10,

                        showSizeChanger:
                            !screens.xs,

                        showTotal:
                            total =>
                                `Tổng ${total} nhân viên`,
                    }}

                    scroll={{
                        x: 900,
                    }}
                />
            </ConfigProvider>
        </Card>
    );
}

export default OverdueDispatchTable;
