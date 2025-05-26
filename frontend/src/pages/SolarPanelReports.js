import React from 'react';
import { Box, Typography, Container, Breadcrumbs, Link, useTheme, alpha } from '@mui/material';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SolarPanelReportUploader from '../components/SolarPanelReportUploader';
import ParserButtons from '../components/ParserButtons';

const SolarPanelReports = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Хлібні крихти */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '&:hover': { color: theme.palette.primary.main }
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Головна
        </Link>
        <Link
          color="inherit"
          href="/solar-panels"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '&:hover': { color: theme.palette.primary.main }
          }}
        >
          <SolarPowerIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Сонячні панелі
        </Link>
        <Typography 
          color="text.primary" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 500
          }}
        >
          Звіти
        </Typography>
      </Breadcrumbs>

      {/* Заголовок сторінки */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <SolarPowerIcon 
          sx={{ 
            fontSize: 40, 
            mr: 2, 
            color: theme.palette.primary.main,
            p: 1,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }} 
        />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Звіти сонячних панелей
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Завантажуйте звіти та запускайте парсери для аналізу цін на сонячні панелі
          </Typography>
        </Box>
      </Box>

      {/* Компонент для завантаження звітів */}
      <SolarPanelReportUploader />

      {/* Компонент для запуску парсерів */}
      <Box sx={{ mt: 4 }}>
        <ParserButtons productType="solar_panels" />
      </Box>
    </Container>
  );
};

export default SolarPanelReports;
