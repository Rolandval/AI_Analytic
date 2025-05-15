import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  // eslint-disable-next-line no-unused-vars
  Box,
  Button,
  FormControl,
  // eslint-disable-next-line no-unused-vars
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Typography,
  Slider,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';
import Select from 'react-select';
import { useAppContext } from '../context/AppContext';

// Схема валідації
const validationSchema = yup.object({
  volumes: yup.array().nullable(),
  c_amps: yup.array().nullable(),
  polarities: yup.array().nullable(),
  price_diapason: yup.array().nullable(),
  page: yup.number().min(1, 'Сторінка має бути більше 0').required('Обов\'язкове поле'),
  page_size: yup.number().min(1, 'Розмір сторінки має бути більше 0').required('Обов\'язкове поле'),
});

const FilterForm = ({ onSubmit, initialValues }) => {
  const { brands, suppliers } = useAppContext();
  const [priceRange, setPriceRange] = useState([0, 10000]);

  // Опції для полярності
  const polarityOptions = [
    { value: 'R+', label: 'R+' },
    { value: 'L+', label: 'L+' },
    { value: 'all', label: 'Всі' },
  ];

  // Опції для регіону
  const regionOptions = [
    { value: 'ASIA', label: 'Азія' },
    { value: 'EUROPE', label: 'Європа' },
  ];

  // Опції для типу електроліту
  const electrolyteOptions = [
    { value: 'LAB', label: 'LAB' },
    { value: 'GEL', label: 'GEL' },
    { value: 'AGM', label: 'AGM' },
    { value: 'EFB', label: 'EFB' },
  ];

  // Опції для сортування
  const sortByOptions = [
    { value: 'price', label: 'Ціна' },
    { value: 'c_amps', label: 'Пусковий струм' },
    { value: 'volume', label: 'Об\'єм' },
    { value: 'region', label: 'Регіон' },
  ];

  // Опції для порядку сортування
  const sortOrderOptions = [
    { value: 'asc', label: 'За зростанням' },
    { value: 'desc', label: 'За спаданням' },
  ];

  // Перетворюємо бренди та постачальників у формат для react-select
  const brandOptions = brands && brands.length ? brands.map(brand => ({
    value: brand.id,
    label: brand.name,
  })) : [];

  const supplierOptions = suppliers && suppliers.length ? suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
  })) : [];

  // Налаштовуємо formik
  const formik = useFormik({
    initialValues: initialValues || {
      brand_ids: [],
      supplier_ids: [],
      volumes: [],
      polarities: [],
      regions: [],
      electrolytes: [],
      c_amps: [],
      price_diapason: [0, 10000],
      page: 1,
      page_size: 10,
      sort_by: 'price',
      sort_order: 'desc',
    },
    validationSchema,
    onSubmit: (values) => {
      // Перетворюємо значення з react-select у формат для API
      const formattedValues = {
        ...values,
        brand_ids: values.brand_ids.map(brand => brand.value),
        supplier_ids: values.supplier_ids.map(supplier => supplier.value),
        volumes: values.volumes.length > 0 ? values.volumes.map(v => parseFloat(v)) : null,
        c_amps: values.c_amps.length > 0 ? values.c_amps.map(c => parseInt(c)) : null,
        polarities: values.polarities.length > 0 ? values.polarities.map(p => p.value) : null,
        // Детальне логування регіонів
        regions: (() => {
          console.log('Regions before formatting:', values.regions);
          const formattedRegions = values.regions && values.regions.length > 0 ? values.regions.map(r => r.value) : [];
          console.log('Formatted regions:', formattedRegions);
          return formattedRegions;
        })(),
        // Детальне логування електролітів
        electrolytes: (() => {
          console.log('Electrolytes before formatting:', values.electrolytes);
          const formattedElectrolytes = values.electrolytes && values.electrolytes.length > 0 ? values.electrolytes.map(e => e.value) : [];
          console.log('Formatted electrolytes:', formattedElectrolytes);
          return formattedElectrolytes;
        })(),
        // Переконуємося, що price_diapason - це масив чисел
        price_diapason: Array.isArray(values.price_diapason) ? values.price_diapason.map(value => Number(value)) : [0, 10000],
        // Переконуємося, що sort_by та sort_order передаються як рядки
        sort_by: typeof values.sort_by === 'object' ? values.sort_by.value : values.sort_by,
        sort_order: typeof values.sort_order === 'object' ? values.sort_order.value : values.sort_order,
      };
      onSubmit(formattedValues);
    },
  });

  // Оновлюємо діапазон цін при зміні значення слайдера
  useEffect(() => {
    formik.setFieldValue('price_diapason', priceRange.map(value => Number(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange]);

  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ mb: 3, overflow: 'visible', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Фільтрація акумуляторів
            </Typography>
          </Box>
        }
        action={
          <Tooltip title={expanded ? "Згорнути фільтри" : "Розгорнути фільтри"}>
            <IconButton onClick={toggleExpanded}>
              <TuneIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiCardHeader-action': { m: 0 }
        }}
      />
      <CardContent sx={{ p: expanded ? 4 : 0, transition: 'padding 0.3s ease' }}>
        {expanded && <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
          {/* Бренди */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Бренд
            </Typography>
            <Select
              isMulti
              name="brand_ids"
              options={brandOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formik.values.brand_ids}
              onChange={(selectedOptions) => {
                formik.setFieldValue('brand_ids', selectedOptions || []);
              }}
              placeholder="Виберіть бренди"
            />
          </Grid>

          {/* Постачальники */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Постачальники
            </Typography>
            <Select
              isMulti
              name="supplier_ids"
              options={supplierOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formik.values.supplier_ids}
              onChange={(selectedOptions) => {
                formik.setFieldValue('supplier_ids', selectedOptions || []);
              }}
              placeholder="Виберіть постачальників"
            />
          </Grid>

          {/* Об'єм акумулятора */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="volumes"
              name="volumes"
              label="Об'єм акумулятора"
              value={formik.values.volumes.join(', ')}
              onChange={(e) => {
                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                formik.setFieldValue('volumes', values);
              }}
              error={formik.touched.volumes && Boolean(formik.errors.volumes)}
              helperText={formik.touched.volumes && formik.errors.volumes}
              placeholder="Наприклад: 60, 75, 90"
            />
          </Grid>

          {/* Пусковий струм */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="c_amps"
              name="c_amps"
              label="Пусковий струм"
              value={formik.values.c_amps.join(', ')}
              onChange={(e) => {
                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                formik.setFieldValue('c_amps', values);
              }}
              error={formik.touched.c_amps && Boolean(formik.errors.c_amps)}
              helperText={formik.touched.c_amps && formik.errors.c_amps}
              placeholder="Наприклад: 540, 600, 720"
            />
          </Grid>

          {/* Полярність */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" gutterBottom>
              Полярність
            </Typography>
            <Select
              isMulti
              name="polarities"
              options={polarityOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formik.values.polarities}
              onChange={(selectedOptions) => {
                formik.setFieldValue('polarities', selectedOptions || []);
              }}
              placeholder="Виберіть полярність"
            />
          </Grid>

          {/* Регіон */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" gutterBottom>
              Регіон
            </Typography>
            <Select
              isMulti
              name="regions"
              options={regionOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formik.values.regions}
              onChange={(selectedOptions) => {
                formik.setFieldValue('regions', selectedOptions || []);
              }}
              placeholder="Виберіть регіон"
            />
          </Grid>

          {/* Тип електроліту */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" gutterBottom>
              Тип електроліту
            </Typography>
            <Select
              isMulti
              name="electrolytes"
              options={electrolyteOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formik.values.electrolytes}
              onChange={(selectedOptions) => {
                formik.setFieldValue('electrolytes', selectedOptions || []);
              }}
              placeholder="Виберіть тип електроліту"
            />
          </Grid>

          {/* Ціновий діапазон */}
          <Grid item xs={12}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight="500">
                Ціновий діапазон
              </Typography>
              <Chip 
                label={`${priceRange[0]} - ${priceRange[1]} грн`} 
                size="small" 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }} 
              />
            </Box>
            <Box sx={{ px: 1 }}>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => {
                  console.log('New price range:', newValue);
                  setPriceRange(newValue.map(value => Number(value)));
                }}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                    }
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.5,
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Розмір сторінки */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="page-size-label">Розмір сторінки</InputLabel>
              <MuiSelect
                labelId="page-size-label"
                id="page_size"
                name="page_size"
                value={formik.values.page_size}
                label="Розмір сторінки"
                onChange={formik.handleChange}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </MuiSelect>
            </FormControl>
          </Grid>

          {/* Сортування за полем */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" gutterBottom>
              Сортування за полем
            </Typography>
            <Select
              name="sort_by"
              options={sortByOptions}
              className="basic-select"
              classNamePrefix="select"
              value={sortByOptions.find(option => option.value === formik.values.sort_by)}
              onChange={(selectedOption) => {
                formik.setFieldValue('sort_by', selectedOption.value);
              }}
              placeholder="Виберіть поле для сортування"
            />
          </Grid>

          {/* Порядок сортування */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" gutterBottom>
              Порядок сортування
            </Typography>
            <Select
              name="sort_order"
              options={sortOrderOptions}
              className="basic-select"
              classNamePrefix="select"
              value={sortOrderOptions.find(option => option.value === formik.values.sort_order)}
              onChange={(selectedOption) => {
                formik.setFieldValue('sort_order', selectedOption.value);
              }}
              placeholder="Виберіть порядок сортування"
            />
          </Grid>

          {/* Роздільник перед кнопками */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          {/* Кнопки дій */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={() => {
                  formik.resetForm();
                  setPriceRange([0, 10000]);
                }}
                sx={{
                  borderRadius: '8px',
                  padding: '8px 16px',
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: '1.5px',
                  '&:hover': {
                    borderWidth: '1.5px',
                  }
                }}
              >
                Скинути
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                sx={{ 
                  borderRadius: '8px',
                  padding: '8px 24px',
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: '200px',
                  boxShadow: '0 4px 12px ' + alpha(theme.palette.primary.main, 0.2),
                  '&:hover': {
                    boxShadow: '0 6px 14px ' + alpha(theme.palette.primary.main, 0.3),
                  }
                }}
              >
                Застосувати фільтри
              </Button>
            </Box>
          </Grid>
        </Grid>
        </form>}
      </CardContent>
    </Card>
  );
};

export default FilterForm;
