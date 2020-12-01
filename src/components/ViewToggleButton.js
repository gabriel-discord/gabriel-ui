import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const ViewToggleButton = ({ value, onChange, disabled = false }) => {
  const tooltipProps = {};

  if (disabled) {
    tooltipProps.visible = false;
  }

  return (
    <Tooltip title={value ? 'Show less' : 'Show all'} {...tooltipProps}>
      <Button
        shape="circle"
        size="small"
        icon={<FilterOutlined style={{ fontSize: 12 }} />}
        type="linked"
        onClick={() => onChange(!value)}
        disabled={disabled}
      />
    </Tooltip>
  );
};

ViewToggleButton.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ViewToggleButton;
