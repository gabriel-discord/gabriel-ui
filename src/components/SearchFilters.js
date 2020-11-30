import React from 'react';
import PropTypes from 'prop-types';
import { Select, Radio } from 'antd';
import _ from 'lodash';
import classNames from 'classnames';

import { TimePeriod } from '../types';

const aliases = {
  Acidn420: [/jesus/i],
  alikhanx12: [],
  Aly: [],
  bobninjasub1: [/rehan/i, /re+/i],
  Gandalf: [/ian/i, /nighthank/i, /nightwing/i],
  hackerman: [/ryan/i, /rein/i],
  Ion: [/chris/i, /sirch/i],
  Janix: [/jake/i],
  jarkyll: [/nabeel/i, /silver pews/i],
  lobabob: [/farhan/i, /fkd/i],
  'Not Kevin': [],
  solewolf: [/kitkat/i, /keith/i, /kit/i],
};

const SearchFilters = ({ data, isMobile, onChange, value }) => {
  const users = _.uniq(data.map(({ user }) => user.id)).sort((a, b) => a.localeCompare(b));
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
    <div className={classNames('search-filters', { mobile: isMobile })}>
      <Select
        className="user-select"
        placeholder="Select a user..."
        style={{
          width: isMobile ? '100%' : 300,
          maxWidth: '100%',
          marginRight: 16,
          marginBottom: 16,
        }}
        value={value.userId}
        onChange={(userId) => onChange({ ...value, userId })}
        allowClear
        showSearch
        filterOption={(input, option) => {
          const optionName = option.children;
          const names = Object.keys(aliases);
          for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const regexes = aliases[name];
            if (regexes.some((regex) => regex.test(input) && name === optionName)) {
              return true;
            }
          }
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
      >
        {users.map((user) => (
          <Select.Option value={user} key={user}>
            {user}
          </Select.Option>
        ))}
      </Select>
      <Radio.Group
        className="time-period-radio"
        optionType="button"
        buttonStyle="solid"
        value={value.timePeriod}
        onChange={(e) => onChange({ ...value, timePeriod: e.target.value })}
        options={[
          {
            label: isMobile ? '24H' : '24 Hours',
            value: TimePeriod.DAY,
          },
          {
            label: isMobile ? '7D' : '7 Days',
            value: TimePeriod.WEEK,
          },
          {
            label: isMobile ? '30D' : '30 Days',
            value: TimePeriod.MONTH,
          },
          {
            label: isMobile ? 'ALL' : 'Forever',
            value: TimePeriod.FOREVER,
          },
        ]}
        style={{ marginBottom: 16 }}
      />
      <Select
        className="game-select"
        mode="multiple"
        allowClear
        placeholder="Compare games..."
        style={{ width: '100%', display: 'block', marginBottom: 16 }}
        value={value.games}
        onChange={(games) => onChange({ ...value, games })}
      >
        {gameOptions}
      </Select>
    </div>
  );
};

SearchFilters.propTypes = {
  data: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
};

export default SearchFilters;
