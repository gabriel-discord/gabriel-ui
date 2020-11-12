import React from "react";
import { Select, Radio } from "antd";
import _ from "lodash";

import { TimePeriod } from "../types";

const aliases = {
  Ion: [/chris/i, /sirch/i],
  solewolf: [/kitkat/i, /keith/i, /kit/i],
  lobabob: [/farhan/i, /fkd/i],
  Acidn420: [/jesus/i],
  bobninjasub1: [/rehan/i, /re+/i],
};

const SearchFilters = ({ data, onChange, value }) => {
  const users = _.uniq(data.map(({ user }) => user)).sort((a, b) =>
    a.localeCompare(b)
  );
  const gameSet = new Set(data.map((entry) => entry.game));
  const gameOptions = Array.from(gameSet)
    .map((game) => ({
      label: game,
      value: game,
    }))
    .sort((a, b) => a.value.localeCompare(b.value))
    .map(({ label, value }) => (
      <Select.Option key={value} value={value.value}>
        {label}
      </Select.Option>
    ));

  return (
    <div className="search-filters">
      <Select
        placeholder="Select a user..."
        style={{ width: 300, marginBottom: 16 }}
        value={value.user}
        onChange={(user) => onChange({ ...value, user })}
        allowClear
        showSearch
        filterOption={(input, option) => {
          const optionName = option.children;
          const names = Object.keys(aliases);
          for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const regexes = aliases[name];
            if (
              regexes.some((regex) => regex.test(input) && name === optionName)
            ) {
              return true;
            }
          }
          return (
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          );
        }}
      >
        {users.map((user) => (
          <Select.Option value={user} key={user}>
            {user}
          </Select.Option>
        ))}
      </Select>
      <Radio.Group
        optionType="button"
        buttonStyle="solid"
        value={value.timePeriod}
        onChange={(e) => onChange({ ...value, timePeriod: e.target.value })}
        options={[
          {
            label: "24 Hours",
            value: TimePeriod.DAY,
          },
          {
            label: "7 Days",
            value: TimePeriod.WEEK,
          },
          {
            label: "30 Days",
            value: TimePeriod.MONTH,
          },
          {
            label: "Forever",
            value: TimePeriod.FOREVER,
          },
        ]}
        style={{ marginLeft: 16 }}
      />
      <Select
        mode="multiple"
        allowClear
        placeholder="Compare games..."
        style={{ width: 648, display: "block", marginBottom: 16 }}
        value={value.games}
        onChange={(games) => onChange({ ...value, games })}
      >
        {gameOptions}
      </Select>
    </div>
  );
};

export default SearchFilters;