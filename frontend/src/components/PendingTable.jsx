import {
    Card,
    Table,
    Select,
    Space,
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

function PendingTable({ rows }) {
    const { useBreakpoint } = Grid;
const screens = useBreakpoint();

    const [coordGroupFilter, setCoordGroupFilter] =
        useState("ALL");

    const [woGroupFilter, setWoGroupFilter] =
        useState("ALL");

    const [searchText, setSearchText] =
        useState("");

    const coordGroups = useMemo(
        () => [
            "ALL",
            ...new Set(
                rows
                    .map(x => x.coord_group)
                    .filter(Boolean)
            ),
        ],
        [rows]
    );

    // const woGroups = useMemo(
    //     () => [
    //         "ALL",
    //         ...new Set(
    //             rows
    //                 .map(x => x.wo_group)
    //                 .filter(Boolean)
    //         ),
    //     ],
    //     [rows]
    // );

    const dynamicWoGroups = useMemo(() => {

        const groups = [
            ...new Set(
                rows
                    .map(x => x.wo_group)
                    .filter(Boolean)
            )
        ];

        const priorityGroups = [
            "KSNN",
            "TD",
            "VO TUYEN",
        ];

        return [
            ...priorityGroups.filter(
                g => groups.includes(g)
            ),
            ...groups.filter(
                g => !priorityGroups.includes(g)
            ),
        ];

    }, [rows]);


    const tableData = useMemo(() => {

        let result = rows.filter(
    row =>
        row.is_dispatch_employee === true
);

        if (coordGroupFilter !== "ALL") {
            result = result.filter(
                x =>
                    x.coord_group ===
                    coordGroupFilter
            );
        }

        if (woGroupFilter !== "ALL") {
            result = result.filter(
                x =>
                    x.wo_group ===
                    woGroupFilter
            );
        }

        if (searchText.trim()) {

            const keyword =
                searchText
                    .toLowerCase()
                    .trim();

            result = result.filter(
                x =>
                    x.employee
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    x.province
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    x.coord_group
                        ?.toLowerCase()
                        .includes(keyword)

            );
        }

        const grouped = {};

        result.forEach(row => {

            const key = [
   row.province,
    row.employee,
    row.phone,
    row.district,
].join("|");

            if (!grouped[key]) {

                grouped[key] = {
                    key,

                    province:
                        row.province,

                    coord_group:
                        row.coord_group,

                    employee:
                        row.employee,

                    total_pending: 0,

    total_overdue: 0,

                    near_due: {},

                    overdue_5: {},
                };

                dynamicWoGroups.forEach(group => {

                    grouped[key]
                        .near_due[group] = 0;

                    grouped[key]
                        .overdue_5[group] = 0;
                });
            }

            if (row.pending) {
    grouped[key].total_pending += 1;
}

            if (row.overdue) {
    grouped[key]
        .total_overdue += 1;
}

            const group =
                row.wo_group;

            if (
                row.near_due
                &&
                group
            ) {
                grouped[key]
                    .near_due[group] += 1;
            }

            if (
                (row.overdue_day || 0) > 5
                &&
                group
            ) {
                grouped[key]
                    .overdue_5[group] += 1;
            }

        });


        return Object
            .values(grouped)
            .map((item, index) => ({
                ...item,
                stt: index + 1,
            }));

    }, [
        rows,
        coordGroupFilter,
        woGroupFilter,
        searchText,
        dynamicWoGroups,
    ]);

    const columns = [

        {
            title: "STT",
            dataIndex: "stt",
            width: 80,
            align: "center",
            fixed: "left",
        },

        {
            title: "Mã Tỉnh",
            dataIndex: "province",
            width: 120,
            align: "center",
        },

        {
            title: "Nhóm điều phối",
            dataIndex: "coord_group",
            width: 220,
        },

        {
            title: "Tên Nhân Viên",
            dataIndex: "employee",
            width: 180,
    fixed: "left",
        },

        {
            title: "Tổng WO Tồn",
            dataIndex: "total_pending",
            width: 130,
            align: "center",
        },

        {
    title: "Tổng WO Tồn Quá Hạn",
    dataIndex: "total_overdue",
    width: 160,
    align: "center",
},

        {
            title: "WO Sắp Quá Hạn 1-3 ngày",

            children:
                dynamicWoGroups.map(
                    group => ({
                        title: group,
                        width: 90,
                        align: "center",
                        render: (_, row) =>
                            row.near_due[group] || 0,
                    })
                ),
        },

        {
            title: "WO Quá Hạn > 5 Ngày",

            children:
                dynamicWoGroups.map(
                    group => ({
                        title: group,
                        width: 90,
                        align: "center",
                        render: (_, row) =>
                            row.overdue_5[group] || 0,
                    })
                ),
        },
    ];



    return (
        <Card style={{ marginTop: 24, borderRadius: 16, overflow: "hidden", background: "#e1f4fa", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: screens.xs ? 12 : 24 }}>
            <Title level={screens.xs ? 5 : 4} style={{ marginBottom: 20 }}>
                WO Chưa Hoàn Thành
            </Title>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <Input
                    prefix={<SearchOutlined/>}
                    placeholder="Tìm kiếm..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{
                        flex: screens.xs ? "1 1 100%" : "1 1 300px",
                        maxWidth: screens.xs ? "100%" : 340,
                        background: "#e1f4fa", border: "1px solid #18bdf0"
                    }}
                />

                <Select
                    value={coordGroupFilter}
                    onChange={setCoordGroupFilter}
                    style={{
                        flex: screens.xs ? "1 1 100%" : "0 0 200px",
                        fontFamily: "Arial", background: "#e1f4fa", border: "1px solid #18bdf0"
                    }}
                    optionFilterProp="children"
                    popupMatchSelectWidth={false}
                >
                    {coordGroups.map(g => (
                        <Select.Option key={g} value={g}>{g}</Select.Option>
                    ))}
                </Select>
            </div>

            <ConfigProvider theme={{ components: { Table: { headerBg: "#e1f4fa", colorBgContainer: "#e1f4fa", rowHoverBg: "#e1f4fa", borderColor: "#18bdf0" } } }}>
                <Table
                    rowKey="key"
                    columns={columns}
                    dataSource={tableData}
                    bordered
                    size={screens.xs ? "small" : "middle"}
                    pagination={{ pageSize: 12, showSizeChanger: true, showTotal: total => `Tổng ${total} dòng` }}
                    scroll={{ x: 1000 }} // Fix cứng x để ép thanh cuộn ngang xuất hiện mượt hơn
                />
            </ConfigProvider>
        </Card>
    );
}

export default PendingTable;