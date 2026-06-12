import {
  Card,
  Col,
  Row,
  Statistic,
    Grid,
} from "antd";

import {
  InboxOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  FileDoneOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";

function KPICards({ rows }) {

    const { useBreakpoint } = Grid;

const screens = useBreakpoint();

  const totalAll =
  rows.length;

const pendingWO =
  rows.filter(
    x => x.pending
  ).length;

const overdueWO =
  rows.filter(
    x => x.overdue
  ).length;

const nearDueWO =
  rows.filter(
    x => x.near_due
  ).length;

const completedWO =
  rows.filter(
    x => x.completed
  ).length;

const completedTodayWO =
  rows.filter(
    x => x.completed_today
  ).length;

console.log(rows[0]);
console.log(
  rows.filter(x => x.completed_today)
);
console.log("complete today:" + completedTodayWO);

const onTimeCompleted =
  rows.filter(
    x => x.on_time
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

const percent = value =>
  totalAll > 0
    ? (
        value *
        100 /
        totalAll
      ).toFixed(1)
    : "0.0";

 const cards = [

  {
    title: "Tổng WO",
    value: totalAll,
    percent: "100",
    color: "#1677ff",
    icon: <DeploymentUnitOutlined />,
  },

  {
    title: "WO Đang Tồn",
    value: pendingWO,
    percent: percent(pendingWO),
    color: "#52c41a",
    icon: <InboxOutlined />,
  },

  {
    title: "WO Quá Hạn",
    value: overdueWO,
    percent: percent(overdueWO),
    color: "#ff4d4f",
    icon: <WarningOutlined />,
  },

  {
    title: "Sắp Quá Hạn",
    value: nearDueWO,
    percent: percent(nearDueWO),
    color: "#faad14",
    icon: <ClockCircleOutlined />,
  },

  {
    title: "WO Hoàn Thành",
    value: completedWO,
    percent: percent(completedWO),
    color: "#13c2c2",
    icon: <CheckCircleOutlined />,
  },

  {
    title: "Hoàn Thành Hôm Nay",
    value: completedTodayWO,
    percent: percent(completedTodayWO),
    color: "#08979c",
    icon: <CheckCircleOutlined />,
  },

  {
  title: "Quá Hạn ≤ 5 Ngày",
  value: overdueUnder3WO,
  percent: percent(overdueUnder3WO),
  color: "#fa8c16",
  icon: <WarningOutlined />,
},

{
  title: "Quá Hạn > 5 Ngày",
  value: overdueOver3WO,
  percent: percent(overdueOver3WO),
  color: "#cf1322",
  icon: <WarningOutlined />,
},

];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              minHeight: screens.xs ? 120 : 135, // Giảm chiều cao tối thiểu trên điện thoại
              height: "100%",
              borderRadius: 16,
              border: "1px solid #d9f2ff",
              background: "#ebf8fc",
              boxShadow: "0 6px 16px rgba(0,0,0,.08)",
            }}
            bodyStyle={{
              padding: screens.xs ? 16 : 20, // Thu nhỏ lề trong (padding) trên mobile
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "100%",
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: screens.xs ? 13 : 14, // Nhỏ font chữ tiêu đề lại 1 xíu trên mobile
                    color: "#666",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {card.title}
                </div>

                <Statistic
                  value={card.value}
                  suffix={card.suffix}
                  valueStyle={{
                    color: card.color,
                    fontWeight: 700,
                    fontSize: screens.xs ? 22 : 26, // Chỉnh lại font size số đếm cho hài hòa
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: screens.xs ? 36 : 42, // Thu nhỏ vòng tròn icon
                    height: screens.xs ? 36 : 42,
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: card.color,
                    fontSize: screens.xs ? 20 : 24, // Thu nhỏ icon
                  }}
                >
                  {card.icon}
                </div>

                <span
                  style={{
                    color: card.color,
                    fontSize: screens.xs ? 14 : 18, // Thu nhỏ %
                    fontWeight: 700,
                  }}
                >
                  {card.percent}%
                </span>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

}

export default KPICards;