import React, { useState } from 'react';
import { Card, Row, Col, Layout, Spin } from 'antd';
import moment from 'moment';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';
import useSWR from 'swr';

import SearchFilters from './components/SearchFilters';
import GameActivityPieChart from './components/GameActivityPieChart';
import GameActivityBarChart from './components/GameActivityBarChart';
import TrendChart from './components/TrendChart';
import TimelineChart from './components/TimelineChart';
import GameDetails from './components/GameDetails';
import { TimePeriod } from './types';
import { formatData } from './utils';

import logo from './icon.png';

import './App.scss';

const { Header, Content } = Layout;

function App() {
  const [searchParams, setSearchParams] = useState({
    userId: undefined,
    timePeriod: TimePeriod.WEEK,
    games: [],
  });
  const [dayData, setDayData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const { data } = useSWR('https://donchaknow.xyz/jank.json', async () => {
    try {
      const response = await axios.get('https://donchaknow.xyz/jank.json');
      const data = formatData(response.data);
      let cutoffDate = moment().subtract(1, 'days');
      setDayData(data.filter((entry) => moment(entry.start).isAfter(cutoffDate)));
      cutoffDate = moment().subtract(7, 'days');
      setWeekData(data.filter((entry) => moment(entry.start).isAfter(cutoffDate)));
      cutoffDate = moment().subtract(30, 'days');
      setMonthData(data.filter((entry) => moment(entry.start).isAfter(cutoffDate)));
      return data;
    } catch (error) {
      return [];
    }
  });

  const { games, timePeriod, userId } = searchParams;

  // filter by selected time period
  let filteredData;
  if (timePeriod === TimePeriod.DAY) {
    filteredData = dayData;
  } else if (timePeriod === TimePeriod.WEEK) {
    filteredData = weekData;
  } else if (timePeriod === TimePeriod.MONTH) {
    filteredData = monthData;
  } else {
    filteredData = data ?? [];
  }

  // timeline will always use data from past 24 hours
  let timelineData = dayData;

  if (userId) {
    // filter by selected user
    filteredData = filteredData.filter((entry) => userId === entry.user.id);
    timelineData = timelineData.filter((entry) => userId === entry.user.id);
  }

  if (games.length > 0) {
    // filter by selected games
    const gameSet = new Set(games);
    const gameFilter = ({ game }) => {
      if (gameSet.size === 0) {
        return true;
      }
      return gameSet.has(game);
    };
    filteredData = filteredData.filter(gameFilter);
    timelineData = timelineData.filter(gameFilter);
  }

  const isMobile = useMediaQuery({ query: '(max-width: 550px)' });

  const doughnutCardHeight = isMobile ? 450 : 330;
  const trendCardHeight = 330;

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
            data={data ?? []}
            isMobile={isMobile}
            onChange={(searchParams) => setSearchParams(searchParams)}
            value={searchParams}
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
              <Card style={{ height: trendCardHeight }}>
                <TrendChart data={filteredData} timePeriod={timePeriod} games={games} />
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card>
                <GameActivityBarChart
                  height={isMobile ? 550 : 400}
                  data={filteredData}
                  timePeriod={timePeriod}
                  games={games}
                  isMobile={isMobile}
                />
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card>
                <TimelineChart
                  data={timelineData}
                  timePeriod={timePeriod}
                  games={games}
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
