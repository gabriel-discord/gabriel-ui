import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import randomColor from 'randomcolor';

import { humanizeDurationShort } from '../utils';

const GAME_ACTIVITY_LIMIT = 7;

const GameActivityPieChart = ({ data, height, isMobile }) => {
  const activityPerGame = {};

  data.forEach(({ game, seconds }) => {
    activityPerGame[game] = activityPerGame[game] || 0;
    activityPerGame[game] += seconds;
  });

  const gameActivityData = Object.entries(activityPerGame)
    .map(([game, seconds]) => ({
      game,
      seconds,
    }))
    .sort((a, b) => b.seconds - a.seconds);

  // group after top 5
  const formattedData = gameActivityData.slice(0, GAME_ACTIVITY_LIMIT);
  if (gameActivityData.length > GAME_ACTIVITY_LIMIT) {
    formattedData.push({
      game: 'Other',
      seconds: gameActivityData
        .slice(GAME_ACTIVITY_LIMIT)
        .reduce((acc, curr) => acc + curr.seconds, 0),
    });
  }

  const options = {
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const { datasetIndex, index } = tooltipItem;
          const seconds = data.datasets[datasetIndex].data[index];
          return `${data.labels[index]}:\n${humanizeDurationShort(seconds * 1000)}`;
        },
      },
    },
    legend: {
      position: isMobile ? 'bottom' : 'right',
      align: isMobile ? 'start' : 'center',
    },
    maintainAspectRatio: false,
  };

  return (
    <>
      <h2>Games Played</h2>
      <div>
        <Doughnut
          data={{
            datasets: [
              {
                data: formattedData.map((activity) => activity.seconds),
                backgroundColor: formattedData.map((a) => randomColor({ seed: a.game })),
              },
            ],
            labels: formattedData.map((a) => a.game),
          }}
          options={options}
          height={height - 100}
        />
      </div>
    </>
  );
};

GameActivityPieChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default GameActivityPieChart;
