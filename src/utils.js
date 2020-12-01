import moment from 'moment';
import humanizeDuration from 'humanize-duration';

import { DiscordStatus } from './types';

export const dateFormat = 'MM/D/YYYY, hh:mm:ss A Z';

export const humanizeDurationShort = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  spacer: '',
  delimiter: ' ',
});

const getDiscordStatus = (statusNum) => {
  const statusMap = {
    0: DiscordStatus.ACTIVE,
    1: DiscordStatus.IDLE,
    2: DiscordStatus.OFFLINE,
    3: DiscordStatus.DO_NOT_DISTURB,
  };

  return statusMap[statusNum] ?? statusNum;
};

export const formatData = (data) => {
  return data.map((entry) => {
    const start = parseInt(moment(`${entry.start} -06:00`, dateFormat).format('x'));
    const stop = parseInt(moment(`${entry.stop} -06:00`, dateFormat).format('x'));
    const duration = stop - start;

    const rawStatusLog = entry.statusLog ?? [];
    const statusLog = [];

    let prevStatus = getDiscordStatus(rawStatusLog[0]);
    let runningStatus = {
      status: prevStatus,
      duration: 60 * 1000,
    };
    for (let i = 1; i < rawStatusLog.length; i++) {
      const currStatus = getDiscordStatus(rawStatusLog[i]);
      if (prevStatus !== currStatus) {
        prevStatus = currStatus;
        statusLog.push(runningStatus);
        runningStatus = {
          status: currStatus,
          duration: 60 * 1000,
        };
      } else {
        runningStatus.duration += 60 * 1000;
      }

      if (i === rawStatusLog.length - 1) {
        statusLog.push(runningStatus);
      }
    }
    if (rawStatusLog.length === 0) {
      // handle missing statusLog for older entries
      statusLog.push({
        status: DiscordStatus.ACTIVE,
        duration,
      });
    }

    let activeDuration;
    if (rawStatusLog.length > 0) {
      activeDuration = statusLog
        .filter((entry) => entry.status === DiscordStatus.ACTIVE)
        .reduce((acc, curr) => acc + curr.duration, 0);
    } else {
      activeDuration = duration;
    }

    return {
      game: entry.game,
      user: {
        id: entry.user,
        aliases: [entry.user],
        tag: entry.user,
      },
      start,
      stop,
      duration,
      activeDuration,
      idleDuration: duration - activeDuration,
      statusLog,
    };
  });
};

export const getDurationInDay = (duration, start) => {
  const endOfDay = start.clone().endOf('day');
  const remainingTimeInDay = endOfDay.diff(start, 'milliseconds');
  return Math.min(duration, remainingTimeInDay);
};
