import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import moment from 'moment';
import randomColor from 'randomcolor';

import { DiscordStatus } from '../types';

const TimelineChart = ({ data, games, isMobile }) => {
  const entries = [];
  // break a single entry up into multiple entries based on discord status
  data.forEach((entry) => {
    let currentDuration = 0;
    entry.statusLog.forEach(({ status: discordStatus, duration }) => {
      const start = entry.start + currentDuration;
      const stop = start + duration;
      entries.push({
        ...entry,
        duration,
        start,
        stop,
        discordStatus,
      });
      currentDuration += duration;
    });
  });

  const entriesPerGame = {};
  const durationPerUser = {};
  const gameSet = new Set();
  const userSet = new Set();

  entries.forEach((entry) => {
    const { game } = entry;
    const user = entry.user.id;
    gameSet.add(game);
    userSet.add(user);
    entriesPerGame[game] = entriesPerGame[game] ?? [];
    entriesPerGame[game].push({
      x: user,
      y: [entry.start, entry.stop],
      discordStatus: entry.discordStatus,
      game: entry.game,
    });
    durationPerUser[user] = durationPerUser[user] ?? 0;
    durationPerUser[user] += entry.duration;
  });

  const gameSeries = Object.entries(entriesPerGame)
    .map(([name, data]) => {
      return {
        name,
        data: data.filter(({ x }) => x),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const chartMin = parseInt(moment().subtract('24', 'hours').format('x'));
  const chartMax = parseInt(moment().format('x'));
  const labels = Array.from(userSet).sort((a, b) => a.localeCompare(b));

  const options = {
    plotOptions: {
      bar: {
        horizontal: true,
        rangeBarGroupRows: true,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (value) =>
          isMobile ? moment(value).format('HH:mm') : moment(value).format('h:mmA'),
      },
      tickAmount: isMobile ? 2 : 12,
      min: chartMin,
      max: chartMax,
      axisBorder: {
        show: true,
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          // if there's no data, the label will default to a timestamp
          if (typeof value !== 'string') {
            return '';
          }
          return value;
        },
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    labels,
    colors: [
      ({ value, seriesIndex, dataPointIndex, w }) => {
        const game = w.config.series[seriesIndex].name;
        const discordStatus = w.config.series[seriesIndex].data[dataPointIndex]?.discordStatus;
        return randomColor({
          seed: game,
          format: 'rgba',
          alpha: discordStatus === DiscordStatus.ACTIVE ? 1 : 0.7,
        });
      },
    ],
    tooltip: {
      x: {
        formatter: (value, opts) => moment(value).format('h:mmA'),
      },
      y: {
        title: {
          formatter: (value, { seriesIndex, dataPointIndex, w }) => {
            const discordStatus = w.config.series[seriesIndex].data[dataPointIndex]?.discordStatus;
            if (discordStatus === DiscordStatus.IDLE) {
              return `${value} (IDLE)`;
            }
            return value;
          },
        },
      },
    },
    legend: {
      showForSingleSeries: true,
      markers: {
        radius: 0,
      },
    },
  };

  const gamesPerLine = isMobile ? 2 : 7;
  let adjustedHeight = 90; // space used for default padding
  adjustedHeight += Math.floor(gameSet.size / gamesPerLine) * 20;
  adjustedHeight += userSet.size * 24;
  if (userSet.size === 0) {
    adjustedHeight = 400;
  }

  return (
    <>
      <div className="header-container">
        <h2>Timeline</h2>
      </div>
      <div id="chart" style={{ marginTop: -20 }}>
        <Chart options={options} series={gameSeries} type="rangeBar" height={adjustedHeight} />
      </div>
    </>
  );
};

TimelineChart.propTypes = {
  data: PropTypes.array.isRequired,
  games: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default TimelineChart;
