import {useState, useMemo, useEffect} from "react";
import { getWorkOrders } from "../services/dashboardService";

import {
    Row,
    Col,
    Card,
    Select,
    Typography,
    Space,
    Button, Grid,
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
import UnderperformingHorizontalBarChart from "../components/UnderperformingHorizontalBarChart.jsx";
import EmployeeSummaryTable from "../components/EmployeeSummaryTable.jsx";
import OverdueDispatchTable from "../components/OverdueDispatchTable.jsx";

const {Title, Text} = Typography;

function Dashboard() {

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getWorkOrders();

            setRows(res.data.rows || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    // Các state cũ của bạn giữ nguyên

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{padding: screens.xs ? 12 : 24, minHeight: "100vh", background: "#ebf8fc"}}>
            <div style={{marginBottom: 20}}>
                <Title level={screens.xs ? 4 : 3} style={{marginBottom: 0}}>
                    Dashboard VCC3 - Tiến độ thực hiện công việc
                </Title>
                <Text style={{color: "#8c8c8c"}}>Giám sát Work Order & SLA</Text>
            </div>

            {/* BỘ LỌC TỔNG */}
            <Card style={{marginBottom: 20, borderRadius: 16, background: "#ebf8fc", border: "1px solid #18bdf0"}}
                  bodyStyle={{padding: screens.xs ? 12 : 20}}>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={6}>
                        <Space size={16}>
                            <FilterOutlined style={{color: "#1677ff", fontSize: 20}}/>
                            <div>
                                <div style={{fontWeight: 600}}>Bộ lọc hệ thống</div>
                                <div style={{color: "#8c8c8c", fontSize: 12}}>Áp dụng toàn bộ dashboard</div>
                            </div>
                        </Space>
                    </Col>
                    <Col xs={24} lg={18} style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        justifyContent: screens.lg ? 'flex-end' : 'flex-start'
                    }}>
                        <Select value={year} onChange={setYear}
                                style={{width: screens.xs ? "100%" : 120, border: "1px solid #18bdf0"}}>
                            {years.map(y => (
                                <Select.Option key={y} value={y}>{y === "ALL" ? "Tất cả năm" : y}</Select.Option>
                            ))}
                        </Select>
                        <Select value={month} onChange={setMonth}
                                style={{width: screens.xs ? "100%" : 140, border: "1px solid #18bdf0"}}>
                            <Select.Option value="ALL">Tất cả tháng</Select.Option>
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <Select.Option key={m} value={String(m)}>Tháng {m}</Select.Option>
                            ))}
                        </Select>
                        <Select value={woGroup} onChange={setWoGroup}
                                style={{flex: "1 1 150px", border: "1px solid #18bdf0"}}>
                            {woGroups.map(g => (
                                <Select.Option key={g} value={g}>{g === "ALL" ? "Tất cả nhóm WO" : g}</Select.Option>
                            ))}
                        </Select>
                        <Select value={province} onChange={setProvince}
                                style={{flex: "1 1 150px", border: "1px solid #18bdf0"}}>
                            {provinces.map(p => (
                                <Select.Option key={p} value={p}>{p === "ALL" ? "Tất cả tỉnh" : p}</Select.Option>
                            ))}
                        </Select>
                        <Button danger icon={<ReloadOutlined/>} style={{width: screens.xs ? "100%" : "auto"}}
                                onClick={() => {
                                    setMonth("ALL");
                                    setYear("ALL");
                                    setWoGroup("ALL");
                                    setProvince("ALL");
                                }}>
                            Reset
                        </Button>
                    </Col>
                </Row>
            </Card>

            <KPICards rows={filteredRows}/>

            <Row gutter={[20, 20]} style={{marginTop: 20}}>
                <Col xs={24} lg={12}><ProvinceBarChart rows={filteredRows}/></Col>
                <Col xs={24} lg={12}><FineBarChart rows={filteredRows}/></Col>
            </Row>

            <Row gutter={[20, 20]} style={{marginTop: 20}}>
                <Col xs={24} lg={12}><TopProvinceChart rows={filteredRows}/></Col>
                <Col xs={24} lg={12}><EmployeeBarChart rows={filteredRows}/></Col>
            </Row>

            {/* BỌC TABLE BẰNG DIV OVERFLOW */}
            <div style={{overflowX: "hidden", marginTop: 20, width: "100%"}}>
                <PendingTable rows={filteredRows}/>
            </div>

            <Row gutter={[20, 20]} style={{marginTop: 20}}>
                <Col xs={24} lg={12}><UnderperformingHorizontalBarChart rows={filteredRows}/></Col>
                <Col xs={24} lg={12}><EmployeeSummaryTable rows={filteredRows}/></Col>
            </Row>
        </div>
    );
};

export default Dashboard;