import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Typography,
  Box,
  Card,
  CardHeader,
  Chip,
  Tooltip,
  IconButton,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import TableChartIcon from '@mui/icons-material/TableChart';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EuroIcon from '@mui/icons-material/Euro';

const BatteryTable = ({ batteries, onChartClick, loading }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  if (loading) {
    return (
      <Card sx={{ mt: 2, mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Результати пошуку
              </Typography>
            </Box>
          }
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Завантаження даних...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (!batteries || batteries.length === 0) {
    return (
      <Card sx={{ mt: 2, mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Результати пошуку
              </Typography>
            </Box>
          }
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <InfoIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Немає даних для відображення
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
            Спробуйте змінити параметри фільтрації або розширити діапазон пошуку
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2, mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Результати пошуку ({batteries.length})
            </Typography>
          </Box>
        }
        action={
          <Tooltip title={expanded ? "Згорнути таблицю" : "Розгорнути таблицю"}>
            <IconButton onClick={toggleExpanded}>
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Tooltip>
        }
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider',
          '& .MuiCardHeader-action': { m: 0 }
        }}
      />
      {expanded && (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }} aria-label="battery table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Назва</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Бренд</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Постачальник</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Об'єм</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Пусковий струм</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Полярність</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Регіон</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Електроліт</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Ціна</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Дата оновлення</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batteries.map((battery) => (
                <TableRow
                  key={battery.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {battery.full_name}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={battery.brand} 
                      size="small" 
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }} 
                    />
                  </TableCell>
                  <TableCell>{battery.supplier}</TableCell>
                  <TableCell>{battery.volume}</TableCell>
                  <TableCell>{battery.c_amps}</TableCell>
                  <TableCell>{battery.polarity}</TableCell>
                  <TableCell>
                    <Chip 
                      label={battery.region || 'Не вказано'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={battery.electrolyte || 'Не вказано'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {battery.price} грн
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(battery.updated_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<BarChartIcon />}
                      onClick={() => onChartClick(battery)}
                      sx={{
                        boxShadow: '0 2px 8px ' + alpha(theme.palette.primary.main, 0.2),
                        '&:hover': {
                          boxShadow: '0 4px 12px ' + alpha(theme.palette.primary.main, 0.3),
                        }
                      }}
                    >
                      Графік
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
};

export default BatteryTable;
