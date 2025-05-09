import React, { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Paper, Typography, CircularProgress, Chip } from '@mui/material';
import { getChart } from '../api';

// Реєструємо необхідні компоненти Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BatteryChart = ({ battery, onClose }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Отримуємо вибраних постачальників з пропсів, використовуючи useMemo
  const selectedSuppliers = useMemo(() => {
    return battery.selectedSuppliers || [];
  }, [battery.selectedSuppliers]);

  // Ефект для завантаження даних графіка
  useEffect(() => {
    const fetchChartData = async () => {
      if (!battery) return;

      try {
        setLoading(true);
        setError(null);

        // Підготовка даних для запиту відповідно до ChartDataSchema
        const chartRequest = {
          name: battery.name,
          full_name: battery.full_name,
          brand: battery.brand,
          volume: battery.volume,
          c_amps: battery.c_amps,
          polarity: battery.polarity,
          region: battery.region || 'EUROPE',
          include_suppliers: selectedSuppliers // Вибрані постачальники для графіка
        };

        const response = await getChart(chartRequest);
        
        if (response && response.chart) {
          setChartData(response.chart);
        } else {
          setError('Не вдалося отримати дані для графіка');
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Помилка при завантаженні даних графіка');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [battery, selectedSuppliers]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!chartData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Немає даних для відображення</Typography>
      </Box>
    );
  }

  // Відображення графіка з отриманими даними
  return (
    <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Графік цін для акумулятора: {battery.name}
      </Typography>
      
      {/* Відображення вибраних постачальників */}
      {selectedSuppliers.length > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1">Вибрані постачальники:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {selectedSuppliers.map((supplier) => (
              <Chip key={supplier} label={supplier} />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Відображення зображення графіка, яке повертається з бекенду */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <img 
          src={`data:image/png;base64,${chartData}`} 
          alt="Price Chart" 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
    </Paper>
  );
};

export default BatteryChart;
