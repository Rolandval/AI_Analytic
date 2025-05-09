import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Divider, alpha } from '@mui/material';
import FilterForm from '../components/FilterForm';
import BatteryTable from '../components/BatteryTable';
import Pagination from '../components/Pagination';
import BatteryChart from '../components/BatteryChart';
import ChartModal from '../components/ChartModal';
import AnalyticsForm from '../components/AnalyticsForm';
import { useAppContext } from '../context/AppContext';
import { getCurrentBatteries } from '../api';

const Dashboard = () => {
  const { loading: globalLoading, setLoading, error: globalError, setError } = useAppContext();
  const [batteries, setBatteries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [tempSelectedBattery, setTempSelectedBattery] = useState(null);
  const [filters, setFilters] = useState({
    brand_ids: [],
    supplier_ids: [],
    volumes: [],
    polarities: [],
    c_amps: [],
    price_diapason: [0, 10000],
    page: 1,
    page_size: 10,
    sort_by: 'price',
    sort_order: 'desc',
  });

  // Функція для отримання акумуляторів з фільтрами
  const fetchBatteries = async (filterParams) => {
    try {
      setLoading(true);
      const response = await getCurrentBatteries(filterParams);
      setBatteries(response.batteries || []);
      setTotalPages(response.total_pages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching batteries:', err);
      setError('Помилка при завантаженні акумуляторів');
      setBatteries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Обробник відправки форми фільтрації
  const handleFilterSubmit = (formValues) => {
    const newFilters = { ...formValues, page: 1 }; // Скидаємо сторінку на першу при зміні фільтрів
    setFilters(newFilters);
    setCurrentPage(1);
    fetchBatteries(newFilters);
  };

  // Обробник зміни сторінки
  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    setCurrentPage(newPage);
    fetchBatteries(newFilters);
  };

  // Обробник кліку на кнопку графіка - відкриває модальне вікно
  const handleChartClick = (battery) => {
    setTempSelectedBattery(battery);
    setChartModalOpen(true);
  };

  // Обробник закриття модального вікна
  const handleCloseChartModal = () => {
    setChartModalOpen(false);
  };

  // Обробник підтвердження вибору постачальників
  const handleConfirmSuppliers = (battery, selectedSuppliers) => {
    // Встановлюємо вибраний акумулятор та передаємо вибраних постачальників
    setSelectedBattery({...battery, selectedSuppliers});
  };

  // Завантажуємо акумулятори при першому рендері
  useEffect(() => {
    fetchBatteries(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          position: 'relative',
          padding: '1.5rem',
          borderRadius: '12px',
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)',
          boxShadow: (theme) => theme.palette.mode === 'light' 
            ? '0 8px 32px rgba(0, 0, 0, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.2)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '4px',
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '2px',
          }
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            display: 'inline-block',
            textShadow: (theme) => theme.palette.mode === 'dark' ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '120%',
              height: '100%',
              top: '10px',
              left: '-10%',
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)' 
                : 'none',
              zIndex: -1,
              borderRadius: '50%',
            }
          }}
        >
          Dashboard акумулятори аналітика
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            maxWidth: '700px', 
            mx: 'auto',
            color: 'text.secondary',
            fontWeight: 500,
            lineHeight: 1.6
          }}
        >
          Сучасна система аналізу та моніторингу цін на акумулятори з розширеними можливостями фільтрації
        </Typography>
      </Box>

      {/* Форма фільтрації */}
      <FilterForm onSubmit={handleFilterSubmit} initialValues={filters} />

      {/* Індикатор завантаження */}
      {globalLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Повідомлення про помилку */}
      {globalError && (
        <Typography color="error" sx={{ my: 2 }}>
          {globalError}
        </Typography>
      )}

      {/* Таблиця акумуляторів */}
      <BatteryTable 
        batteries={batteries} 
        onChartClick={handleChartClick} 
        loading={globalLoading} 
      />

      {/* Пагінація */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />

      {/* Модальне вікно для вибору постачальників */}
      <ChartModal 
        open={chartModalOpen} 
        onClose={handleCloseChartModal} 
        battery={tempSelectedBattery} 
        onConfirm={handleConfirmSuppliers} 
      />

      {/* Графік для вибраного акумулятора */}
      {selectedBattery && (
        <BatteryChart battery={selectedBattery} />
      )}

      <Divider sx={{ my: 4 }} />

      {/* Форма для аналітики */}
      <AnalyticsForm batteries={batteries} />
    </Container>
  );
};

export default Dashboard;
