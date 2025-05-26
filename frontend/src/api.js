import axios from 'axios';

// Використовуємо змінну середовища або значення за замовчуванням
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

console.log('Using API URL:', API_URL);

// Створюємо екземпляр axios з базовим URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Для обходу помилок з самопідписаними сертифікатами у браузері
if (API_URL.startsWith('https')) {
  console.log('Using HTTPS with self-signed certificate. Adding special handling for browser environment.');
  
  // Додаємо обробник відповідей для логування помилок SSL
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.message === 'Network Error') {
        console.error('SSL Certificate Error detected. This is likely due to a self-signed certificate.');
        console.error('To fix this, you need to add an exception in your browser for this domain.');
        console.error('Try accessing the API directly in your browser first: ' + API_URL);
      }
      return Promise.reject(error);
    }
  );
}

// API для роботи з брендами
export const getBrands = async (productType = 'batteries') => {
  try {
    console.log(`Fetching ${productType} brands...`);
    const endpoint = productType === 'solar_panels' ? '/solar_panels/brands' : '/batteries/brands';
    const response = await api.get(endpoint);
    console.log(`${productType} brands response:`, response);
    
    // Перевірка наявності даних
    if (response.data && response.data.brands) {
      return response.data.brands;
    } else {
      console.warn(`No ${productType} brands data in response:`, response.data);
      return []; // Повертаємо порожній масив замість undefined
    }
  } catch (error) {
    console.error(`Error fetching ${productType} brands:`, error);
    return []; // Повертаємо порожній масив у випадку помилки
  }
};

// API для роботи з постачальниками
export const getSuppliers = async (productType = 'batteries') => {
  try {
    const endpoint = productType === 'solar_panels' ? '/solar_panels/suppliers' : '/batteries/suppliers';
    const response = await api.get(endpoint);
    return response.data.suppliers;
  } catch (error) {
    console.error(`Error fetching ${productType} suppliers:`, error);
    throw error;
  }
};

// API для завантаження звітів у текстовому форматі
export const uploadReportsText = async (text, supplierName, productType = 'batteries') => {
  try {
    const endpoint = productType === 'solar_panels'
      ? '/upload_solar_panels/ai_upload/upload_reports_text'
      : '/upload_batteries/ai_upload/upload_reports_text';
      
    console.log(`Uploading ${productType} text reports to:`, endpoint);
    
    const response = await api.post(endpoint, {
      text: text,
      supplier_name: supplierName
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading ${productType} text reports:`, error);
    throw error;
  }
};

// API для отримання акумуляторів з фільтрами
export const getCurrentBatteries = async (filters) => {
  try {
    // Перетворюємо фільтри у формат, який очікує бекенд
    const formattedFilters = {
      ...filters,
      // Переконуємося, що всі масиви не є null
      brand_ids: filters.brand_ids || [],
      supplier_ids: filters.supplier_ids || [],
      volumes: filters.volumes || [],
      polarities: filters.polarities || [],
      regions: filters.regions || [],
      electrolytes: filters.electrolytes || [],
      c_amps: filters.c_amps || [],
      // Переконуємося, що price_diapason є масивом чисел
      price_diapason: Array.isArray(filters.price_diapason) 
        ? filters.price_diapason.map(value => Number(value)) 
        : [0, 10000],
    };
    
    console.log('Sending filters to backend:', formattedFilters);
    
    const response = await api.post('/batteries/current_batteries', formattedFilters);
    return response.data;
  } catch (error) {
    console.error('Error fetching batteries:', error);
    throw error;
  }
};

// API для аналітики
export const getAnalytics = async (data) => {
  try {
    const response = await api.post('/batteries/analytics', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// API для отримання графіка
export const getChart = async (data) => {
  try {
    const response = await api.post('/batteries/chart', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching chart:', error);
    throw error;
  }
};

// API для завантаження звітів
export const uploadReports = async (file, productType = 'batteries') => {
  try {
    const endpoint = productType === 'solar_panels'
      ? '/upload_solar_panels/ai_upload/upload_reports'
      : '/upload_batteries/ai_upload/upload_reports';
      
    console.log(`Uploading ${productType} reports to:`, endpoint);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading ${productType} reports:`, error);
    throw error;
  }
};

// API для запуску парсера конкурентів
export const parseCompetitor = async (productType = 'batteries') => {
  try {
    const endpoint = productType === 'solar_panels'
      ? '/upload_solar_panels/ai_upload/parse_competitor'
      : '/upload_batteries/ai_upload/parse_competitor';
      
    console.log(`Using endpoint for ${productType} competitor parser:`, endpoint);
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error parsing ${productType} competitor:`, error);
    throw error;
  }
};

// API для запуску парсера наших цін
export const parseMe = async (productType = 'batteries') => {
  try {
    const endpoint = productType === 'solar_panels'
      ? '/upload_solar_panels/ai_upload/parse_me'
      : '/upload_batteries/ai_upload/parse_me';
      
    console.log(`Using endpoint for ${productType} own prices parser:`, endpoint);
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error parsing ${productType} own prices:`, error);
    throw error;
  }
};

// API для отримання порівняння цін з конкурентами
export const getPriceComparison = async () => {
  try {
    const response = await api.get('/batteries/price_comparison');
    return response.data;
  } catch (error) {
    console.error('Error fetching price comparison:', error);
    throw error;
  }
};

// API для отримання сонячних панелей з фільтрами
export const getCurrentSollarPanels = async (filters) => {
  try {
    // Перетворюємо фільтри у формат, який очікує бекенд
    const formattedFilters = {
      ...filters,
      // Переконуємося, що всі масиви не є null
      brand_ids: filters.brand_ids || [],
      supplier_ids: filters.supplier_ids || [],
      power: filters.power || [],
      panel_type: filters.panel_type || 'одностороння',
      cell_type: filters.cell_type || 'n-type',
      thickness: filters.thickness || [],
      // Переконуємося, що price_diapason є масивом чисел
      price_diapason: Array.isArray(filters.price_diapason) 
        ? filters.price_diapason.map(value => Number(value)) 
        : [0, 10000],
      // Додаємо підтримку для фільтрації за ціною за Вт
      price_per_w_diapason: Array.isArray(filters.price_per_w_diapason) 
        ? filters.price_per_w_diapason.map(value => Number(value)) 
        : [0, 5],
    };
    
    console.log('Sending solar panel filters to backend:', formattedFilters);
    
    const response = await api.post('/solar_panels/current_solar_panels', formattedFilters);
    return response.data;
  } catch (error) {
    console.error('Error fetching solar panels:', error);
    throw error;
  }
};

// API для аналітики сонячних панелей
export const getSolarPanelsAnalytics = async (data) => {
  try {
    const response = await api.post('/solar_panels/analytics', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching solar panels analytics:', error);
    throw error;
  }
};

// API для отримання графіка сонячних панелей
export const getSolarPanelsChart = async (data) => {
  try {
    const response = await api.post('/solar_panels/chart', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching solar panels chart:', error);
    throw error;
  }
};

// API для отримання порівняння цін сонячних панелей з конкурентами
export const getSolarPanelsPriceComparison = async () => {
  try {
    const response = await api.get('/solar_panels/price_comparison');
    return response.data;
  } catch (error) {
    console.error('Error fetching solar panels price comparison:', error);
    throw error;
  }
};

export default api;
