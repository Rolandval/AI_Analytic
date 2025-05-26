import React from 'react';
import { Container, Typography, Divider, Grid, Box, alpha, useTheme } from '@mui/material';
import ReportUploader from '../components/ReportUploader';
import TextReportUploader from '../components/TextReportUploader';
import ParserButtons from '../components/ParserButtons';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SolarPowerIcon from '@mui/icons-material/SolarPower';

const Reports = ({ productType = 'batteries' }) => {
  const theme = useTheme();
  const isSolarPanels = productType === 'solar_panels';
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          position: 'relative',
          padding: '1.5rem',
          borderRadius: '12px',
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 8px 32px rgba(0, 0, 0, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {isSolarPanels ? 
            <SolarPowerIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} /> : 
            <BatteryChargingFullIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
          }
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0
          }}>
            {isSolarPanels ? 'Звіти та парсери сонячних панелей' : 'Завантаження звітів та парсери'}
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ maxWidth: '700px', mx: 'auto', color: 'text.secondary' }}>
          {isSolarPanels 
            ? 'Завантажуйте звіти про сонячні панелі та запускайте парсери для автоматичного збору даних' 
            : 'Завантажуйте звіти про акумулятори та запускайте парсери для автоматичного збору даних'}
        </Typography>
      </Box>

      {/* Секція завантаження звітів */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        mb: 3, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          display: 'inline-block',
          width: '4px',
          height: '24px',
          backgroundColor: theme.palette.primary.main,
          marginRight: '12px',
          borderRadius: '4px'
        }
      }}>
        {isSolarPanels ? 'Завантаження звітів сонячних панелей' : 'Завантаження звітів акумуляторів'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Компонент для завантаження файлів */}
          <ReportUploader />
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Компонент для завантаження текстових звітів */}
          <TextReportUploader />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Компонент для запуску парсерів */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        mb: 3, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          display: 'inline-block',
          width: '4px',
          height: '24px',
          backgroundColor: theme.palette.primary.main,
          marginRight: '12px',
          borderRadius: '4px'
        }
      }}>
        {isSolarPanels ? 'Парсери сонячних панелей' : 'Парсери акумуляторів'}
      </Typography>
      
      <ParserButtons productType={productType} />
    </Container>
  );
};

export default Reports;
