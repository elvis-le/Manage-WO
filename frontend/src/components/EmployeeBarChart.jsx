import {
  Card,
  Select,
} from "antd";

import {
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function EmployeeBarChart({
  rows,
}) {

  const provinces = useMemo(
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

  const [province, setProvince] =
    useState("ALL");

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

  const [group, setGroup] =
    useState("ALL");

  const filteredRows =
    rows.filter(row => {

      const provinceMatch =
        province === "ALL"
          ? true
          : row.province === province;

      const groupMatch =
        group === "ALL"
          ? true
          : row.wo_group === group;

      return (
        provinceMatch &&
        groupMatch
      );

    });

  const chartData =
    useMemo(() => {

      const result = {};

      if (group === "ALL") {

        filteredRows.forEach(row => {

          const key =
            row.wo_group;

          if (!result[key]) {

            result[key] = {
              name: key,
              completed: 0,
              processing: 0,
              overdue: 0,
            };

          }

          switch (row.status) {
  case "completed":
    result[key].completed++;
    break;

  case "overdue":
    result[key].overdue++;
    break;

  case "in_progress":
    result[key].processing++;
    break;

  default:
    result[key].processing++;
    break;
}

        });

      }
      else {

        filteredRows.forEach(row => {

          const key =
            row.employee ||
            "Chưa gán";

          if (!result[key]) {

            result[key] = {
              name: key,
              completed: 0,
              processing: 0,
              overdue: 0,
            };

          }

          if (row.overdue) {

            result[key].overdue++;

          }
          else if (
            row.completed
          ) {

            result[key].completed++;

          }
          else {

            result[key].processing++;

          }

        });

      }

      return Object.values(
        result
      );

    }, [
      filteredRows,
      group,
    ]);

  return (

    <Card
      style={{
        marginTop: 24,
        borderRadius: 16,
          background: "#0f172a",
          color: "#fff",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.08)",
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

        <div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            👨‍💻 Thống kê Nhóm WO / Nhân viên
          </div>

          <div
            style={{
              color: "#888",
              marginTop: 4,
            }}
          >
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >

          <Select
            value={province}
            style={{
              width: 180,
        background: "#0f172a",
        color: "#fff",
            }}
            onChange={(value) => {

              setProvince(
                value
              );

              setGroup(
                "ALL"
              );

            }}
          >

            {provinces.map(p => (

              <Select.Option
                key={p}
                value={p}
              >
                {p}
              </Select.Option>

            ))}

          </Select>

          <Select
            value={group}
            style={{
              width: 220,
        background: "#0f172a",
        color: "#fff",
            }}
            onChange={
              setGroup
            }
          >

            {woGroups.map(g => (

              <Select.Option
                key={g}
                value={g}
              >
                {g}
              </Select.Option>

            ))}

          </Select>

        </div>

      </div>

      <ResponsiveContainer
        width="100%"
        height={450}
      >

        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            angle={-25}
            textAnchor="end"
            interval={0}
            height={70}
          />

          <YAxis />

          <Tooltip />

          <Legend
                        align="center"
                        iconType="circle"
                        wrapperStyle={{
                            color: "#fff",
                            fontWeight: 600,
                            paddingBottom: 20,
                        }}
                    />


          <Bar
                        dataKey="completed"
                        stackId="a"
                        name="Đã hoàn thành"
                        fill="#1fc48d"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="processing"
                        stackId="a"
                        name="Đang xử lý"
                        fill="#4285f4"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="overdue"
                        stackId="a"
                        name="Quá hạn trễ"
                        fill="#ff4d57"
                        radius={[4, 4, 0, 0]}
                    />

        </BarChart>

      </ResponsiveContainer>

    </Card>

  );

}

export default EmployeeBarChart;