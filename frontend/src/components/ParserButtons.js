import React, { useState } from 'react';
import { 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Grid,
  // eslint-disable-next-line no-unused-vars
  Box
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import { parseCompetitor, parseMe } from '../api';

const ParserButtons = () => {
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [meLoading, setMeLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleParseCompetitor = async () => {
    try {
      setCompetitorLoading(true);
      setSuccess(null);
      setError(null);

      await parseCompetitor();
      setSuccess('Парсер конкурентів успішно запущено!');
    } catch (err) {
      console.error('Error parsing competitor:', err);
      setError('Помилка при запуску парсера конкурентів');
    } finally {
      setCompetitorLoading(false);
    }
  };

  const handleParseMe = async () => {
    try {
      setMeLoading(true);
      setSuccess(null);
      setError(null);

      await parseMe();
      setSuccess('Парсер наших цін успішно запущено!');
    } catch (err) {
      console.error('Error parsing me:', err);
      setError('Помилка при запуску парсера наших цін');
    } finally {
      setMeLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Запуск парсерів
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={competitorLoading}
            startIcon={competitorLoading ? <CircularProgress size={24} /> : <StorageIcon />}
            onClick={handleParseCompetitor}
            sx={{ py: 1.5 }}
          >
            {competitorLoading ? 'Запуск парсера...' : 'Парсер конкурентів'}
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
            sx={{ py: 1.5 }}
          >
            {meLoading ? 'Запуск парсера...' : 'Парсер наших цін'}
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
