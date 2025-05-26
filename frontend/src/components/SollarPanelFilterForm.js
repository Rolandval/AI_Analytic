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
import { getBrands, getSuppliers } from '../api';

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
    price_per_w_diapason: [0, 5],  // Додаємо діапазон ціни за Вт
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
          getBrands('solar_panels'),
          getSuppliers('solar_panels')
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

  // Обробник зміни слайдерів
  const handleSliderChange = (name, newValue) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  
  // Обробник зміни слайдера ціни
  const handlePriceChange = (event, newValue) => {
    handleSliderChange('price_diapason', newValue);
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
      price_per_w_diapason: [0, 5],  // Додаємо діапазон ціни за Вт
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
    <Card sx={{ 
      mb: 3, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
    }}>
      <CardContent sx={{ 
        pb: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Фільтри пошуку
            </Typography>
          </Box>
          <IconButton 
            onClick={toggleExpanded} 
            size="small"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
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
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    marginRight: '8px'
                  }
                }}>
                  Діапазон цін (грн)
                </Typography>
                <Box sx={{ 
                  px: 2, 
                  py: 1,
                  backgroundColor: alpha(theme.palette.background.default, 0.7),
                  borderRadius: '8px',
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                }}>
                  <Slider
                    value={formValues.price_diapason}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                    sx={{
                      color: theme.palette.primary.main,
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.3
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      ${formValues.price_diapason[0]}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      ${formValues.price_diapason[1]}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Діапазон цін за Вт */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 16,
                    backgroundColor: theme.palette.success.main,
                    marginRight: 1,
                    borderRadius: 1
                  }
                }}>
                  Ціна за Вт ($/Вт)
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={formValues.price_per_w_diapason || [0, 5]}
                    onChange={(e, newValue) => handleSliderChange('price_per_w_diapason', newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={5}
                    step={0.1}
                    sx={{
                      color: theme.palette.success.main,
                      '& .MuiSlider-thumb': {
                        height: 16,
                        width: 16,
                        backgroundColor: '#fff',
                        border: `2px solid ${theme.palette.success.main}`,
                        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                          boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.2)}`
                        },
                      },
                      '& .MuiSlider-valueLabel': {
                        backgroundColor: theme.palette.success.main,
                        height: 16,
                        boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.2)}`
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.3
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.success.main,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      ${formValues.price_per_w_diapason ? formValues.price_per_w_diapason[0] : 0}/Вт
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.success.main,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      ${formValues.price_per_w_diapason ? formValues.price_per_w_diapason[1] : 5}/Вт
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
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 2,
                  mt: 2,
                  pt: 2,
                  borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleReset}
                    sx={{ 
                      borderRadius: '8px',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
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
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        boxShadow: '0 6px 15px ' + alpha(theme.palette.primary.main, 0.3),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease-in-out'
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
