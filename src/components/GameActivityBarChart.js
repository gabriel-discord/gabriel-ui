import React from 'react';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import randomColor from 'randomcolor';
import PropTypes from 'prop-types';

import { humanizeDurationShort } from '../utils';
import { TimePeriod } from '../types';
import _ from 'lodash';

const GAME_THRESHOLD = 5;

const GameActivityBarChart = ({ data, timePeriod, height, games, now = moment() }) => {
  const selectedGameSet = new Set(games);
  // calculate duration in seconds for each game
  const durationPerGame = {};
  data.forEach(({ game, seconds }) => {
    durationPerGame[game] = durationPerGame[game] ?? 0;
    durationPerGame[game] += seconds;
  });

  // calculate top N games to display based on duration
  const topGames = new Set(
    Object.entries(durationPerGame)
      .map(([game, seconds]) => ({ game, seconds }))
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, GAME_THRESHOLD)
      .map(({ game }) => game),
  );

  // group each entry by date
  const entriesPerDay = {};
  data.forEach((entry) => {
    const { start } = entry;
    const startDate = start.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)?.[0];
    if (startDate) {
      entriesPerDay[startDate] = entriesPerDay[startDate] ?? [];
      entriesPerDay[startDate].push(entry);
    }
  });

  // calculate game duration per day per game
  const gameDurationPerDay = {};
  const gameSet = new Set();
  // for each day, look at all entries
  Object.entries(entriesPerDay).forEach(([date, dataArr]) => {
    gameDurationPerDay[date] = {};
    const gameGroup = _.groupBy(dataArr, (entry) => entry.game);
    // group duration by seconds per game
    Object.entries(gameGroup).forEach(([game, entries]) => {
      if (topGames.has(game) || selectedGameSet.size > 0) {
        gameSet.add(game);
        gameDurationPerDay[date][game] = entries.reduce((acc, curr) => acc + curr.seconds, 0);
      } else if (selectedGameSet.size === 0) {
        gameSet.add('Other');
        gameDurationPerDay[date]['Other'] = entries.reduce((acc, curr) => acc + curr.seconds, 0);
      }
    });
  });

  // limit to displaying the last 30 days if time period is ALL
  const numIterations = Math.min(timePeriod, 30);

  const datasets = Array.from(gameSet)
    .map((game) => {
      const date = now.clone();
      const data = [];
      for (let i = 0; i < numIterations; i++) {
        const dateString = date.format('MM/D/YYYY');
        const seconds = gameDurationPerDay[dateString]?.[game] ?? 0;
        data.push(seconds);
        date.subtract(1, 'days');
      }
      return {
        label: game,
        backgroundColor: randomColor({ seed: game }),
        data: data.reverse(),
        barPercentage: timePeriod === TimePeriod.DAY ? 0.2 : 0.9,
      };
    })
    .sort((a, b) => {
      return _.sum(b.data) - _.sum(a.data);
    });

  const labels = [];
  const date = now.clone();
  for (let i = 0; i < numIterations; i++) {
    labels.push(date.format('MM/DD'));
    date.subtract(1, 'day');
  }
  labels.reverse();

  const barData = {
    datasets,
    labels,
  };

  const options = {
    scales: {
      xAxes: [
        {
          stacked: true,
        },
      ],
      yAxes: [
        {
          stacked: true,
          ticks: {
            callback: (value) =>
              humanizeDurationShort(value * 1000, {
                units: ['h'],
                round: true,
              }),
            display: false,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const { datasetIndex, index } = tooltipItem;
          const seconds = data.datasets[datasetIndex].data[index];
          return `${data.datasets[datasetIndex].label}:\n${humanizeDurationShort(seconds * 1000)}`;
        },
      },
    },
    maintainAspectRatio: false,
  };

  // chart needs to be nested in div to be responsive properly
  return (
    <>
      <h2>Daily Activity</h2>
      <div>
        <Bar data={barData} options={options} height={height - 100} />
      </div>
    </>
  );
};

GameActivityBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  timePeriod: PropTypes.number.isRequired,
  games: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  now: PropTypes.object.isRequired,
};

export default GameActivityBarChart;
