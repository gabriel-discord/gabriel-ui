import React, { useState } from 'react';
import { Card, Row, Col, Layout } from 'antd';
import moment from 'moment';

import SearchFilters from './components/SearchFilters';
import GameActivityPieChart from './components/GameActivityPieChart';
import GameActivityBarChart from './components/GameActivityBarChart';
import ActivePlaytimeChart from './components/ActivePlaytimeChart';
import GameDetails from './components/GameDetails';
import { TimePeriod } from './types';
import { dateFormat } from './utils';

import logo from './icon.png';

import './App.scss';

import mockData from './mock';

const { Header, Content } = Layout;

function App() {
  const now = moment('2020-11-11'); // use to mock the current date for older data
  const [searchParams, setSearchParams] = useState({
    user: undefined,
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
        <img src={logo} className="logo" alt="logo" />
        <h1 className="logo-name">GABRIEL</h1>
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
          <Col xs={24} md={12}>
            <Card style={{ height: 330 }}>
              <GameActivityPieChart data={filteredData} height={330} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ height: 330 }}>
              <ActivePlaytimeChart data={filteredData} timePeriod={timePeriod} games={games} />
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
              <GameActivityBarChart
                height={400}
                data={filteredData}
                timePeriod={timePeriod}
                games={games}
                now={now}
              />
            </Card>
          </Col>
        </Row>
        {games.length > 0 && (
          <Row>
            {games.map((game) => {
              const gameData = filteredData.filter((entry) => entry.game === game);
              if (gameData.length === 0) {
                return null;
              }
              return (
                <Col xs={24} md={12} key={game}>
                  <Card>
                    <GameDetails data={gameData} timePeriod={timePeriod} game={game} />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Content>
    </Layout>
  );
}

export default App;
