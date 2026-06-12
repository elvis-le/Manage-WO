import {
    Card,
    Table,
    Select,
    Space,
    Input,
    Typography,
    ConfigProvider, Grid,
} from "antd";

import {
    SearchOutlined,
} from "@ant-design/icons";

import {
    useMemo,
    useState,
} from "react";

const { Title } = Typography;

function EmployeeSummaryTable({ rows }) {

    const { useBreakpoint } = Grid;
const screens = useBreakpoint();

    const [coordGroupFilter, setCoordGroupFilter] =
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

    const tableData = useMemo(() => {

    let result = rows.filter(
        row => row.is_dispatch_employee === true
    );

    if (coordGroupFilter !== "ALL") {

        result = result.filter(
            x =>
                x.coord_group ===
                coordGroupFilter
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

                x.district
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                x.phone
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

                    employee:
                        row.employee,

                    phone:
                        row.phone,

                    district:
                        row.district,

                    total_pending: 0,

                    total_overdue: 0,

                    overdue_5: 0,

                    completed_5_days: 0,
                };
            }

            // Tổng WO tồn
            if (row.pending) {
    grouped[key].total_pending += 1;
    if (row.overdue) {
    grouped[key]
        .total_overdue += 1;
}
}

            // Tổng WO tồn quá hạn > 5 ngày
            if (
                row.pending
                &&
                (row.overdue_day || 0) > 5
            ) {

                grouped[key]
                    .overdue_5 += 1;
            }

            // Tổng WO hoàn thành trong 5 ngày gần nhất
            if (
                row.completed
                &&
                row.close_time
            ) {

                const closeDate =
                    new Date(row.close_time);

                const now =
                    new Date();

                const diffDay = Math.floor(
    (now - closeDate) /
    (1000 * 60 * 60 * 24)
);

                if (diffDay <= 5) {

                    grouped[key]
                        .completed_5_days += 1;
                }
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
        searchText,
    ]);

    const columns = [
    { title: "STT", dataIndex: "stt", width: 50, align: "center" },
    { title: "Tỉnh", dataIndex: "province", width: 80, align: "center" },
    { title: "Nhân viên", dataIndex: "employee", width: 150 },
    {
        title: "SĐT",
        dataIndex: "phone",
        width: 120,
        align: "center",
        responsive: ['md'] // Chỉ hiện trên màn hình trung bình trở lên
    },
    {
        title: "Huyện",
        dataIndex: "district",
        width: 150,
        responsive: ['md']
    },
    { title: "Tồn", dataIndex: "total_pending", width: 80, align: "center" },
    { title: "Quá hạn", dataIndex: "total_overdue", width: 90, align: "center" },
    {
        title: ">5 ngày",
        dataIndex: "overdue_5",
        width: 90,
        align: "center",
        responsive: ['sm']
    },
    { title: "5 ngày qua", dataIndex: "completed_5_days", width: 100, align: "center" },
];

    return (
        <Card
            style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#e1f4fa",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: screens.xs ? 12 : 24 }} // Thu gọn lề trên mobile
        >
            <Title
                level={screens.xs ? 5 : 4}
                style={{
                    marginBottom: 20,
                }}
            >
                Hiệu Suất Làm Việc FT
            </Title>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 20,
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Tìm kiếm..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{
                        flex: screens.xs ? "1 1 100%" : "1 1 300px", // Chiếm 100% trên mobile, 300px trên PC
                        maxWidth: screens.xs ? "100%" : 340,
                        background: "#e1f4fa",
                        border: "1px solid #18bdf0",
                    }}
                />

                <Select
                    value={coordGroupFilter}
                    onChange={setCoordGroupFilter}
                    style={{
                        flex: screens.xs ? "1 1 100%" : "0 0 200px", // Chiếm 100% trên mobile, 200px trên PC
                        background: "#e1f4fa",
                        border: "1px solid #18bdf0",
                    }}
                >
                    {coordGroups.map(g => (
                        <Select.Option key={g} value={g}>
                            {g}
                        </Select.Option>
                    ))}
                </Select>
            </div>

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
    rowKey="key"
    columns={columns}
    dataSource={tableData}
    bordered
    size={screens.xs ? "small" : "middle"}
    pagination={{
        pageSize: screens.xs ? 5 : 12, // Thu nhỏ số dòng hiển thị trên mobile
        size: screens.xs ? "small" : "default",
        showTotal: (total) => screens.xs ? `${total}` : `Tổng ${total} dòng`,
    }}
    // Cho phép cuộn ngang linh hoạt hơn, tránh ép cứng 1200px
    scroll={{ x: screens.xs ? 600 : 'max-content' }}
/>
            </ConfigProvider>
        </Card>
    );
}

export default EmployeeSummaryTable;

