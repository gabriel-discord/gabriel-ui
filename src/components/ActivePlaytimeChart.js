import React, { useState } from 'react';
import { Radio, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import randomColor from 'randomcolor';
import PropTypes from 'prop-types';
import normalize from 'array-normalize';

import { dateFormat, humanizeDurationShort } from '../utils';

import { TimePeriod } from '../types';

const calculateDurationPerTimePeriod = (data, timePeriod) => {
  const duration = timePeriod === TimePeriod.DAY ? 'hour' : 'day';
  const durationPerHour = {};
  const numIntervals = timePeriod === TimePeriod.DAY ? 24 : 7;
  for (let i = 0; i < numIntervals; i++) {
    durationPerHour[i] = 0;
  }

  data.forEach((entry) => {
    try {
      // entry.start: "10/9/2020, 7:05:07 PM"
      // if duration exceeds current hour, keep counting duration for every subsequent hour
      let currentTime = moment(entry.start, dateFormat);
      let remainingDuration = entry.seconds;
      while (remainingDuration > 0) {
        const nextDuration = currentTime.clone().add(1, duration).startOf(duration);
        const secondsTillNextDuration = nextDuration.diff(currentTime, 'seconds');
        const durationKey =
          timePeriod === TimePeriod.DAY
            ? currentTime.hours() % numIntervals
            : currentTime.days() % numIntervals;

        if (remainingDuration <= secondsTillNextDuration) {
          durationPerHour[durationKey] += remainingDuration;
          break;
        }

        // add remaining time in hour to current hour bucket, then progress to next hour
        durationPerHour[durationKey] += secondsTillNextDuration;
        remainingDuration -= secondsTillNextDuration;
        currentTime = nextDuration;
      }
    } catch (error) {
      console.warn(error);
    }
  });
  return durationPerHour;
};

const ActivePlaytimeChart = ({ data, games }) => {
  const [timePeriod, setTimePeriod] = useState(TimePeriod.DAY);
  const [allowAnimation, setAllowAnimation] = useState(true);

  let chart = null;
  const baseOptions = {
    maintainAspectRatio: false,
    animation: {
      duration: allowAnimation ? 1000 : 0,
    },
  };

  // calculate duration per hour of day
  let datasets;
  if (games.length > 0) {
    const gameDurationPerHour = {};
    games.forEach((game) => {
      gameDurationPerHour[game] = calculateDurationPerTimePeriod(
        data.filter((entry) => entry.game === game),
        timePeriod,
      );
    });
    datasets = Object.entries(gameDurationPerHour).map(([game, gameData]) => {
      return {
        label: game,
        borderColor: randomColor({ seed: game }),
        data: normalize(Object.values(gameData)),
        fill: false,
      };
    });
  } else {
    const durationPerHour = calculateDurationPerTimePeriod(data, timePeriod);
    datasets = [
      {
        label: 'Playtime',
        borderColor: '#95de64',
        fill: false,
        data: normalize(Object.values(durationPerHour)),
      },
    ];
  }

  let labels;
  if (timePeriod === TimePeriod.DAY) {
    labels = [];
    for (let i = 0; i < 24; i++) {
      if (i < 12) {
        labels.push(`${i === 0 ? 12 : i} AM`);
      } else {
        labels.push(`${i > 12 ? i % 12 : i} PM`);
      }
    }
  } else {
    labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  const barData = {
    datasets,
    labels,
  };

  const options = {
    ...baseOptions,
    scales: {
      yAxes: [
        {
          ticks: {
            callback: (value) =>
              humanizeDurationShort(value * 1000, {
                units: timePeriod === TimePeriod.DAY ? ['h', 'm'] : ['d', 'h', 'm'],
                round: true,
              }),
            min: 0,
            display: false,
          },
        },
      ],
    },
    tooltips: {
      enabled: false,
    },
  };
  chart = <Line data={barData} options={options} height={230} />;

  return (
    <>
      <div className="header-container">
        <h2>Activity Trend</h2>
        <Tooltip title="Most popular time a game is played">
          <QuestionCircleOutlined className="tooltip-icon" />
        </Tooltip>
        <Radio.Group
          size="small"
          optionType="button"
          buttonStyle="solid"
          value={timePeriod}
          onChange={(e) => {
            setAllowAnimation(false);
            setTimePeriod(e.target.value);
            setImmediate(() => {
              setAllowAnimation(true);
            });
          }}
          options={[
            {
              label: 'Per Hour',
              value: TimePeriod.DAY,
            },
            {
              label: 'Per Day',
              value: TimePeriod.WEEK,
            },
          ]}
          style={{ marginLeft: 'auto' }}
        />
      </div>
      <div>{chart}</div>
    </>
  );
};

ActivePlaytimeChart.propTypes = {
  data: PropTypes.array.isRequired,
  timePeriod: PropTypes.number.isRequired,
  games: PropTypes.array.isRequired,
};

export default ActivePlaytimeChart;
