import React, { useState } from "react";
import { Card, Row, Col, Layout } from "antd";
import moment from "moment";

import SearchFilters from "./components/SearchFilters";
import GameActivityPieChart from "./components/GameActivityPieChart";
import GameActivityBarChart from "./components/GameActivityBarChart";
import { TimePeriod } from "./types";

import "./App.scss";

import mockData from "./mock";

const { Header, Content } = Layout;

function App() {
  const [searchParams, setSearchParams] = useState({
    user: null,
    timePeriod: TimePeriod.WEEK,
    selectedGames: [],
  });
  let filteredData = searchParams.user
    ? mockData.filter((entry) => searchParams.user === entry.user)
    : mockData;

  if (searchParams.timePeriod !== TimePeriod.FOREVER) {
    const cutoffDate = moment().subtract(searchParams.timePeriod, "days");
    filteredData = filteredData.filter((entry) =>
      moment(entry.start).isAfter(cutoffDate)
    );
  }

  return (
    <Layout>
      <Header>
        <h1 style={{ color: "#fafafa" }}>Gabriel</h1>
      </Header>
      <Content
        style={{
          padding: "24px 40px",
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <SearchFilters
          data={mockData}
          value={searchParams}
          onChange={(searchParams) => setSearchParams(searchParams)}
        />
        <Row>
          <Col span={12}>
            <Card>
              <h2>Games Played</h2>
              <GameActivityPieChart
                data={filteredData}
                games={new Set(searchParams.games)}
              />
            </Card>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Card
              style={{
                height: 400,
              }}
            >
              <h2>Activity By Day</h2>
              <GameActivityBarChart
                height={400}
                data={filteredData}
                timePeriod={searchParams.timePeriod}
                games={new Set(searchParams.games)}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
