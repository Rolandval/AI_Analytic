import axios from 'axios';

// Використовуємо змінну середовища або значення за замовчуванням
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
export const getBrands = async () => {
  try {
    console.log('Fetching brands...');
    const response = await api.get('/batteries/brands');
    console.log('Brands response:', response);
    
    // Перевірка наявності даних
    if (response.data && response.data.brands) {
      return response.data.brands;
    } else {
      console.warn('No brands data in response:', response.data);
      return []; // Повертаємо порожній масив замість undefined
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    return []; // Повертаємо порожній масив у випадку помилки
  }
};

// API для роботи з постачальниками
export const getSuppliers = async () => {
  try {
    const response = await api.get('/batteries/suppliers');
    return response.data.suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
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
export const uploadReports = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload_batteries/ai_upload/upload_reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading reports:', error);
    throw error;
  }
};

// API для запуску парсера конкурентів
export const parseCompetitor = async () => {
  try {
    const response = await api.post('/upload_batteries/ai_upload/parse_competitor');
    return response.data;
  } catch (error) {
    console.error('Error parsing competitor:', error);
    throw error;
  }
};

// API для запуску парсера наших цін
export const parseMe = async () => {
  try {
    const response = await api.post('/upload_batteries/ai_upload/parse_me');
    return response.data;
  } catch (error) {
    console.error('Error parsing me:', error);
    throw error;
  }
};

export default api;
