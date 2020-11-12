import React, { useState } from 'react';
import { Card, Row, Col, Layout } from 'antd';
import moment from 'moment';

import SearchFilters from './components/SearchFilters';
import GameActivityPieChart from './components/GameActivityPieChart';
import GameActivityBarChart from './components/GameActivityBarChart';
import ActivePlaytimeChart from './components/ActivePlaytimeChart';
import { TimePeriod } from './types';
import { dateFormat } from './utils';

import './App.scss';

import mockData from './mock';

const { Header, Content } = Layout;

function App() {
  const now = moment(); // use to mock the current date for older data
  const [searchParams, setSearchParams] = useState({
    user: null,
    timePeriod: TimePeriod.WEEK,
    games: [],
  });

  const { games, timePeriod, user } = searchParams;

  let filteredData = user ? mockData.filter((entry) => user === entry.user) : mockData;

  if (timePeriod !== TimePeriod.FOREVER) {
    const cutoffDate = now.clone().subtract(timePeriod, 'days');
    filteredData = filteredData.filter((entry) =>
      moment(entry.start, dateFormat).isAfter(cutoffDate),
    );
  }

  if (games.length > 0) {
    const gameSet = new Set(games);
    filteredData = filteredData.filter(({ game }) => {
      if (gameSet.size === 0) {
        return true;
      }
      return gameSet.has(game);
    });
  }

  return (
    <Layout>
      <Header>
        <h1 style={{ color: '#fafafa' }}>Gabriel</h1>
      </Header>
      <Content
        style={{
          padding: '24px 40px',
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <SearchFilters
          data={mockData}
          value={searchParams}
          onChange={(searchParams) => setSearchParams(searchParams)}
        />
        <Row>
          <Col span={12}>
            <Card style={{ height: 330 }}>
              <h2>Games Played</h2>
              <GameActivityPieChart data={filteredData} />
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ height: 330 }}>
              <h2>Activity Trend</h2>
              <ActivePlaytimeChart data={filteredData} timePeriod={timePeriod} />
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
                timePeriod={timePeriod}
                games={new Set(games)}
                now={now}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
