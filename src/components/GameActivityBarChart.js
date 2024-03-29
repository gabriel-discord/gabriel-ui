import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import randomColor from 'randomcolor';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getDurationInDay, humanizeDurationShort } from '../utils';
import { TimePeriod } from '../types';

import ViewToggleButton from './ViewToggleButton';

const GameActivityBarChart = ({ data, timePeriod, height, games, isMobile }) => {
  const [showAllGames, setShowAllGames] = useState(false);
  const [key, setKey] = useState(0);

  // set key on div containing chart to forcefully re-mount every time data is modified
  // this prevents old data from being carried over and causing a bug (e.g. legend selection index)
  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [data, games]);

  const GAME_THRESHOLD = 10;
  const selectedGameSet = new Set(games);
  // calculate duration in milliseconds for each game
  const durationPerGame = {};
  data.forEach(({ game, activeDuration }) => {
    durationPerGame[game] = durationPerGame[game] ?? 0;
    durationPerGame[game] += activeDuration;
  });

  // calculate top N games to display based on duration
  const topGames = new Set(
    Object.entries(durationPerGame)
      .map(([game, duration]) => ({ game, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, GAME_THRESHOLD)
      .map(({ game }) => game),
  );

  // group each entry by date
  const entriesPerDay = {};
  let earliestDate = moment();
  data.forEach((entry) => {
    const { start } = entry;
    const startDate = moment(start).startOf('day');
    const startDateString = startDate.format();
    entriesPerDay[startDateString] = entriesPerDay[startDateString] ?? [];
    entriesPerDay[startDateString].push(entry);

    if (startDate.isBefore(earliestDate)) {
      earliestDate = startDate;
    }
  });

  // calculate game duration per day per game
  const gameDurationPerDay = {};
  const gameSet = new Set();
  // for each day, look at all entries
  Object.entries(entriesPerDay).forEach(([date, dataArr]) => {
    const entriesByGame = _.groupBy(dataArr, (entry) => entry.game);
    // group duration by milliseconds per game
    Object.entries(entriesByGame).forEach(([game, entries]) => {
      // handle adding playtime across multiple days if users plays before and after midnight
      const addEntriesForGame = (game) => {
        gameSet.add(game);
        entries.forEach(({ activeDuration, start }) => {
          let remainingDuration = activeDuration;
          const currentDate = moment(start).clone();
          while (remainingDuration > 0) {
            const durationForDay = getDurationInDay(remainingDuration, currentDate);
            const dateString = currentDate.clone().startOf('day').format();
            gameDurationPerDay[dateString] = gameDurationPerDay[dateString] ?? {};
            gameDurationPerDay[dateString][game] = gameDurationPerDay[dateString][game] ?? 0;
            gameDurationPerDay[dateString][game] += durationForDay;
            remainingDuration -= durationForDay;
            currentDate.add(1, 'day').startOf('day');
          }
        });
      };

      if (
        topGames.has(game) ||
        selectedGameSet.size > 0 ||
        (selectedGameSet.size === 0 && showAllGames)
      ) {
        addEntriesForGame(game);
      } else if (selectedGameSet.size === 0) {
        addEntriesForGame('Other');
      }
    });
  });

  // limit to displaying the last 30 days if time period is ALL
  let numDaysToGoBack;
  if (timePeriod === TimePeriod.FOREVER) {
    // always display at least 30 days
    numDaysToGoBack = Math.max(moment().diff(earliestDate, 'days'), 30);
  } else {
    numDaysToGoBack = timePeriod;
  }

  const datasets = Array.from(gameSet)
    .map((game) => {
      const date = moment().startOf('day');
      const data = [];
      for (let i = 0; i < numDaysToGoBack; i++) {
        const dateString = date.format();
        const duration = gameDurationPerDay[dateString]?.[game] ?? 0;
        data.push(duration);
        date.subtract(1, 'days');
      }
      return {
        label: _.truncate(game, { length: 30 }),
        backgroundColor: randomColor({ seed: game }),
        data: data.reverse(),
        // prevent bar from taking up full width if showing single day
        barPercentage: timePeriod === TimePeriod.DAY ? 0.2 : 0.9,
      };
    })
    .sort((a, b) => {
      return _.sum(b.data) - _.sum(a.data);
    });

  const labels = [];
  const date = moment();
  for (let i = 0; i < numDaysToGoBack; i++) {
    labels.push(date.format('MM/DD ddd'));
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
              humanizeDurationShort(value, {
                units: ['d', 'h'],
                round: true,
              }),
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const { datasetIndex, index } = tooltipItem;
          const duration = data.datasets[datasetIndex].data[index];
          const durationString = humanizeDurationShort(duration, {
            units: ['h', 'm'],
            round: true,
          });
          return `${data.datasets[datasetIndex].label}:\n${durationString}`;
        },
      },
    },
    legend: {
      align: isMobile ? 'start' : 'center',
      position: isMobile ? 'bottom' : 'top',
    },
    maintainAspectRatio: false,
  };

  let adjustedHeight = height - 100;
  if (showAllGames) {
    const gamesPerLine = isMobile ? 1 : 5.5;
    adjustedHeight += Math.floor(gameSet.size / gamesPerLine) * 18;
  }

  // chart needs to be nested in div to be responsive properly
  return (
    <>
      <div className="header-container">
        <h2>Daily Activity</h2>
        <ViewToggleButton
          value={showAllGames}
          onChange={(showAllGames) => setShowAllGames(showAllGames)}
          disabled={gameSet.size > 0 && gameSet.size === topGames.size}
        />
      </div>
      <div key={key} style={{ height: adjustedHeight }}>
        <Bar data={barData} options={options} />
      </div>
    </>
  );
};

GameActivityBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  games: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  timePeriod: PropTypes.number.isRequired,
};

export default GameActivityBarChart;
