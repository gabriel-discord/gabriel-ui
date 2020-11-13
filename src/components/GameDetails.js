import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import randomColor from 'randomcolor';

import { humanizeDurationShort } from '../utils';

const GameDetails = ({ data, game }) => {
  const durationPerUser = {};

  data.forEach((entry) => {
    durationPerUser[entry.user] = durationPerUser[entry.user] ?? 0;
    durationPerUser[entry.user] += entry.seconds;
  });

  const formattedData = Object.entries(durationPerUser)
    .map(([user, seconds]) => ({
      user,
      seconds,
    }))
    .sort((a, b) => b.seconds - a.seconds);

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
              data: formattedData.map((entry) => entry.seconds),
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
