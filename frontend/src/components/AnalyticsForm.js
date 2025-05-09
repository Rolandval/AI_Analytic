import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { getAnalytics } from '../api';

// Alert компонент для сповіщень
const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AnalyticsForm = ({ batteries }) => {
  const [comment, setComment] = useState('');
  const [analyticsResult, setAnalyticsResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Функція для закриття сповіщення
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!batteries || batteries.length === 0) {
      setError('Немає даних акумуляторів для аналізу');
      setSnackbar({
        open: true,
        message: 'Немає даних акумуляторів для аналізу',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Показуємо анімацію завантаження
      setShowLoader(true);

      const analyticsData = {
        batteries: batteries,
        comment: comment
      };

      // Імітуємо затримку для відображення анімації
      const result = await getAnalytics(analyticsData);
      
      // Успішний результат
      setAnalyticsResult(result);
      setSnackbar({
        open: true,
        message: 'Аналіз успішно завершено',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Помилка при отриманні аналітики');
      setSnackbar({
        open: true,
        message: 'Помилка при отриманні аналітики',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      // Затримка перед вимкненням лоадера
      setTimeout(() => {
        setShowLoader(false);
      }, 500);
    }
  };

  const theme = useTheme();
  
  return (
    <Box sx={{ mt: 4 }}>
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AnalyticsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Аналіз акумуляторів
              </Typography>
            </Box>
          }
          action={
            <Tooltip title="Як працює аналітика?">
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          }
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
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
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Коментар для аналізу"
              variant="outlined"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Введіть додаткові вказівки для аналізу акумуляторів..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                disabled={loading}
                sx={{
                  boxShadow: '0 4px 14px ' + alpha(theme.palette.primary.main, 0.2),
                  minWidth: '180px',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: '0 6px 20px ' + alpha(theme.palette.primary.main, 0.3),
                  },
                  '&::after': showLoader ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '3px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light}, ${theme.palette.primary.light})`,
                    backgroundSize: '200% 100%',
                    animation: 'loading 2s linear infinite',
                  } : {},
                  '@keyframes loading': {
                    '0%': { backgroundPosition: '0% 0%' },
                    '100%': { backgroundPosition: '200% 0%' },
                  },
                }}
              >
                {loading ? 'Аналізуємо...' : 'Запустити аналіз'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {analyticsResult && (
        <Card sx={{ mt: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Результати аналізу
                </Typography>
              </Box>
            }
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          />
          <CardContent sx={{ p: 3 }}>
            <Box 
              sx={{ 
                whiteSpace: 'pre-wrap',
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                p: 3,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {analyticsResult.analytics.split('\n').map((line, index) => {
                // Визначаємо, чи є рядок заголовком (починається з #, ** або має спеціальні ключові слова)
                const isHeader = line.startsWith('#') || 
                                line.startsWith('**') || 
                                line.includes('Загальний огляд') ||
                                line.includes('Аналіз кожного товару') ||
                                line.includes('Модель') ||
                                line.includes('Рекомендації');
                
                // Визначаємо, чи є рядок важливим (містить цифри або ключові слова)
                const isImportant = /\d+/.test(line) || 
                                  line.includes('Висока') ||
                                  line.includes('Преміум') ||
                                  line.includes('Середня') ||
                                  line.includes('маржинальність');
                
                return (
                  <Typography 
                    key={index} 
                    variant={isHeader ? 'subtitle1' : 'body1'}
                    component="div"
                    sx={{
                      fontWeight: isHeader ? 700 : (isImportant ? 600 : 400),
                      mb: isHeader ? 1.5 : 0.5,
                      color: isHeader ? theme.palette.primary.main : 'inherit',
                      borderBottom: isHeader ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
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
          </CardContent>
        </Card>
      )}
      
      {/* Сповіщення */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <AlertComponent onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </AlertComponent>
      </Snackbar>
    </Box>
  );
};

export default AnalyticsForm;
