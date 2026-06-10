import {
    Card,
    Table,
    Select,
    Tag,
    Space,
    Input,
    Typography, ConfigProvider,
} from "antd";

import {
    SearchOutlined,
    FilterOutlined,
} from "@ant-design/icons";

import {
    useMemo,
    useState,
} from "react";

const {Title} = Typography;

function PendingTable({rows}) {

    const coordGroups = useMemo(
    () => [
        "ALL",
        ...new Set(
            rows
                .map(
                    x => x.coord_group
                )
                .filter(Boolean)
        ),
    ],
    [rows]
);

const woGroups = useMemo(
    () => [
        "ALL",
        ...new Set(
            rows
                .map(
                    x => x.wo_group
                )
                .filter(Boolean)
        ),
    ],
    [rows]
);

const [
    coordGroupFilter,
    setCoordGroupFilter,
] = useState("ALL");

const [
    woGroupFilter,
    setWoGroupFilter,
] = useState("ALL");

    const [sortType,
        setSortType] =
        useState("priority");

    const [searchText,
        setSearchText] =
        useState("");

    const priorityOrder = {
        "Nghiêm trọng": 1,
        "Cao": 2,
        "Trung bình": 3,
        "Bình Thường": 4,
        "Bình thường": 4,
    };

    const data = useMemo(() => {

let result = [...rows]
    .filter(x => x.pending);

if (
    coordGroupFilter !== "ALL"
) {
    result = result.filter(
        x =>
            x.coord_group ===
            coordGroupFilter
    );
}

if (
    woGroupFilter !== "ALL"
) {
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

                ||

                x.wo_group
                    ?.toLowerCase()
                    .includes(keyword)
        );

    }

    if (sortType === "priority") {

        result.sort(
            (a, b) =>
                (priorityOrder[a.priority] || 99)
                -
                (priorityOrder[b.priority] || 99)
        );

    }

    if (sortType === "remain_hour") {

        result.sort(
            (a, b) =>
                b.remain_hour -
                a.remain_hour
        );

    }

    if (sortType === "overdue_day") {

        result.sort(
            (a, b) =>
                b.overdue_day -
                a.overdue_day
        );

    }

    return result;

}, [
    rows,
    coordGroupFilter,
    woGroupFilter,
    sortType,
    searchText,
]);

    const columns = [

        {
            title: "STT",
            width: 70,
            align: "center",
            render: (_, __, index) =>
                index + 1,
            fixed: "left",
        },

        {
            title: "Mã Tỉnh",
            dataIndex: "province",
            width: 110,
            align: "center",
        },

        {
            title: "Ưu Tiên",
            dataIndex: "priority",
            width: 140,
            align: "center",
            render: value => {

                if (
                    value ===
                    "Nghiêm trọng"
                ) {
                    return (
                        <Tag color="red">
                            {value}
                        </Tag>
                    );
                }

                if (
                    value ===
                    "Cao"
                ) {
                    return (
                        <Tag color="volcano">
                            {value}
                        </Tag>
                    );
                }

                if (
                    value ===
                    "Trung bình"
                ) {
                    return (
                        <Tag color="gold">
                            {value}
                        </Tag>
                    );
                }

                return (
                    <Tag color="blue">
                        {value}
                    </Tag>
                );

            },
        },

        {
            title:
                "Nhóm Điều Phối",
            dataIndex:
                "coord_group",
            width: 320,
        },

        {
            title:
                "Nhóm WO",
            dataIndex:
                "wo_group",
            width: 130,
            align: "center",
        },

        {
            title:
                "Nhân Viên",
            dataIndex:
                "employee",
            width: 170,
        },
        {
            title:
                "TG Còn Lại (h)",
            dataIndex:
                "remain_hour",
            width: 140,
            align: "center",
            render: value => (
                <span
                    style={{
                        fontWeight: 600,
                    }}
                >
          {value}
        </span>
            ),
        },

        {
            title:
                "Ngày Quá Hạn",
            dataIndex:
                "overdue_day",
            width: 140,
            align: "center",
        },

        {
    title: "Trạng Thái SLA",
    width: 150,
    align: "center",
    render: (_, row) => {

        if (row.overdue) {
            return (
                <Tag color="red">
                    Quá hạn
                </Tag>
            );
        }

        if (row.near_due) {
            return (
                <Tag color="orange">
                    Sắp quá hạn
                </Tag>
            );
        }

        return (
            <Tag color="green">
                Đang tồn
            </Tag>
        );

    },
},

    ];

    return (

        <Card
            style={{
                marginTop: 24,
                borderRadius: 16,
                background: "#e1f4fa",
                boxShadow:
                    "0 8px 24px rgba(0,0,0,0.08)",
            }}
        >

            <Title
                level={4}
                style={{
                    marginBottom: 20,
                }}
            >
                WO Chưa Hoàn Thành
            </Title>

            <Space
                wrap
                size="middle"
                style={{
                    marginBottom: 20,
                    width: "100%",
                    justifyContent:
                        "space-between",
                }}
            >

                <Input
                    prefix={
                        <SearchOutlined/>
                    }
                    placeholder="Tìm nhân viên, tỉnh, nhóm điều phối..."
                    allowClear
                    value={searchText}
                    onChange={e =>
                        setSearchText(
                            e.target.value
                        )
                    }
                    style={{
                        width: 340,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0",
                    }}
                />

                <Space wrap>

                    <Select
    value={
        coordGroupFilter
    }
    onChange={
        setCoordGroupFilter
    }
    style={{
        width: 250,
        background: "#e1f4fa",
        border: "1px solid #18bdf0"
    }}
>
    {coordGroups.map(g => (
        <Select.Option
            key={g}
            value={g}
        >
            {g}
        </Select.Option>
    ))}
</Select>

                    <Select
    value={
        woGroupFilter
    }
    onChange={
        setWoGroupFilter
    }
    style={{
        width: 220,
        background: "#e1f4fa",
        border: "1px solid #18bdf0"
    }}
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

                    <Select
                        value={sortType}
                        onChange={
                            setSortType
                        }
                        style={{
                            width: 220,
                            background: "#e1f4fa",
                            border: "1px solid #18bdf0"
                        }}
                    >

                        <Select.Option value="priority">
                            Ưu tiên cao nhất
                        </Select.Option>

                        <Select.Option value="remain_hour">
                            Còn nhiều thời gian nhất
                        </Select.Option>

                        <Select.Option value="overdue_day">
                            Quá hạn nhiều nhất
                        </Select.Option>

                    </Select>

                </Space>

            </Space>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: "#e1f4fa",

                            colorBgContainer: "#e1f4fa",

                            rowHoverBg: "#e1f4fa",
                            borderColor: "#18bdf0",
                        },
                    },
                }}
            >
                <Table


                    rowKey="wo_id"

                    columns={columns}

                    dataSource={data}

                    bordered

                    size="middle"

                    pagination={{
                        pageSize: 12,
                        showSizeChanger: true,
                        background: "#0f172a",
                        color: "#fff",
                        showTotal: total =>
                            `Tổng ${total} WO`,
                    }}

                    scroll={{
                    }}

                />
            </ConfigProvider>

        </Card>

    );

}

export default PendingTable;