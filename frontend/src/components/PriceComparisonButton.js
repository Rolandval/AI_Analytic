import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import { getPriceComparison, getSolarPanelsPriceComparison } from '../api';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const PriceComparisonButton = () => {
  const theme = useTheme();
  const { setError } = useAppContext();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  
  const isSolarPanelsPage = location.pathname === '/solar-panels';

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    
    try {
      let response;
      if (isSolarPanelsPage) {
        response = await getSolarPanelsPriceComparison();
      } else {
        response = await getPriceComparison();
      }
      setComparisonData(response.price_comparison);
      setError(null);
    } catch (err) {
      console.error('Error fetching price comparison:', err);
      setError('Помилка при завантаженні порівняння цін');
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isSolarPanelsPage ? 
                  <SolarPowerIcon sx={{ mr: 1, color: theme.palette.info.main }} /> : 
                  <CompareArrowsIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                }
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isSolarPanelsPage ? 'Порівняння цін сонячних панелей' : 'Порівняння цін акумуляторів'}
                </Typography>
              </Box>
              <Tooltip title="Отримайте детальне порівняння ваших цін з цінами конкурентів на ринку">
                <HelpOutlineIcon sx={{ color: theme.palette.text.secondary }} />
              </Tooltip>
            </Box>
          }
          sx={{
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Button
            variant="contained"
            startIcon={isSolarPanelsPage ? <SolarPowerIcon /> : <CompareArrowsIcon />}
            onClick={handleOpen}
            sx={{
              mt: 2,
              boxShadow: '0 4px 10px ' + alpha(theme.palette.primary.main, 0.2),
              '&:hover': {
                boxShadow: '0 6px 15px ' + alpha(theme.palette.primary.main, 0.3),
              }
            }}
          >
            {isSolarPanelsPage ? 'Порівняти ціни сонячних панелей' : 'Порівняти ціни акумуляторів'}
          </Button>

          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isSolarPanelsPage ? 
                  <SolarPowerIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> : 
                  <BatteryChargingFullIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                }
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isSolarPanelsPage ? 'Порівняння цін сонячних панелей' : 'Порівняння цін акумуляторів'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, minHeight: '400px' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Завантаження даних порівняння...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {comparisonData ? (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {comparisonData}
                    </Typography>
                  ) : (
                    <Alert severity="info">
                      Немає даних для відображення. Спробуйте оновити порівняння або перевірте наявність даних у системі.
                    </Alert>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Закрити</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PriceComparisonButton;
