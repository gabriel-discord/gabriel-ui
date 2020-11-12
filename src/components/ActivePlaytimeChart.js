import React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

import { dateFormat, humanizeDurationShort } from '../utils';

import { TimePeriod } from '../types';

const ActivePlaytimeChart = ({ data, timePeriod }) => {
  let chart = null;
  const baseOptions = {
    maintainAspectRatio: false,
  };

  if (timePeriod === TimePeriod.DAY) {
    // calculate duration per hour of day
    const durationPerHour = {};
    for (let i = 0; i < 24; i++) {
      durationPerHour[i] = 0;
    }
    data.forEach((entry) => {
      try {
        // entry.start: "10/9/2020, 7:05:07 PM"
        // if duration exceeds current hour, keep counting duration for every subsequent hour
        let currentTime = moment(entry.start, dateFormat);
        let remainingDuration = entry.seconds;
        while (remainingDuration > 0) {
          const nextHour = currentTime.clone().add(1, 'hour').startOf('hour');
          const secondsTillNextHour = nextHour.diff(currentTime, 'seconds');
          const hourKey = currentTime.hours() % 24;

          if (remainingDuration <= secondsTillNextHour) {
            durationPerHour[hourKey] += remainingDuration;
            break;
          }

          // add remaining time in hour to current hour bucket, then progress to next hour
          durationPerHour[hourKey] += secondsTillNextHour;
          remainingDuration -= secondsTillNextHour;
          currentTime = nextHour;
        }
      } catch (error) {
        console.warn(error);
      }
    });

    const labels = [];
    for (let i = 0; i < 24; i++) {
      if (i < 12) {
        labels.push(`${i === 0 ? 12 : i} AM`);
      } else {
        labels.push(`${i % 12} PM`);
      }
    }

    const barData = {
      datasets: [
        { label: 'Playtime', backgroundColor: '#1890ff', data: Object.values(durationPerHour) },
      ],
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
                  units: ['h', 'm'],
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
            const seconds = data.datasets[datasetIndex].data[index];
            const durationString = humanizeDurationShort(seconds * 1000, {
              units: ['h', 'm'],
              round: true,
            });
            return `${data.datasets[datasetIndex].label}:\n${durationString}`;
          },
        },
      },
    };
    chart = <Bar data={barData} options={options} height={230} />;
  } else {
    // calculate duration per hour of day
    const durationPerDay = {};
    for (let i = 0; i < 7; i++) {
      durationPerDay[i] = 0;
    }
    data.forEach((entry) => {
      try {
        // entry.start: "10/9/2020, 7:05:07 PM"
        // if duration exceeds current day, keep counting duration for every subsequent day
        let currentTime = moment(entry.start, dateFormat);
        let remainingDuration = entry.seconds;
        while (remainingDuration > 0) {
          const nextDay = currentTime.clone().add(1, 'day').startOf('day');
          const secondsTillNextDay = nextDay.diff(currentTime, 'seconds');
          const dayKey = currentTime.days() % 7;

          if (remainingDuration <= secondsTillNextDay) {
            durationPerDay[dayKey] += remainingDuration;
            break;
          }

          // add remaining time in day to current day bucket, then progress to next day
          durationPerDay[dayKey] += secondsTillNextDay;
          remainingDuration -= secondsTillNextDay;
          currentTime = nextDay;
        }
      } catch (error) {
        console.warn(error);
      }
    });

    const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const barData = {
      datasets: [
        { label: 'Playtime', backgroundColor: '#1890ff', data: Object.values(durationPerDay) },
      ],
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
            const seconds = data.datasets[datasetIndex].data[index];
            const durationString = humanizeDurationShort(seconds * 1000, {
              units: ['d', 'h', 'm'],
              round: true,
            });
            return `${data.datasets[datasetIndex].label}:\n${durationString}`;
          },
        },
      },
      maintainAspectRatio: false,
    };
    chart = <Bar data={barData} options={options} height={230} />;
  }
  return <div>{chart}</div>;
};

export default ActivePlaytimeChart;
