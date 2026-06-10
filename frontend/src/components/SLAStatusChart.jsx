import { Card, Statistic, Row, Col } from "antd";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

function SLAStatusChart({ rows }) {

  const totalWO = rows.length;

const completedWO =
    rows.filter(
        x => x.completed
    ).length;

const pendingWO =
    rows.filter(
        x =>
            x.pending &&
            !x.overdue
    ).length;

const overdueUnder3WO =
  rows.filter(
    x =>
      x.overdue &&
      Number(x.overdue_day || 0) <= 5
  ).length;

const overdueOver3WO =
  rows.filter(
    x =>
      x.overdue &&
      Number(x.overdue_day || 0) > 5
  ).length;

  const data = [

    {
      name: "Đã hoàn thành",
      value: completedWO,
    },

    {
      name: "Đang xử lý",
      value: pendingWO,
    },

    {
      name: "Trễ ≤ 3 ngày",
      value: overdueUnder3WO,
    },

    {
      name: "Trễ > 3 ngày",
      value: overdueOver3WO,
    },

  ];

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
  ];

  const completedRate =
    totalWO > 0
      ? (
          completedWO *
          100 /
          totalWO
        ).toFixed(1)
      : 0;

  const overdueRate =
    totalWO > 0
      ? (
          (overdueUnder3WO +
            overdueOver3WO) *
          100 /
          totalWO
        ).toFixed(1)
      : 0;

  return (

    <Card
      bordered={false}
      style={{
        marginTop: 24,
        background: "#e1f4fa",
        borderRadius: 16,
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.15)",
      }}
      bodyStyle={{
        padding: 24,
      }}
    >

      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        📊 Tổng quan Work Order
      </div>

      <Row gutter={[24, 24]}>

        {/* CHART */}

        <Col xs={24} md={10}>

          <div
            style={{
              position: "relative",
              height: 320,
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={4}
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

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform:
                  "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: 13,
                  color: "#64748b",
                }}
              >
                TỔNG WO
              </div>

              <div
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                }}
              >
                {totalWO}
              </div>

            </div>

          </div>

        </Col>

        {/* KPI */}

        <Col xs={24} md={14}>

          <Row gutter={[16, 16]}>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#ebf8fc",
                }}
              >
                <Statistic
                  title="Tổng Work Order"
                  value={totalWO}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#ebf8fc",
                }}
              >
                <Statistic
                  title="Đã hoàn thành"
                  value={completedWO}
                  valueStyle={{
                    color:
                      "#22c55e",
                  }}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#ebf8fc",
                }}
              >
                <Statistic
                  title="Đang chờ xử lý"
                  value={pendingWO}
                  valueStyle={{
                    color:
                      "#3b82f6",
                  }}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#ebf8fc",
                }}
              >
                <Statistic
                  title="Trễ ≤ 5 ngày"
                  value={overdueUnder3WO}
                  valueStyle={{
                    color:
                      "#f59e0b",
                  }}
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#ebf8fc",
                }}
              >
                <Statistic
                  title="Trễ > 5 ngày"
                  value={overdueOver3WO}
                  valueStyle={{
                    color:
                      "#ef4444",
                  }}
                />
              </Card>
            </Col>

          </Row>

          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 12,
              background: "#ebf8fc",
            }}
          >

            <div
              style={{
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Tỷ lệ hoàn thành
            </div>

            <div
              style={{
                fontSize: 28,
                color: "#22c55e",
                fontWeight: 700,
              }}
            >
              {completedRate}%
            </div>

            <div
              style={{
                marginTop: 16,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Tỷ lệ WO trễ hạn
            </div>

            <div
              style={{
                fontSize: 28,
                color: "#ef4444",
                fontWeight: 700,
              }}
            >
              {overdueRate}%
            </div>

          </div>

        </Col>

      </Row>

    </Card>

  );

}

export default SLAStatusChart;