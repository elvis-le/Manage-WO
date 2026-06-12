import {
    Card,
    Table,
    Input,
    Typography,
    ConfigProvider,
    Grid,
} from "antd";

import {
    SearchOutlined,
} from "@ant-design/icons";

import {
    useMemo,
    useState,
} from "react";

const { Title } = Typography;

function OverdueDispatchTable({
    rows,
}) {

    const { useBreakpoint } = Grid;

    const screens =
        useBreakpoint();

    const [
        searchText,
        setSearchText,
    ] = useState("");

    const tableData =
        useMemo(() => {

            let result =
                rows.filter(
                    row =>
                        row.pending &&
                        row.overdue &&
                        row.employee
                );

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
        ]);

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
                    }

                    else if (
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
                marginTop:
                    24,

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

            <Input
                prefix={
                    <SearchOutlined />
                }

                placeholder="
Tìm nhân viên, huyện, tỉnh..."

                allowClear

                value={
                    searchText
                }

                onChange={
                    e =>
                        setSearchText(
                            e.target
                                .value
                        )
                }

                style={{
                    marginBottom:
                        16,

                    maxWidth:
                        350,

                    background:
                        "#e1f4fa",

                    border:
                        "1px solid #18bdf0",
                }}
            />

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
