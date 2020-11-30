import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import randomColor from 'randomcolor';

import { humanizeDurationShort } from '../utils';

const GameDetails = ({ data, game }) => {
  const durationPerUser = {};

  data.forEach((entry) => {
    durationPerUser[entry.user.id] = durationPerUser[entry.user.id] ?? 0;
    durationPerUser[entry.user.id] += entry.activeDuration;
  });

  const formattedData = Object.entries(durationPerUser)
    .map(([user, duration]) => ({
      user,
      duration,
    }))
    .sort((a, b) => b.duration - a.duration);

  const options = {
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const { datasetIndex, index } = tooltipItem;
          const duration = data.datasets[datasetIndex].data[index];
          return `${data.labels[index]}:\n${humanizeDurationShort(duration)}`;
        },
      },
    },
    legend: {
      position: 'right',
    },
  };

  return (
    <div>
      <h2 className="game-details-header">{game}</h2>
      <Doughnut
        data={{
          datasets: [
            {
              data: formattedData.map((entry) => entry.duration),
              backgroundColor: formattedData.map((a) => randomColor({ seed: a.user })),
            },
          ],
          labels: formattedData.map((entry) => entry.user),
        }}
        options={options}
      />
    </div>
  );
};

GameDetails.propTypes = {
  data: PropTypes.array.isRequired,
  game: PropTypes.string.isRequired,
};

export default GameDetails;
