import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import {
  DEFAULT_TAKEOFF_HEADING,
  TakeoffHeadingMode,
} from '~/features/show/constants';

import RotationField from '~/components/RotationField';

export const TakeoffHeadingSpecEditor = ({ takeoffHeading, onChange }) => {
  const { type = TakeoffHeadingMode.NONE, value = '0' } =
    takeoffHeading || DEFAULT_TAKEOFF_HEADING;

  const onTypeChanged = useCallback(
    (event) => {
      const type = event.target.value;
      if (onChange) {
        onChange({ ...takeoffHeading, type });
      }
    },
    [onChange, takeoffHeading]
  );

  const onValueChanged = useCallback(
    (value) => {
      if (onChange) {
        onChange({ ...takeoffHeading, value: String(value) });
      }
    },
    [onChange, takeoffHeading]
  );

  return (
    <Box display='flex' flexDirection='row' pt={2} pb={1}>
      <FormControl fullWidth variant='filled'>
        <InputLabel htmlFor='takeoff-heading-type'>
          UAV headings before takeoff are...
        </InputLabel>
        <Select
          value={type}
          inputProps={{ id: 'takeoff-heading-type' }}
          onChange={onTypeChanged}
        >
          <MenuItem value={TakeoffHeadingMode.NONE}>Unspecified</MenuItem>
          <MenuItem value={TakeoffHeadingMode.ABSOLUTE}>
            Specified by absolute compass direction
          </MenuItem>
          <MenuItem value={TakeoffHeadingMode.RELATIVE}>
            Specified relative to show orientation
          </MenuItem>
        </Select>
      </FormControl>
      <Box p={1} />
      <RotationField
        disabled={type === TakeoffHeadingMode.NONE}
        style={{ minWidth: 160 }}
        label={
          type === TakeoffHeadingMode.ABSOLUTE
            ? 'Compass direction'
            : 'Heading offset'
        }
        value={value}
        variant='filled'
        onChange={onValueChanged}
      />
    </Box>
  );
};

TakeoffHeadingSpecEditor.propTypes = {
  takeoffHeading: PropTypes.shape({
    mode: PropTypes.oneOf(Object.values(TakeoffHeadingMode)),
    value: PropTypes.string.isRequired,
  }),
  onChange: PropTypes.func,
};