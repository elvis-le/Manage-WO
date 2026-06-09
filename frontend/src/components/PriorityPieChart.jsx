import { useMemo, useState } from "react";

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

function PriorityPieChart({ rows }) {

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
          x =>
            x.status ===
            "completed"
        ).length,
    },
    {
      name: "Đang xử lý",
      value:
        filtered.filter(
          x =>
            x.status ===
            "in_progress"
        ).length,
    },
    {
      name: "Quá hạn",
      value:
        filtered.filter(
          x =>
            x.status ===
            "overdue"
        ).length,
    },
  ];

  const total = filtered.length;

const completed = data[0].value;
const processing = data[1].value;
const overdue = data[2].value;

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
    "#52c41a",
    "#1677ff",
    "#ff4d4f",
  ];

  return (

      <Card
          bordered={false}
          style={{
            marginTop: 20,
            borderRadius: 16,
            background: "#0f172a",
            border: "1px solid #1e293b",
            boxShadow:
                "0 10px 30px rgba(0,0,0,.35)",
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
                    background: "#0f172a",
                    border:
                        "1px solid #1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#3b82f6",
                  }}
              >
                <BarChartOutlined/>
              </div>

              <div
                  style={{
                    color: "#fff",
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
                  background: "#0f172a",
                  width: 220,
                  color: "#fff"
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
                      fill="#fff"
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
            color: "#3b82f6",
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
                color: "#fff",
              }}
          >
            🟢 Đã hoàn thành
          </span>
                </Col>

                <Col>
          <span
              style={{
                color: "#94a3b8",
              }}
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
                    color: "#64748b",
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
                color: "#fff",
              }}
          >
            🔵 Đang xử lý
          </span>
                </Col>

                <Col>
          <span
              style={{
                color: "#94a3b8",
              }}
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
                    color: "#64748b",
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
              style={{
                color: "#fff",
              }}
          >
            🔴 Quá hạn SLA
          </span>
                </Col>

                <Col>
          <span
              style={{
                color: "#94a3b8",
              }}
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
                    color: "#64748b",
                    fontSize: 12,
                  }}
              >
                {overduePercent}%
              </div>
            </div>
          </Col>
        </Row>
        <div
            style={{
              marginTop: 20,
              color: "#64748b",
              fontSize: 13,
              borderTop:
                  "1px solid #1e293b",
              paddingTop: 12,
            }}
        >
          ℹ️ WO thuộc cấp độ ưu tiên càng
          nghiêm trọng càng cần xử lý khẩn
          cấp.
        </div>
      </Card>

  );

}

export default PriorityPieChart;