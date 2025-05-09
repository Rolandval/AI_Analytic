import React, { useContext } from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../App';

/**
 * Компонент перемикача теми (світла/темна)
 * Використовує контекст ColorModeContext з App.js
 */
const ThemeToggle = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  
  return (
    <Tooltip title={theme.palette.mode === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}>
      <IconButton
        onClick={colorMode.toggleColorMode}
        color="inherit"
        sx={{
          ml: 1,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(30deg)',
          },
        }}
        aria-label="toggle theme"
      >
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon sx={{ color: 'primary.light' }} />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
