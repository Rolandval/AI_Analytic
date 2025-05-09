import React from 'react';
import { Container, Typography, Divider, 
  // eslint-disable-next-line no-unused-vars
  Grid, 
  // eslint-disable-next-line no-unused-vars
  Box 
} from '@mui/material';
import ReportUploader from '../components/ReportUploader';
import ParserButtons from '../components/ParserButtons';

const Reports = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Завантаження звітів та парсери
      </Typography>

      {/* Компонент для завантаження звітів */}
      <ReportUploader />

      <Divider sx={{ my: 4 }} />

      {/* Компонент для запуску парсерів */}
      <ParserButtons />
    </Container>
  );
};

export default Reports;
