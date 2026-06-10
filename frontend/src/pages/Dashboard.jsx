import {useState, useMemo} from "react";

import {
    Row,
    Col,
    Card,
    Select,
    Typography,
    Space,
    Button,
} from "antd";

import {
    FilterOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

import SLAStatusChart from "../components/SLAStatusChart";
import KPICards from "../components/KPICards";
import PriorityPieChart from "../components/PriorityPieChart";
import ProvinceBarChart from "../components/ProvinceBarChart";
import EmployeeBarChart from "../components/EmployeeBarChart";
import TopProvinceChart from "../components/TopProvinceChart";
import PendingTable from "../components/PendingTable";
import FineBarChart from "../components/FineBarChar.jsx";

const {Title, Text} = Typography;

function Dashboard({
                       rows,
                   }) {

    const [month, setMonth] =
        useState("ALL");

    const [year, setYear] =
        useState("ALL");

    const [woGroup, setWoGroup] =
        useState("ALL");

    const [province, setProvince] =
        useState("ALL");

    const woGroups = useMemo(
        () => [
            "ALL",
            ...new Set(
                rows
                    .map(x => x.wo_group)
                    .filter(Boolean)
            ),
        ],
        [rows]
    );

    const provinces = useMemo(
        () => [
            "ALL",
            ...new Set(
                rows
                    .map(x => x.province)
                    .filter(Boolean)
            ),
        ],
        [rows]
    );


    const years = useMemo(() => {

        const arr =
            rows
                .filter(
                    x => x.created_time
                )
                .map(
                    x =>
                        new Date(
                            x.created_time
                        ).getFullYear()
                );

        return [
            "ALL",
            ...new Set(arr)
        ];

    }, [rows]);


    const filteredRows =
        useMemo(() => {

            let result = [...rows];

            if (
                year !== "ALL"
            ) {

                result =
                    result.filter(
                        row => {

                            if (
                                !row.created_time
                            ) return false;

                            return (
                                new Date(
                                    row.created_time
                                ).getFullYear()
                                === Number(year)
                            );

                        }
                    );
            }

            if (
                month !== "ALL"
            ) {

                result =
                    result.filter(
                        row => {

                            if (
                                !row.created_time
                            ) return false;

                            return (
                                new Date(
                                    row.created_time
                                ).getMonth() + 1
                                === Number(month)
                            );

                        }
                    );
            }

            if (woGroup !== "ALL") {

                result =
                    result.filter(
                        row =>
                            row.wo_group === woGroup
                    );

            }

            if (province !== "ALL") {

                result =
                    result.filter(
                        row =>
                            row.province === province
                    );

            }

            return result;

        }, [
            rows,
            month,
            year,
            woGroup,
            province,
        ]);

    return (

        <div
            style={{
                padding: 24,
                minHeight: "100vh",
                background:
                    "#ebf8fc",
            }}
        >


            <div
                style={{
                    marginBottom: 20,
                }}
            >

                <Title
                    level={2}
                    style={{
                        marginBottom: 0,
                    }}
                >
                    Dashboard VCC3 - Tiến độ thực hiện công việc
                </Title>

                <Text
                    style={{
                        color: "#8c8c8c",
                    }}
                >
                    Giám sát Work Order & SLA
                </Text>

            </div>


            <Card
                style={{
                    marginBottom: 20,
                    borderRadius: 16,
                    background:
                        "#ebf8fc",
                    border:
                        "1px solid #18bdf0",
                }}
                bodyStyle={{
                    padding: 20,
                }}
            >

                <Row
                    justify="space-between"
                    align="middle"
                >

                    <Col>

                        <Space size={20}>

                            <FilterOutlined
                                style={{
                                    color:
                                        "#1677ff",
                                    fontSize: 20,
                                }}
                            />

                            <div>

                                <div
                                    style={{
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    Bộ lọc hệ thống
                                </div>

                                <div
                                    style={{
                                        color:
                                            "#8c8c8c",
                                    }}
                                >
                                    Áp dụng cho toàn bộ dashboard
                                </div>

                            </div>

                        </Space>

                    </Col>

                    <Col>

                        <Space>

                            <Select
                                value={year}
                                onChange={
                                    setYear
                                }
                                style={{
                                    width: 140,
                                    background: "#ebf8fc",
                                    border: "1px solid #18bdf0"
                                }}
                            >
                                {years.map(
                                    y => (
                                        <Select.Option
                                            key={y}
                                            value={y}
                                        >
                                            {
                                                y === "ALL"
                                                    ? "Tất cả năm"
                                                    : y
                                            }
                                        </Select.Option>
                                    )
                                )}
                            </Select>

                            <Select
                                value={month}
                                onChange={
                                    setMonth
                                }
                                style={{
                                    width: 160,
                                    background: "#ebf8fc",
                                    border: "1px solid #18bdf0"
                                }}
                            >
                                <Select.Option value="ALL">
                                    Tất cả tháng
                                </Select.Option>

                                {
                                    Array.from(
                                        {
                                            length: 12,
                                        },
                                        (_, i) =>
                                            i + 1
                                    ).map(
                                        m => (
                                            <Select.Option
                                                key={m}
                                                value={String(m)}
                                            >
                                                Tháng {m}
                                            </Select.Option>
                                        )
                                    )
                                }
                            </Select>

                            <Select
                                suffixIcon={
                                    <FilterOutlined
                                        style={{
                                            color: "#94a3b8",
                                        }}
                                    />
                                }
                                value={woGroup}
                                style={{
                                    width: 220,
                                    background: "#ebf8fc",
                                    border: "1px solid #18bdf0"
                                }}
                                onChange={
                                    setWoGroup
                                }
                            >

                                {woGroups.map(
                                    g => (

                                        <Select.Option
                                            key={g}
                                            value={g}
                                        >
                                            {
                                                g === "ALL"
                                                    ? "Tất cả nhóm WO"
                                                    : g
                                            }
                                        </Select.Option>

                                    )
                                )}

                            </Select>

                            <Select
                                value={province}
                                style={{
                                    width: 180,
                                    background: "#ebf8fc",
                                    border: "1px solid #18bdf0",
                                }}
                                onChange={setProvince}
                            >

                                {provinces.map(p => (

                                    <Select.Option
                                        key={p}
                                        value={p}
                                    >
                                        {
                                            p === "ALL"
                                                ? "Tất cả tỉnh"
                                                : p
                                        }
                                    </Select.Option>

                                ))}

                            </Select>

                            <Button
                                danger

                                style={{
                                    width: 160,
                                    background: "#ebf8fc",
                                }}
                                icon={
                                    <ReloadOutlined/>
                                }
                                onClick={() => {

                                    setMonth("ALL");

                                    setYear("ALL");

                                    setWoGroup("ALL");

                                    setProvince("ALL");

                                }}
                            >
                                Reset
                            </Button>

                        </Space>

                    </Col>

                </Row>

            </Card>


            <KPICards
                rows={filteredRows}
            />


            <Row
                gutter={20}
                style={{
                    marginTop: 20,
                }}
            >
                <Col span={12}>
                    <ProvinceBarChart
                        rows={filteredRows}
                    />
                </Col>

                <Col span={12}>
                    <FineBarChart
                        rows={filteredRows}
                    />
                </Col>


                {/*<Col span={12}>
                    <SLAStatusChart
                        rows={filteredRows}
                    />
                </Col>*/}

                {/*<Col span={12}>
                    <PriorityPieChart
                        rows={filteredRows}
                    />
                </Col>*/}

            </Row>


            <Row
                gutter={20}
                style={{
                    marginTop: 20,
                }}
            >


                <Col span={12}>
                    <EmployeeBarChart
                        rows={filteredRows}
                    />
                </Col>

                <Col span={12}>
                    <TopProvinceChart
                        rows={filteredRows}
                    />
                </Col>


            </Row>


            {/*<Row*/}
            {/*    gutter={20}*/}
            {/*    style={{*/}
            {/*        marginTop: 20,*/}
            {/*    }}*/}
            {/*>*/}

            {/*    <Col span={24}>*/}
            {/*        <EmployeeBarChart*/}
            {/*            rows={filteredRows}*/}
            {/*        />*/}
            {/*    </Col>*/}

            {/*</Row>*/}


            <PendingTable
                rows={filteredRows}
            />

        </div>
    );
}

export default Dashboard;