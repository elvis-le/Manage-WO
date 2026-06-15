import { useState, useMemo, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Space, Button, Spin, Select } from "antd";

import {
    FilterOutlined,
    SettingOutlined,
    LogoutOutlined,
} from "@ant-design/icons";

import KPICards from "../components/KPICards";
import ProvinceBarChart from "../components/ProvinceBarChart";
import EmployeeBarChart from "../components/EmployeeBarChart";
import TopProvinceChart from "../components/TopProvinceChart";
import PendingTable from "../components/PendingTable";
import FineBarChart from "../components/FineBarChar.jsx";
import UnderperformingHorizontalBarChart from "../components/UnderperformingHorizontalBarChart.jsx";
import EmployeeSummaryTable from "../components/EmployeeSummaryTable.jsx";
import OverdueDispatchTable from "../components/OverdueDispatchTable.jsx";

const { Title, Text } = Typography;

function Dashboard() {
    const navigate = useNavigate();

    
    const { user, logout } = useContext(AuthContext);
    const { rows, productivityData, loadingData } = useContext(DataContext);

    
    const [year, setYear] = useState("ALL");
    const [month, setMonth] = useState("ALL");
    const [province, setProvince] = useState("ALL");
    const [woGroup, setWoGroup] = useState("ALL");

    
    const parseDateHelper = (createdAt) => {
        if (!createdAt) return { yearStr: null, monthStr: null };
        const str = String(createdAt).trim();

        
        const datePart = str.split('T')[0].split(' ')[0];

        
        const separator = datePart.includes('/') ? '/' : (datePart.includes('-') ? '-' : null);

        if (separator) {
            const parts = datePart.split(separator);
            if (parts.length >= 3) {
                
                let y = parts.find(p => p.length === 4);
                
                let m = parts[1];

                
                if (!y) {
                    y = parts[2].length === 2 ? `20${parts[2]}` : parts[0];
                }

                if (y && m) {
                    return {
                        yearStr: y.toString(),
                        monthStr: parseInt(m, 10).toString()
                    };
                }
            }
        }

        
        const dateObj = new Date(createdAt);
        if (!isNaN(dateObj.getTime())) {
            return {
                yearStr: dateObj.getFullYear().toString(),
                monthStr: (dateObj.getMonth() + 1).toString()
            };
        }

        return { yearStr: null, monthStr: null };
    };

    
    const listYears = useMemo(() => {
        const years = rows.map(x => parseDateHelper(x.created_time).yearStr).filter(Boolean);
        return ["ALL", ...new Set(years)].sort((a, b) => b - a);
    }, [rows]);

    
    const listMonths = useMemo(() => {
        const months = rows.map(x => parseDateHelper(x.created_time).monthStr).filter(Boolean);
        return ["ALL", ...new Set(months)].sort((a, b) => a - b);
    }, [rows]);

    
    const listProvinces = useMemo(() => {
        const provinces = rows.map(x => x.province).filter(Boolean);
        return ["ALL", ...new Set(provinces)].sort();
    }, [rows]);

    
    const listWoGroups = useMemo(() => {
        const groups = rows.map(x => x.wo_group).filter(Boolean);
        return ["ALL", ...new Set(groups)].sort();
    }, [rows]);

    
    const filteredRows = useMemo(() => {
        return rows.filter(x => {
            const { yearStr, monthStr } = parseDateHelper(x.created_time);

            if (year !== "ALL" && yearStr !== year) return false;
            if (month !== "ALL" && monthStr !== month) return false;
            if (province !== "ALL" && x.province !== province) return false;
            if (woGroup !== "ALL" && x.wo_group !== woGroup) return false;

            return true;
        });
    }, [rows, year, month, province, woGroup]);

    if (loadingData && rows.length === 0) {
        return (
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ebf8fc", 
                zIndex: 9999
            }}>
                <Spin size="large" description="Đang tải dữ liệu hệ thống..." />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", background: "#f0f2f5", minHeight: "100vh" }}>
            <Card style={{ marginBottom: 20 }}>
                {/* Thanh tiêu đề & Thông tin tài khoản */}
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Title level={4} style={{ margin: 0, paddingBottom: 4 }}>
                            Hệ Thống Giám Sát Work Order
                        </Title>
                        {user && (
                            <Text type="secondary">
                                Tài khoản: <strong style={{ color: "#1677ff" }}>{user.name || user.username}</strong>
                            </Text>
                        )}
                    </Col>
                    <Col xs={24} sm={12} style={{ textAlign: "right" }}>
                        <Space>
                            <Button
                                icon={<SettingOutlined />}
                                onClick={() => navigate("/settings")}
                            >
                                Cấu hình
                            </Button>
                            <Button
                                type="primary"
                                danger
                                icon={<LogoutOutlined />}
                                onClick={logout}
                            >
                                Đăng xuất
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Khu vực chứa 4 bộ lọc đồng bộ */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
                    <Row gutter={[16, 16]} align="bottom">
                        <Col xs={12} sm={6} md={4}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>Năm:</Text>
                            <Select
                                style={{ width: "100%" }}
                                value={year}
                                onChange={setYear}
                                options={listYears.map(y => ({
                                    label: y === "ALL" ? "Tất cả" : `Năm ${y}`,
                                    value: y
                                }))}
                            />
                        </Col>

                        <Col xs={12} sm={6} md={4}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>Tháng:</Text>
                            <Select
                                style={{ width: "100%" }}
                                value={month}
                                onChange={setMonth}
                                options={listMonths.map(m => ({
                                    label: m === "ALL" ? "Tất cả" : `Tháng ${m}`,
                                    value: m
                                }))}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>Tỉnh / Thành phố:</Text>
                            <Select
                                style={{ width: "100%" }}
                                value={province}
                                onChange={setProvince}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={listProvinces.map(p => ({
                                    label: p === "ALL" ? "-- Tất cả Tỉnh/Thành --" : p,
                                    value: p
                                }))}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>Nhóm Work Order:</Text>
                            <Select
                                style={{ width: "100%" }}
                                value={woGroup}
                                onChange={setWoGroup}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={listWoGroups.map(g => ({
                                    label: g === "ALL" ? "-- Tất cả Nhóm WO --" : g,
                                    value: g
                                }))}
                            />
                        </Col>

                        <Col xs={24} sm={24} md={4}>
                            <Button
                                block
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setYear("ALL");
                                    setMonth("ALL");
                                    setProvince("ALL");
                                    setWoGroup("ALL");
                                }}
                            >
                                Đặt lại bộ lọc
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* Trạng thái Spinner khi Context đang tải dữ liệu */}
            {/*<Spin spinning={loadingData} description="Hệ thống đang tải dữ liệu thời gian thực..." size="large">*/}
                <KPICards rows={filteredRows} />

                <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                    <Col xs={24} lg={12}>
                        <ProvinceBarChart rows={filteredRows} />
                    </Col>
                    <Col xs={24} lg={12}>
                        <FineBarChart rows={filteredRows} />
                    </Col>
                </Row>

                <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                    <Col xs={24} lg={12}>
                        <TopProvinceChart rows={filteredRows} />
                    </Col>
                    <Col xs={24} lg={12}>
                        <EmployeeBarChart rows={filteredRows} />
                    </Col>
                </Row>

                <div style={{ overflowX: "hidden", marginTop: 20, width: "100%" }}>
                    <PendingTable rows={filteredRows} />
                </div>

                <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                    <Col xs={24} lg={24}>
                        <UnderperformingHorizontalBarChart rows={filteredRows} />
                    </Col>
                    {/*<Col xs={24} lg={12}>*/}
                    {/*    <OverdueDispatchTable rows={filteredRows} />*/}
                    {/*</Col>*/}
                </Row>

                <div style={{ marginTop: 20 }}>
                    <EmployeeSummaryTable rows={filteredRows} />
                </div>
            {/*</Spin>*/}
        </div>
    );
}

export default Dashboard;