import { useState, useMemo } from "react";

import {
  Row,
  Col,
  Card,
  Select,
  Typography,
  Space,
  Button,
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

const { Title, Text } = Typography;

function Dashboard({
  rows,
}) {

  const [month, setMonth] =
    useState("ALL");

  const [year, setYear] =
    useState("ALL");

  const [woGroup, setWoGroup] =
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

      return result;

    }, [
  rows,
  month,
  year,
  woGroup,
    ]);

  return (

    <div
      style={{
        padding: 24,
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#070b14 0%,#0c111d 100%)",
      }}
    >

      

      <div
        style={{
          marginBottom: 20,
        }}
      >

        <Title
          level={2}
          style={{
            color: "#fff",
            marginBottom: 0,
          }}
        >
          Dashboard NOC
        </Title>

        <Text
          style={{
            color: "#8c8c8c",
          }}
        >
          Giám sát Work Order & SLA
        </Text>

      </div>

      

      <Card
        style={{
          marginBottom: 20,
          borderRadius: 16,
          background:
            "#111827",
          border:
            "1px solid #1f2937",
        }}
        bodyStyle={{
          padding: 20,
        }}
      >

        <Row
          justify="space-between"
          align="middle"
        >

          <Col>

            <Space size={20}>

              <FilterOutlined
                style={{
                  color:
                    "#1677ff",
                  fontSize: 20,
                }}
              />

              <div>

                <div
                  style={{
                    color:
                      "#fff",
                    fontWeight:
                      600,
                  }}
                >
                  Bộ lọc hệ thống
                </div>

                <div
                  style={{
                    color:
                      "#8c8c8c",
                  }}
                >
                  Áp dụng cho toàn bộ dashboard
                </div>

              </div>

            </Space>

          </Col>

          <Col>

            <Space>

              <Select
                value={year}
                onChange={
                  setYear
                }
                style={{
                  width: 140,
        background: "#0f172a",
        color: "#fff",
                }}
              >
                {years.map(
                  y => (
                    <Select.Option
                      key={y}
                      value={y}
                    >
                      {
                        y === "ALL"
                          ? "Tất cả năm"
                          : y
                      }
                    </Select.Option>
                  )
                )}
              </Select>

              <Select
                value={month}
                onChange={
                  setMonth
                }
                style={{
                  width: 160,
        background: "#0f172a",
        color: "#fff",
                }}
              >
                <Select.Option value="ALL">
                  Tất cả tháng
                </Select.Option>

                {
                  Array.from(
                    {
                      length: 12,
                    },
                    (_, i) =>
                      i + 1
                  ).map(
                    m => (
                      <Select.Option
                        key={m}
                        value={String(m)}
                      >
                        Tháng {m}
                      </Select.Option>
                    )
                  )
                }
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

              <Button
                danger

                style={{
                  width: 160,
        background: "#0f172a",
                }}
                icon={
                  <ReloadOutlined />
                }
                onClick={() => {

  setMonth("ALL");

  setYear("ALL");

  setWoGroup("ALL");

}}
              >
                Reset
              </Button>

            </Space>

          </Col>

        </Row>

      </Card>

      

      <KPICards
        rows={filteredRows}
      />

      

      <Row
        gutter={20}
        style={{
          marginTop: 20,
        }}
      >

        <Col span={12}>
          <SLAStatusChart
            rows={filteredRows}
          />
        </Col>

        <Col span={12}>
          <PriorityPieChart
            rows={filteredRows}
          />
        </Col>

      </Row>

      

      <Row
        gutter={20}
        style={{
          marginTop: 20,
        }}
      >

        <Col span={12}>
          <ProvinceBarChart
            rows={filteredRows}
          />
        </Col>


        <Col span={12}>
          <TopProvinceChart
            rows={filteredRows}
          />
        </Col>


      </Row>

      

      <Row
        gutter={20}
        style={{
          marginTop: 20,
        }}
      >

           <Col span={24}>
          <EmployeeBarChart
            rows={filteredRows}
          />
        </Col>

      </Row>

      

      <PendingTable
        rows={filteredRows}
      />

    </div>
  );
}

export default Dashboard;