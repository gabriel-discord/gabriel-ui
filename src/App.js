import React, { useState } from 'react';
import { Card, Row, Col, Layout, Spin } from 'antd';
import moment from 'moment';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';
import useSWR from 'swr';

import SearchFilters from './components/SearchFilters';
import GameActivityPieChart from './components/GameActivityPieChart';
import GameActivityBarChart from './components/GameActivityBarChart';
import ActivePlaytimeChart from './components/ActivePlaytimeChart';
import GameDetails from './components/GameDetails';
import { TimePeriod } from './types';
import { dateFormat } from './utils';

import logo from './icon.png';

import './App.scss';

const { Header, Content } = Layout;

function App() {
  const now = moment(); // use to mock the current date for older data
  const [searchParams, setSearchParams] = useState({
    user: undefined,
    timePeriod: TimePeriod.WEEK,
    games: [],
  });
  const { data } = useSWR('http://donchaknow.xyz/jank.json', async () => {
    try {
      const response = await axios.get('http://donchaknow.xyz/jank.json');
      return response.data;
    } catch (error) {
      return [];
    }
  });

  const { games, timePeriod, user } = searchParams;

  let filteredData = user ? (data || []).filter((entry) => user === entry.user) : data || [];

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

  const isMobile = useMediaQuery({ query: '(max-width: 550px)' });

  const doughnutCardHeight = isMobile ? 450 : 330;

  return (
    <Layout>
      <Header>
        <img src={logo} className="logo" alt="logo" />
        <h1 className="logo-name">GABRIEL</h1>
      </Header>
      <Spin tip="Loading" spinning={!data}>
        <Content
          style={{
            padding: '24px 40px',
            maxWidth: 1100,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <SearchFilters
            data={data || []}
            value={searchParams}
            onChange={(searchParams) => setSearchParams(searchParams)}
          />
          <Row>
            <Col xs={24} md={12}>
              <Card style={{ height: doughnutCardHeight }}>
                <GameActivityPieChart
                  data={filteredData}
                  height={doughnutCardHeight}
                  isMobile={isMobile}
                />
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
              <Card>
                <GameActivityBarChart
                  height={isMobile ? 450 : 400}
                  data={filteredData}
                  timePeriod={timePeriod}
                  games={games}
                  now={now}
                  isMobile={isMobile}
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
                      <GameDetails
                        data={gameData}
                        timePeriod={timePeriod}
                        game={game}
                        isMobile={isMobile}
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Content>
      </Spin>
    </Layout>
  );
}

export default App;
