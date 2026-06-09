import {
    Card,
    Col,
    Row,
    Statistic,
} from "antd";

import {
    InboxOutlined,
    WarningOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
} from "@ant-design/icons";

function KPICards({rows}) {

    const totalWO =
        rows.filter(
            x => !x.completed
        ).length;

    const overdue =
        rows.filter(
            x => x.overdue
        ).length;

    const nearDue =
        rows.filter(
            x => x.near_due
        ).length;

    const completedToday =
        rows.filter(
            x => x.completed_today
        ).length;

    const completed =
        rows.filter(
            x => x.completed
        ).length;

    const onTimeCompleted =
        rows.filter(
            x => x.on_time
        ).length;

    const ontimeRate =
        completed > 0
            ? (
                onTimeCompleted * 100 /
                completed
            ).toFixed(2)
            : 0;

    const cards = [
        {
            title: "WO Đang Tồn",
            value: totalWO,
            color: "#7cb3f2",
            bg: "#eef6ff",
            icon: <InboxOutlined/>,
        },
        {
            title: "WO Quá Hạn",
            value: overdue,
            color: "#fa6675",
            bg: "#fff2f0",
            icon: <WarningOutlined/>,
        },
        {
            title: "Sắp Quá Hạn",
            value: nearDue,
            color: "#fcef86",
            bg: "#fff7e6",
            icon: <ClockCircleOutlined/>,
        },
        {
            title: "Hoàn Thành Hôm Nay",
            value: completedToday,
            color: "#99f794",
            bg: "#f6ffed",
            icon: <CheckCircleOutlined/>,
        },
        {
            title: "Đúng Hạn",
            value: ontimeRate,
            suffix: "%",
            color: "#cf93f5",
            bg: "#f9f0ff",
            icon: <TrophyOutlined/>,
        },
    ];

    return (

        <Row gutter={[20, 20]}>

            {cards.map(card => (

                <Col
                    flex="1"
                >

                    <Card
                        hoverable
                        style={{
                            borderRadius: 16,
                            border: "none",
                            background: "#0f172a",
                            color: "#fff",
                            boxShadow:
                                "0 6px 18px rgba(0,0,0,0.08)",
                        }}
                        bodyStyle={{
                            padding: 20,
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >

                            <div>

                                <div
                                    style={{
                                        color: card.color,
                                        fontSize: 14,
                                        marginBottom: 8,
                                    }}
                                >
                                    {card.title}
                                </div>

                                <Statistic
                                    value={card.value}
                                    suffix={card.suffix}
                                    styles={{
                                        content: {
                                            color: card.color,
                                        }
                                    }}
                                />

                            </div>

                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "#0f172a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 28,
                                    color: card.color,
                                }}
                            >
                                {card.icon}
                            </div>

                        </div>

                    </Card>

                </Col>

            ))}

        </Row>

    );
}

export default KPICards;