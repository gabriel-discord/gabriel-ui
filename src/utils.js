import moment from 'moment';
import humanizeDuration from 'humanize-duration';

export const dateFormat = 'MM/D/YYYY, hh:mm:ss A';

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
    0: 'ACTIVE',
    1: 'IDLE',
    2: 'OFFLINE',
    3: 'DO_NOT_DISTURB',
  };

  return statusMap[statusNum] ?? statusNum;
};

export const formatData = (data) => {
  return data.map((entry) => {
    const rawStatusLog = entry.statusLog ?? [];
    const statusLog = [];

    let prevStatus = getDiscordStatus(rawStatusLog[0]);
    let runningStatus = {
      status: prevStatus,
      duration: 1,
    };
    for (let i = 1; i < rawStatusLog.length; i++) {
      const currStatus = getDiscordStatus(rawStatusLog[i]);
      if (prevStatus !== currStatus) {
        prevStatus = currStatus;
        statusLog.push(runningStatus);
        runningStatus = {
          status: currStatus,
          duration: 1,
        };
      } else {
        runningStatus.duration++;
      }

      if (i === rawStatusLog.length - 1) {
        statusLog.push(runningStatus);
      }
    }

    const start = parseInt(moment(entry.start, dateFormat).format('x'));
    const stop = parseInt(moment(entry.stop, dateFormat).format('x'));

    return {
      game: entry.game,
      user: {
        id: entry.user,
        aliases: [entry.user],
        tag: entry.user,
      },
      start,
      stop,
      duration: stop - start,
      statusLog,
    };
  });
};

export const getDurationInDay = (duration, start) => {
  const endOfDay = start.clone().endOf('day');
  const remainingTimeInDay = endOfDay.diff(start, 'milliseconds');
  return Math.min(duration, remainingTimeInDay);
};
