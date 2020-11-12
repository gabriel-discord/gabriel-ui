import React from "react";
import { Doughnut } from "react-chartjs-2";
import randomColor from "randomcolor";
import humanizeDuration from "humanize-duration";

const GAME_ACTIVITY_LIMIT = 7;

const GameActivityPieChart = ({ data, games: selectedGames }) => {
  const activityPerGame = {};

  data
    .filter(({ game }) => {
      if (selectedGames.size === 0) {
        return true;
      }
      return selectedGames.has(game);
    })
    .forEach(({ game, seconds }) => {
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
      game: "Other",
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
          return `${data.labels[index]}:\n${humanizeDuration(seconds * 1000)}`;
        },
      },
    },
    legend: {
      position: "right",
    },
  };

  return (
    <Doughnut
      data={{
        datasets: [
          {
            data: formattedData.map((activity) => activity.seconds),
            backgroundColor: formattedData.map((a) =>
              randomColor({ seed: a.game })
            ),
          },
        ],
        labels: formattedData.map((a) => a.game),
      }}
      options={options}
    />
  );
};

export default GameActivityPieChart;
