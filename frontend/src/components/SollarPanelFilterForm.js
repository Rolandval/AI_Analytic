import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Typography, 
  Slider, 
  Chip,
  IconButton,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAppContext } from '../context/AppContext';
import { getSollarPanelBrands, getSollarPanelSuppliers } from '../api';

const SollarPanelFilterForm = ({ onSubmit, initialValues }) => {
  const theme = useTheme();
  const { setError } = useAppContext();
  const [expanded, setExpanded] = useState(false);
  const [formValues, setFormValues] = useState(initialValues || {
    brand_ids: [],
    supplier_ids: [],
    powers: [],
    panel_types: [],
    cell_types: [],
    price_diapason: [0, 10000],
    page: 1,
    page_size: 10,
    sort_by: 'price',
    sort_order: 'desc',
  });
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Завантажуємо бренди та постачальників при першому рендері
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandsResponse, suppliersResponse] = await Promise.all([
          getSollarPanelBrands(),
          getSollarPanelSuppliers()
        ]);
        
        setBrands(brandsResponse || []);
        setSuppliers(suppliersResponse || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Помилка при завантаженні даних для фільтрації');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setError]);

  // Обробник зміни полів форми
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обробник зміни слайдера ціни
  const handlePriceChange = (event, newValue) => {
    setFormValues((prev) => ({
      ...prev,
      price_diapason: newValue,
    }));
  };

  // Обробник відправки форми
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  // Обробник скидання форми
  const handleReset = () => {
    setFormValues({
      brand_ids: [],
      supplier_ids: [],
      powers: [],
      panel_types: [],
      cell_types: [],
      price_diapason: [0, 10000],
      page: 1,
      page_size: 10,
      sort_by: 'price',
      sort_order: 'desc',
    });
  };

  // Обробник розгортання/згортання форми
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Фільтри пошуку
            </Typography>
          </Box>
          <IconButton onClick={toggleExpanded} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Бренди */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="brand-label">Бренди</InputLabel>
                  <Select
                    labelId="brand-label"
                    id="brand_ids"
                    name="brand_ids"
                    multiple
                    value={formValues.brand_ids}
                    onChange={handleChange}
                    label="Бренди"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const brand = brands.find(b => b.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={brand ? brand.name : value} 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Постачальники */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="supplier-label">Постачальники</InputLabel>
                  <Select
                    labelId="supplier-label"
                    id="supplier_ids"
                    name="supplier_ids"
                    multiple
                    value={formValues.supplier_ids}
                    onChange={handleChange}
                    label="Постачальники"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const supplier = suppliers.find(s => s.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={supplier ? supplier.name : value} 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Потужність */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="power-label">Потужність</InputLabel>
                  <Select
                    labelId="power-label"
                    id="powers"
                    name="powers"
                    multiple
                    value={formValues.powers}
                    onChange={handleChange}
                    label="Потужність"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={`${value} Вт`} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {[100, 200, 300, 400, 500, 600].map((power) => (
                      <MenuItem key={power} value={power}>
                        {power} Вт
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Тип панелі */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="panel-type-label">Тип панелі</InputLabel>
                  <Select
                    labelId="panel-type-label"
                    id="panel_types"
                    name="panel_types"
                    multiple
                    value={formValues.panel_types}
                    onChange={handleChange}
                    label="Тип панелі"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="одностороння">Одностороння</MenuItem>
                    <MenuItem value="двостороння">Двостороння</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Тип клітин */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="cell-type-label">Тип клітин</InputLabel>
                  <Select
                    labelId="cell-type-label"
                    id="cell_types"
                    name="cell_types"
                    multiple
                    value={formValues.cell_types}
                    onChange={handleChange}
                    label="Тип клітин"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="n-type">N-type</MenuItem>
                    <MenuItem value="p-type">P-type</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Діапазон цін */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Діапазон цін (грн)
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={formValues.price_diapason}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {formValues.price_diapason[0]} грн
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formValues.price_diapason[1]} грн
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Сортування */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="sort-by-label">Сортувати за</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort_by"
                    name="sort_by"
                    value={formValues.sort_by}
                    onChange={handleChange}
                    label="Сортувати за"
                  >
                    <MenuItem value="price">Ціна</MenuItem>
                    <MenuItem value="power">Потужність</MenuItem>
                    <MenuItem value="price_per_w">Ціна за Вт</MenuItem>
                    <MenuItem value="updated_at">Дата оновлення</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="sort-order-label">Порядок сортування</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    id="sort_order"
                    name="sort_order"
                    value={formValues.sort_order}
                    onChange={handleChange}
                    label="Порядок сортування"
                  >
                    <MenuItem value="asc">За зростанням</MenuItem>
                    <MenuItem value="desc">За спаданням</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Кнопки */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleReset}
                    sx={{ borderRadius: '8px' }}
                  >
                    Скинути
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<SearchIcon />}
                    sx={{ 
                      borderRadius: '8px',
                      boxShadow: '0 4px 10px ' + alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    Пошук
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Collapse>

        {!expanded && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<SearchIcon />}
              onClick={handleSubmit}
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 4px 10px ' + alpha(theme.palette.primary.main, 0.2),
              }}
            >
              Пошук
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SollarPanelFilterForm;
