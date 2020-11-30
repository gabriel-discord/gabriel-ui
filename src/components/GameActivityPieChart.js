import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import randomColor from 'randomcolor';
import _ from 'lodash';

import { humanizeDurationShort } from '../utils';

const GAME_ACTIVITY_LIMIT = 8;

const GameActivityPieChart = ({ data, height, isMobile }) => {
  const activityPerGame = {};

  let totalDuration = 0;
  data.forEach(({ game, activeDuration }) => {
    activityPerGame[game] = activityPerGame[game] || 0;
    activityPerGame[game] += activeDuration;
    totalDuration += activeDuration;
  });

  const gameActivityData = Object.entries(activityPerGame)
    .map(([game, duration]) => ({
      game,
      duration,
    }))
    .sort((a, b) => b.duration - a.duration);

  // group after top 5
  const formattedData = gameActivityData.slice(0, GAME_ACTIVITY_LIMIT);
  if (gameActivityData.length > GAME_ACTIVITY_LIMIT) {
    formattedData.push({
      game: 'Other',
      duration: gameActivityData
        .slice(GAME_ACTIVITY_LIMIT)
        .reduce((acc, curr) => acc + curr.duration, 0),
    });
  }

  const options = {
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const { datasetIndex, index } = tooltipItem;
          const duration = data.datasets[datasetIndex].data[index];
          const durationString = humanizeDurationShort(duration, {
            units: ['d', 'h', 'm'],
            round: true,
          });
          const durationPercentage = ((duration / totalDuration) * 100).toFixed(1);
          return `${data.labels[index]}:\n${durationString} (${durationPercentage}%)`;
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
                data: formattedData.map((activity) => activity.duration),
                backgroundColor: formattedData.map((a) => randomColor({ seed: a.game })),
              },
            ],
            labels: formattedData.map((a) => _.truncate(a.game, { length: 30 })),
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
  height: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default GameActivityPieChart;
