import React, { useState } from 'react';
import { 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Grid,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import { parseCompetitor, parseMe } from '../api';

const ParserButtons = ({ productType = 'batteries' }) => {
  const theme = useTheme();
  const isSolarPanels = productType === 'solar_panels';
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [meLoading, setMeLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleParseCompetitor = async () => {
    try {
      setCompetitorLoading(true);
      setSuccess(null);
      setError(null);

      await parseCompetitor(productType);
      setSuccess(isSolarPanels 
        ? 'Парсер конкурентів сонячних панелей успішно запущено!' 
        : 'Парсер конкурентів акумуляторів успішно запущено!');
    } catch (err) {
      console.error(`Error parsing ${productType} competitor:`, err);
      setError(isSolarPanels 
        ? 'Помилка при запуску парсера конкурентів сонячних панелей' 
        : 'Помилка при запуску парсера конкурентів акумуляторів');
    } finally {
      setCompetitorLoading(false);
    }
  };

  const handleParseMe = async () => {
    try {
      setMeLoading(true);
      setSuccess(null);
      setError(null);

      await parseMe(productType);
      setSuccess(isSolarPanels 
        ? 'Парсер наших цін на сонячні панелі успішно запущено!' 
        : 'Парсер наших цін успішно запущено!');
    } catch (err) {
      console.error(`Error parsing ${productType} own prices:`, err);
      setError(isSolarPanels 
        ? 'Помилка при запуску парсера наших цін на сонячні панелі' 
        : 'Помилка при запуску парсера наших цін');
    } finally {
      setMeLoading(false);
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isSolarPanels ? 
          <SolarPowerIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> : 
          <BatteryChargingFullIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        }
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isSolarPanels ? 'Запуск парсерів сонячних панелей' : 'Запуск парсерів акумуляторів'}
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={competitorLoading}
            startIcon={competitorLoading ? <CircularProgress size={24} /> : <StorageIcon />}
            onClick={handleParseCompetitor}
            sx={{ 
              py: 1.5,
              borderRadius: '8px',
              boxShadow: '0 4px 10px ' + alpha(theme.palette.primary.main, 0.2),
              fontWeight: 600,
              '&:hover': {
                boxShadow: '0 6px 15px ' + alpha(theme.palette.primary.main, 0.3),
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {competitorLoading ? 'Запуск парсера...' : 
              isSolarPanels ? 'Парсер конкурентів сонячних панелей' : 'Парсер конкурентів'}
          </Button>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            disabled={meLoading}
            startIcon={meLoading ? <CircularProgress size={24} /> : <StorageIcon />}
            onClick={handleParseMe}
            sx={{ 
              py: 1.5,
              borderRadius: '8px',
              boxShadow: '0 4px 10px ' + alpha(theme.palette.secondary.main, 0.2),
              fontWeight: 600,
              '&:hover': {
                boxShadow: '0 6px 15px ' + alpha(theme.palette.secondary.main, 0.3),
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {meLoading ? 'Запуск парсера...' : 
              isSolarPanels ? 'Парсер наших цін на сонячні панелі' : 'Парсер наших цін'}
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default ParserButtons;
