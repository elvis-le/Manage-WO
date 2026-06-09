import {
  Card,
  Select,
  Space,
  Typography,
} from "antd";

import {
  useMemo,
  useState,
} from "react";

import {
  TrophyOutlined,
  FilterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const { Title } = Typography;

function TopProvinceChart({
  rows,
}) {

  const [metric, setMetric] =
    useState("pending");

  const [province, setProvince] =
    useState("ALL");

  const [woGroup, setWoGroup] =
    useState("ALL");

  const provinces =
    useMemo(
      () => [
        "ALL",
        ...new Set(
          rows.map(
            x => x.province
          )
        ),
      ],
      [rows]
    );

  const woGroups =
    useMemo(() => {

      const filtered =
        province === "ALL"
          ? rows
          : rows.filter(
              x =>
                x.province ===
                province
            );

      return [
        "ALL",
        ...new Set(
          filtered.map(
            x => x.wo_group
          )
        ),
      ];

    }, [
      rows,
      province,
    ]);

  const chartData =
    useMemo(() => {

      let data = [];

      if (
        province === "ALL" &&
        woGroup === "ALL"
      ) {

        const map = {};

        rows.forEach(row => {

          if (
            !map[row.province]
          ) {
            map[row.province] = [];
          }

          map[row.province].push(
            row
          );

        });

        data =
          Object.entries(
            map
          ).map(
            ([key, items]) => ({
              name: key,
              value:
                calculateMetric(
                  items,
                  metric
                ),
            })
          );

      }

      else if (
        province !== "ALL" &&
        woGroup === "ALL"
      ) {

        const map = {};

        rows
          .filter(
            x =>
              x.province ===
              province
          )
          .forEach(
            row => {

              if (
                !map[
                  row.wo_group
                ]
              ) {
                map[
                  row.wo_group
                ] = [];
              }

              map[
                row.wo_group
              ].push(row);

            }
          );

        data =
          Object.entries(
            map
          ).map(
            ([key, items]) => ({
              name: key,
              value:
                calculateMetric(
                  items,
                  metric
                ),
            })
          );

      }

      else {

        const map = {};

        rows
          .filter(
            x =>
              x.province ===
                province &&
              x.wo_group ===
                woGroup
          )
          .forEach(
            row => {

              const key =
                row.employee ||
                "Chưa gán";

              if (
                !map[key]
              ) {
                map[key] = [];
              }

              map[key].push(
                row
              );

            }
          );

        data =
          Object.entries(
            map
          ).map(
            ([key, items]) => ({
              name: key,
              value:
                calculateMetric(
                  items,
                  metric
                ),
            })
          );

      }

      return data
        .sort(
          (a, b) =>
            b.value -
            a.value
        )
        .slice(0, 10);

    }, [
      rows,
      metric,
      province,
      woGroup,
    ]);

  let title =
    "Top 10 Tỉnh";

  if (
    province !== "ALL" &&
    woGroup === "ALL"
  ) {
    title =
      `Top 10 Nhóm WO - ${province}`;
  }

  if (
    province !== "ALL" &&
    woGroup !== "ALL"
  ) {
    title =
      `Top 10 Nhân viên - ${woGroup}`;
  }

  return (

    <Card
  bordered={false}
  style={{
    marginTop: 24,
    borderRadius: 18,
    background: "#0f172a",
    border: "1px solid #1e293b",
    boxShadow:
      "0 12px 32px rgba(0,0,0,.35)",
  }}
>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}
>
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: 8,
      border:
        "1px solid #1e293b",
      background: "#020617",
      color: "#fbbf24",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <TrophyOutlined />
  </div>

  <div>
    <div
      style={{
        color: "#fff",
        fontWeight: 700,
        fontSize: 24,
      }}
    >
      Xếp hạng Top 10 Vận hành
    </div>

    <div
      style={{
        color: "#64748b",
        fontSize: 13,
      }}
    >
      Đang xếp hạng giữa các Tỉnh thành
    </div>
  </div>
</div>

        <Space wrap>

          <Select

              suffixIcon={
  <FilterOutlined
    style={{
      color: "#94a3b8",
    }}
  />
}
            value={metric}
            onChange={setMetric}
            style={{
              width: 180,
        background: "#0f172a",
        color: "#fff",
            }}
          >
            <Select.Option value="pending">
              Tồn
            </Select.Option>

            <Select.Option value="overdue">
              Quá hạn
            </Select.Option>

            <Select.Option value="ontime">
              Tỷ lệ đúng hạn
            </Select.Option>

          </Select>

          <Select
              suffixIcon={
  <FilterOutlined
    style={{
      color: "#94a3b8",
    }}
  />
}
            value={province}
            style={{
              width: 180,
        background: "#0f172a",
        color: "#fff",
            }}
            onChange={value => {

              setProvince(
                value
              );

              setWoGroup(
                "ALL"
              );

            }}
          >

            {provinces.map(
              p => (

                <Select.Option
                  key={p}
                  value={p}
                >
                  {p}
                </Select.Option>

              )
            )}

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
        background: "#0f172a",
        color: "#fff",
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
                  {g}
                </Select.Option>

              )
            )}

          </Select>

        </Space>

      </div>

        <div
            style={{
                maxHeight: 520,
                overflowY: "auto",
                paddingRight: 8,
            }}
        >
            {chartData.map(
                (item, index) => {
                    const maxValue =
                        chartData[0]?.value || 1;

                    const percent =
                        (item.value * 100) /
                        maxValue;

                    let rankColor =
                        "#64748b";

                    if (index === 0)
                        rankColor =
                            "#fbbf24";

                    if (index === 1)
                        rankColor =
                            "#94a3b8";

                    if (index === 2)
                        rankColor =
                            "#f97316";

                    return (
                        <div
                            key={item.name}
                            style={{
                                background:
                                    "#111827",
                                border:
                                    "1px solid #1e293b",
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 12,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom: 10,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius:
                                                "50%",
                                            border:
                                                `1px solid ${rankColor}`,
                                            color:
                                            rankColor,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            fontWeight: 700,
                                            fontSize: 13,
                                        }}
                                    >
                                        {index + 1}
                                    </div>

                                    <span
                                        style={{
                                            color:
                                                "#fff",
                                            fontWeight: 600,
                                        }}
                                    >
                {item.name}
              </span>
                                </div>

                                <div
                                    style={{
                                        color:
                                            "#cbd5e1",
                                        fontWeight: 600,
                                    }}
                                >
                                    {item.value}
                                    <span
                                        style={{
                                            color:
                                                "#64748b",
                                            marginLeft: 6,
                                            fontSize: 12,
                                        }}
                                    >
                WO
              </span>
                                </div>
                            </div>

                            <div
                                style={{
                                    height: 8,
                                    background:
                                        "#1e293b",
                                    borderRadius: 10,
                                    overflow:
                                        "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${percent}%`,
                                        height:
                                            "100%",
                                        background:
                                            "#0ea5e9",
                                        borderRadius: 10,
                                    }}
                                />
                            </div>
                        </div>
                    );
                }
            )}
        </div>

    </Card>

  );

}

function calculateMetric(
    items,
    metric
) {

    if (
        metric === "pending"
    ) {

        return items.filter(
            x => x.pending
        ).length;

    }

    if (
        metric === "overdue"
    ) {

        return items.filter(
            x => x.overdue
        ).length;

    }

    if (
        metric === "ontime"
    ) {

        const completed =
            items.filter(
                x => x.completed
            );

        if (
            completed.length === 0
        ) {
            return 0;
        }

        return Number(
            (
                completed.filter(
                    x => x.on_time
                ).length *
                100 /
                completed.length
            ).toFixed(2)
        );

    }

    return 0;

}

export default TopProvinceChart;