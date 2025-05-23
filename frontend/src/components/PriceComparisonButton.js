import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Snackbar
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MuiAlert from '@mui/material/Alert';
import { getPriceComparison } from '../api';

// Alert компонент для сповіщень
const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PriceComparisonButton = () => {
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const theme = useTheme();

  // Функція для закриття сповіщення
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Функція для отримання порівняння цін
  const handleCompareClick = async () => {
    try {
      setLoading(true);
      setError(null);
      setComparisonResult(null);

      const result = await getPriceComparison();
      
      setComparisonResult(result);
      setSnackbar({
        open: true,
        message: 'Порівняння цін успішно завершено',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching price comparison:', err);
      setError('Помилка при отриманні порівняння цін');
      setSnackbar({
        open: true,
        message: 'Помилка при отриманні порівняння цін',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CompareArrowsIcon sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Порівняння цін з конкурентами
              </Typography>
            </Box>
          }
          action={
            <Tooltip title="Порівняння цін з конкурентами">
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          }
          sx={{
            backgroundColor: alpha(theme.palette.info.main, 0.03),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="info"
            size="large"
            fullWidth
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CompareArrowsIcon />}
            onClick={handleCompareClick}
            disabled={loading}
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              }
            }}
          >
            {loading ? 'Порівнюємо ціни...' : 'Порівняти з конкурентами'}
          </Button>

          {comparisonResult && (
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 3, 
                p: 3, 
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                Результати порівняння цін
              </Typography>
              
              <Box 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  mt: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {comparisonResult.price_comparison.split('\n').map((line, index) => {
                  // Визначаємо, чи є рядок заголовком
                  const isHeader = line.trim().startsWith('#') || 
                                  line.trim().startsWith('-') || 
                                  line.trim().startsWith('*') ||
                                  line.includes('Топ-3') ||
                                  line.includes('Висновки') ||
                                  line.includes('Рекомендації');
                  
                  // Визначаємо, чи містить рядок емодзі
                  // eslint-disable-next-line no-unused-vars
                  const hasEmoji = /[\u{1F300}-\u{1F6FF}]/u.test(line);
                  
                  // Визначаємо, чи містить рядок відсотки або цифри
                  const hasNumbers = /\d+%|\d+\s*грн|\d+\.\d+/.test(line);
                  
                  return (
                    <Typography 
                      key={index} 
                      variant={isHeader ? 'subtitle1' : 'body1'}
                      component="div"
                      sx={{
                        fontWeight: isHeader ? 700 : (hasNumbers ? 600 : 400),
                        mb: isHeader ? 1.5 : 0.5,
                        color: isHeader ? theme.palette.info.main : 
                              (hasNumbers ? theme.palette.text.primary : theme.palette.text.secondary),
                        borderBottom: isHeader ? `1px solid ${alpha(theme.palette.info.main, 0.2)}` : 'none',
                        pb: isHeader ? 0.5 : 0,
                        opacity: 0,
                        animation: `fadeIn 0.5s ease-in-out forwards ${index * 0.03}s`,
                        '@keyframes fadeIn': {
                          '0%': {
                            opacity: 0,
                            transform: 'translateY(5px)'
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'translateY(0)'
                          },
                        },
                      }}
                    >
                      {line || ' '}
                    </Typography>
                  );
                })}
              </Box>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Сповіщення */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <AlertComponent 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </AlertComponent>
      </Snackbar>
    </Box>
  );
};

export default PriceComparisonButton;
