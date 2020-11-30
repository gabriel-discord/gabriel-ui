import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const ViewToggleButton = ({ value, onChange }) => {
  return (
    <Tooltip title={value ? 'Show less games' : 'Show all games'}>
      <Button
        shape="circle"
        size="small"
        icon={<FilterOutlined style={{ fontSize: 12 }} />}
        type="linked"
        onClick={() => onChange(!value)}
      />
    </Tooltip>
  );
};

ViewToggleButton.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ViewToggleButton;
