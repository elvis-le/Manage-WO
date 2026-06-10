import {useMemo, useState} from "react";

import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    Cell,
    ResponsiveContainer,
} from "recharts";

import {
    Card,
    Select,
    Row,
    Col,
    Progress,
    Tag,
} from "antd";

import {
    BarChartOutlined,
} from "@ant-design/icons";

function PriorityPieChart({rows}) {

    const priorities = useMemo(
        () => [
            "ALL",
            ...new Set(
                rows.map(
                    x => x.priority
                )
            ),
        ],
        [rows]
    );

    const [priority, setPriority] =
        useState("ALL");

    const filtered =
        priority === "ALL"
            ? rows
            : rows.filter(
                x =>
                    x.priority ===
                    priority
            );

    const data = [
    {
        name: "Hoàn thành",
        value:
            filtered.filter(
                x => x.completed
            ).length,
    },
    {
        name: "Đang tồn",
        value:
            filtered.filter(
                x =>
                    x.pending &&
                    !x.overdue &&
                    !x.near_due
            ).length,
    },
    {
        name: "Sắp quá hạn",
        value:
            filtered.filter(
                x => x.near_due
            ).length,
    },
    {
        name: "Quá hạn",
        value:
            filtered.filter(
                x => x.overdue
            ).length,
    },
];

    const total = filtered.length;

    const completed = data[0].value;
const processing = data[1].value;
const nearDue = data[2].value;
const overdue = data[3].value;

    const completedPercent =
        total > 0
            ? Number(
                (
                    (completed / total) *
                    100
                ).toFixed(1)
            )
            : 0;

    const processingPercent =
        total > 0
            ? Number(
                (
                    (processing / total) *
                    100
                ).toFixed(1)
            )
            : 0;

const nearDuePercent =
    total > 0
        ? Number(
            (
                nearDue /
                total *
                100
            ).toFixed(1)
        )
        : 0;

    const overduePercent =
        total > 0
            ? Number(
                (
                    (overdue / total) *
                    100
                ).toFixed(1)
            )
            : 0;

    const COLORS = [
    "#19ba07", // hoàn thành
    "#7cb3f2", // đang tồn
    "#faad14", // sắp quá hạn
    "#fa6675", // quá hạn
];
    return (

        <Card
            bordered={false}
            style={{
                marginTop: 20,
                borderRadius: 16,
                background: "#e1f4fa",
                boxShadow:
                    "0 10px 30px rgba(0,0,0,.15)",
            }}
        >

            <Row
                justify="space-between"
                align="middle"
                style={{
                    marginBottom: 20,
                }}
            >

                <Col>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "#e1f4fa",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#7cb3f2",
                            }}
                        >
                            <BarChartOutlined/>
                        </div>

                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 600,
                            }}
                        >
                            Phân tích mức độ ưu tiên
                        </div>
                    </div>

                </Col>

                <Col>

                    <Select
                        value={priority}
                        onChange={setPriority}
                        style={{
                            background: "#e1f4fa",
                            width: 220,
                            border: "1px solid #18bdf0"
                        }}
                        options={
                            priorities.map(
                                p => ({
                                    label:
                                        p === "ALL"
                                            ? "Tất cả"
                                            : p,
                                    value: p,
                                })
                            )
                        }
                    />

                </Col>

            </Row>

            <Row gutter={24}>
                <Col xs={24} md={10}>
                    <div
                        style={{
                            position: "relative",
                            height: 320,
                        }}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={2}
                                >
                                    {data.map(
                                        (_, index) => (
                                            <Cell
                                                key={index}
                                                fill={
                                                    COLORS[index]
                                                }
                                            />
                                        )
                                    )}
                                </Pie>

                                <Tooltip/>

                                <text
                                    x="50%"
                                    y="46%"
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    Tổng WO
                                </text>

                                <text
                                    x="50%"
                                    y="55%"
                                    textAnchor="middle"
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                    }}
                                >
                                    {total}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* RIGHT */}
                <Col xs={24} md={14}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 20,
                        }}
                    >
      <span
          style={{
              color: "#7cb3f2",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 1,
          }}
      >
        ĐỘ PHÂN BỔ
      </span>

                            <Tag color="blue">
                            MỌI CẤP
                        </Tag>
                    </div>

                    {/* Completed */}
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Row justify="space-between">
                            <Col>
          <span
              style={{
            color: "#19ba07",
              }}
          >
            🟢 Đã hoàn thành
          </span>
                            </Col>

                            <Col>
          <span
          >
            {completed} WO
          </span>
                            </Col>
                        </Row>

                        <Progress
                            percent={completedPercent}
                            showInfo={false}
                            strokeColor="#21c77a"
                            trailColor="#1e293b"
                        />

                        <div
                            style={{
                                textAlign: "right",
                                fontSize: 12,
                            }}
                        >
                            {completedPercent}%
                        </div>
                    </div>

                    {/* Processing */}
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Row justify="space-between">
                            <Col>
          <span
              style={{
            color: "#7cb3f2",
              }}
          >
            🔵 Đang xử lý
          </span>
                            </Col>

                            <Col>
          <span
          >
            {processing} WO
          </span>
                            </Col>
                        </Row>

                        <Progress
                            percent={processingPercent}
                            showInfo={false}
                            strokeColor="#3b82f6"
                            trailColor="#1e293b"
                        />

                        <div
                            style={{
                                textAlign: "right",
                                fontSize: 12,
                            }}
                        >
                            {processingPercent}%
                        </div>
                    </div>

                    {/* Overdue */}
                    <div>
                        <Row justify="space-between">
                            <Col>
          <span
          >
            🔴 Quá hạn SLA
          </span>
                            </Col>

                            <Col>
          <span
          >
            {overdue} WO
          </span>
                            </Col>
                        </Row>

                        <Progress
                            percent={overduePercent}
                            showInfo={false}
                            strokeColor="#ff4d4f"
                            trailColor="#1e293b"
                        />

                        <div
                            style={{
                                textAlign: "right",
                                fontSize: 12,
                            }}
                        >
                            {overduePercent}%
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>

    );

}

export default PriorityPieChart;