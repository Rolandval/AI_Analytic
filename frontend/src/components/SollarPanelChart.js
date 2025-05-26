import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader, Typography, alpha, useTheme, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { getSolarPanelsChart } from '../api';
import { useAppContext } from '../context/AppContext';

const SollarPanelChart = ({ panel }) => {
  const theme = useTheme();
  const { setError } = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!panel || !panel.id || !panel.selectedSuppliers) return;
      
      try {
        setLoading(true);
        // Підготуємо дані для запиту
        const chartData = {
          ...panel,
          include_suppliers: panel.selectedSuppliers
        };
        const response = await getSolarPanelsChart(chartData);
        
        // Перевіряємо структуру відповіді
        if (response && response.chart) {
          // Розбираємо дані з відповіді
          const chartData = JSON.parse(response.chart);
          
          // Перетворюємо дані для графіка, якщо вони у правильному форматі
          if (chartData && chartData.datasets) {
            const formattedData = chartData.datasets.map(item => ({
              date: new Date(item.date).toLocaleDateString(),
              ...item.suppliers
            }));
            
            setChartData(formattedData);
          } else {
            console.error('Unexpected chart data format:', chartData);
            setChartData([]);
          }
        } else {
          console.error('No chart data in response:', response);
          setChartData([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Помилка при завантаженні даних для графіка');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [panel, setError]);

  // Якщо немає даних для відображення
  if (!panel || !panel.id || !panel.selectedSuppliers || panel.selectedSuppliers.length === 0) {
    return null;
  }

  // Створюємо унікальні кольори для кожного постачальника
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Отримуємо унікальні імена постачальників з даних
  const suppliers = panel.selectedSuppliers;

  return (
    <Card sx={{ mt: 4, mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShowChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Динаміка цін для {panel.full_name}
            </Typography>
          </Box>
        }
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      />
      <Box sx={{ p: 2, height: 400 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
            <Typography variant="body1" color="text.secondary" align="center">
              Немає даних для відображення
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Спробуйте вибрати інших постачальників або перевірте наявність історичних даних
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Ціна (грн)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip 
                formatter={(value) => [`${value} грн`, 'Ціна']}
                labelFormatter={(label) => `Дата: ${label}`}
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="top" 
                wrapperStyle={{ paddingBottom: '10px' }}
                formatter={(value) => <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>{value}</span>}
              />
              {suppliers.map((supplier, index) => (
                <Bar 
                  key={supplier}
                  dataKey={supplier} 
                  name={supplier}
                  fill={colors[index % colors.length]} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Card>
  );
};

export default SollarPanelChart;
