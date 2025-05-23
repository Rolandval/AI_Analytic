import React from 'react';
import { Container, Typography, Divider, Grid, Box } from '@mui/material';
import ReportUploader from '../components/ReportUploader';
import TextReportUploader from '../components/TextReportUploader';
import ParserButtons from '../components/ParserButtons';

const Reports = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Завантаження звітів та парсери
      </Typography>

      {/* Секція завантаження звітів */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Завантаження звітів
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
      <ParserButtons />
    </Container>
  );
};

export default Reports;
