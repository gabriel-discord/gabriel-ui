import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import moment from 'moment';
import randomColor from 'randomcolor';

const TimelineChart = ({ data, games, isMobile }) => {
  const entriesPerGame = {};
  const durationPerUser = {};
  const gameSet = new Set();
  const userSet = new Set();

  data.forEach((entry) => {
    const { game } = entry;
    const user = entry.user.id;
    gameSet.add(game);
    userSet.add(user);
    entriesPerGame[game] = entriesPerGame[game] ?? [];
    entriesPerGame[game].push({
      x: user,
      y: [entry.start, entry.stop],
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
  const colors = Array.from(gameSet)
    .sort((a, b) => a.localeCompare(b))
    .map((game) => randomColor({ seed: game }));

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
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    labels,
    colors,
    tooltip: {
      x: {
        formatter: (value) => moment(value).format('h:mmA'),
      },
    },
    legend: {
      markers: {
        radius: 0,
      },
    },
  };

  const gamesPerLine = isMobile ? 2 : 7;
  let adjustedHeight = 70; // space used for default padding
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
      <div id="chart">
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
