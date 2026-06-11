import React, { useMemo, useState } from "react";

import {
    Card,
    Table,
    Select,
    Typography,
    Space,
    Tag, ConfigProvider,
} from "antd";

const { Text } = Typography;

const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};


const getLastallDays = (n = 5) => {
    const days = [];
    let date = new Date();

    while (days.length < n) {
        if (date.getDay() !== 0) {
            days.push(formatDate(new Date(date)));
        }
        date.setDate(date.getDate() - 1);
    }

    return days.reverse();
};

const UnderKPIEmployeeTable = ({ rows = [] }) => {
    const [province, setProvince] = useState("ALL");
    const [group, setGroup] = useState("ALL");


    const provinces = useMemo(() => {
        return [
            "ALL",
            ...new Set(rows.map((r) => r.province).filter(Boolean)),
        ];
    }, [rows]);

    const groups = useMemo(() => {
        return [
            "ALL",
            ...new Set(rows.map((r) => r.wo_group).filter(Boolean)),
        ];
    }, [rows]);

    const getMaxStreak = (daysMap) => {
    const sorted = Object.keys(daysMap).sort();

    let max = 0;
    let current = 0;

    for (let d of sorted) {
        const isFail = daysMap[d] < 5;

        if (isFail) {
            current += 1;
            max = Math.max(max, current);
        } else {
            current = 0;
        }
    }

    return max;
};

    const data = useMemo(() => {
        if (!rows.length) return [];

        // filter base data
        const filtered = rows.filter((r) => {
            if (!r.employee || !r.close_time || !r.completed) return false;

            if (province !== "ALL" && r.province !== province) return false;
            if (group !== "ALL" && r.wo_group !== group) return false;

            return true;
        });

        // map employee -> daily count
        const map = {};

        filtered.forEach((r) => {
            const d = formatDate(new Date(r.close_time));

            const key = `${r.employee}|${r.province}|${r.wo_group}`;

            if (!map[key]) {
                map[key] = {
                    employee: r.employee,
                    province: r.province,
                    wo_group: r.wo_group,
                    days: {},
                };
            }

            map[key].days[d] = (map[key].days[d] || 0) + 1;
        });

        const result = [];

        Object.values(map).forEach((emp) => {

    const streak = getMaxStreak(emp.days);

    // chỉ lấy người có vi phạm >= 5 ngày
    if (streak < 5) return;

    const allDates = Object.keys(emp.days).sort();

    const counts = allDates.map(d => emp.days[d]);

    const total = counts.reduce((a, b) => a + b, 0);

    const avg = total / counts.length;

    const min = Math.min(...counts);
    const max = Math.max(...counts);

    const fromDate = allDates[0];
    const toDate = allDates[allDates.length - 1];

    result.push({
        key: emp.employee,
        employee: emp.employee,
        province: emp.province,
        wo_group: emp.wo_group,

        fromDate,
        toDate,

        streak,

        avg: Number(avg.toFixed(1)),
        min,
        max,
    });
});

        // sort theo số ngày liên tiếp (desc)
        return result.sort((a, b) => b.streak - a.streak);
    }, [rows, province, group]);


    const columns = [
        {
            title: "Tên nhân viên",
            dataIndex: "employee",
        },
        {
            title: "Tỉnh",
            dataIndex: "province",
            render: (v) => <Tag color="blue">{v}</Tag>,
        },
        {
            title: "Nhóm WO",
            dataIndex: "wo_group",
            render: (v) => <Tag color="purple">{v}</Tag>,
        },
        {
            title: "Từ ngày - Đến ngày",
            render: (_, r) => (
                <Text>
                    {r.fromDate} → {r.toDate}
                </Text>
            ),
        },
        {
            title: "Số ngày liên tiếp",
            dataIndex: "streak",
            render: (v) => <Tag color="red">{v} ngày</Tag>,
            sorter: (a, b) => a.streak - b.streak,
        },
        {
            title: "Avg WO/ngày",
            dataIndex: "avg",
        },
        {
            title: "Min",
            dataIndex: "min",
        },
        {
            title: "Max",
            dataIndex: "max",
        },
    ];

    return (
        <Card
            style={{
                marginTop: 24,
                borderRadius: 16,
                background: "#e1f4fa",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
            title="🚨 Nhân viên vi phạm KPI (WO < 5 trong 5 ngày liên tiếp)"
            extra={
                <Space>
                    <Select
                        value={province}
                        style={{ width: 150 }}
                        onChange={setProvince}
                        options={provinces.map((p) => ({
                            label: p,
                            value: p,
                        }))}
                    />

                    <Select
                        value={group}
                        style={{ width: 180 }}
                        onChange={setGroup}
                        options={groups.map((g) => ({
                            label: g,
                            value: g,
                        }))}
                    />
                </Space>
            }
        >
            <div style={{ marginBottom: 12 }}>
                <Text type="secondary">
                    Tổng nhân viên vi phạm: <b>{data.length}</b>
                </Text>
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
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 10 }}
            />
</ConfigProvider>
        </Card>
    );
};

export default UnderKPIEmployeeTable;