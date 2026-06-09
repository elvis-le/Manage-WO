import { Card, Progress, Statistic, Row, Col, Tag } from "antd";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function SLAStatusChart({ rows }) {
  const overdue = rows.filter(x => x.overdue).length;

  const nearDue = rows.filter(x => x.near_due).length;

  const onTime = rows.filter(
    x => !x.overdue && !x.near_due
  ).length;

  const total = rows.length;

  const slaPercent =
    total > 0
      ? ((onTime / total) * 100).toFixed(1)
      : 0;

  const overduePercent =
    total > 0
      ? ((overdue / total) * 100).toFixed(1)
      : 0;

  const data = [
    {
      name: "Đúng hạn",
      value: onTime,
    },
    {
      name: "Sắp quá hạn",
      value: nearDue,
    },
    {
      name: "Quá hạn",
      value: overdue,
    },
  ];

  const COLORS = [
    "#21c77a",
    "#f5a623",
    "#ff4d4f",
  ];

  return (
    <Card
      bordered={false}
      style={{
        background: "#0f172a",
        borderRadius: 16,
        color: "#fff",
      }}
      bodyStyle={{
        padding: 24,
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        📊 Giám sát trạng thái SLA
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT */}
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
                  innerRadius={85}
                  outerRadius={120}
                  paddingAngle={3}
                >
                  {data.map((item, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
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
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                SLA ĐẠT
              </div>

              <div
                style={{
                  color: "#fff",
                  fontSize: 38,
                  fontWeight: 700,
                }}
              >
                {slaPercent}%
              </div>

              {slaPercent < 95 && (
                <Tag color="red">
                  CẢNH BÁO
                </Tag>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Tag color="green">
              Đúng hạn ({onTime})
            </Tag>

            <Tag color="gold">
              Sắp quá hạn ({nearDue})
            </Tag>

            <Tag color="red">
              Quá hạn ({overdue})
            </Tag>
          </div>
        </Col>

        {/* RIGHT */}
        <Col xs={24} md={14}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#111827",
                  color: "#fff",
                }}
              >
                <Statistic
  title={
    <span
      style={{
        color: "#fff",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      Tổng Work Order
    </span>
  }
  value={total}
  valueStyle={{
    color: "#fff",
  }}
/>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#111827",
                }}
              >

                  <Statistic
  title={
    <span
      style={{
        color: "#21c77a",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      Đã hoàn thành
    </span>
  }
  value={onTime}
  valueStyle={{
    color: "#21c77a",
  }}
/>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#111827",
                }}
              >
                  <Statistic
  title={
    <span
      style={{
        color: "#f5a623",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      Đang chờ / xử lý
    </span>
  }
  value={nearDue}
  valueStyle={{
    color: "#f5a623",
  }}
/>

              </Card>
            </Col>

            <Col span={12}>
              <Card
                bordered={false}
                style={{
                  background:
                    "#111827",
                }}
              >
                  <Statistic
  title={
    <span
      style={{
        color: "#ff4d4f",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      Trễ / Quá hạn
    </span>
  }
  value={overdue}
  valueStyle={{
    color: "#ff4d4f",
  }}
/>
              </Card>
            </Col>
          </Row>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "#111827",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                color: "#cbd5e1",
                marginBottom: 10,
              }}
            >
              Chỉ số đúng hạn
              (Kế hoạch {slaPercent}%)
            </div>

            <Progress
              percent={Number(
                slaPercent
              )}
              strokeColor="#21c77a"
              trailColor="#334155"
              showInfo
            />

            <div
              style={{
                marginTop: 18,
                color: "#cbd5e1",
                marginBottom: 10,
              }}
            >
              Tỷ lệ tồn đọng xử lý ({overduePercent}%)
            </div>

            <Progress
              percent={Number(
                overduePercent
              )}
              strokeColor="#ff4d4f"
              trailColor="#334155"
              showInfo
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default SLAStatusChart;