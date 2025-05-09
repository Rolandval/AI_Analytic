import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Створюємо екземпляр axios з базовим URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API для роботи з брендами
export const getBrands = async () => {
  try {
    const response = await api.get('/batteries/brands');
    return response.data.brands;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
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
    
    const response = await api.post('/ai_upload/upload_reports', formData, {
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
    const response = await api.post('/ai_upload/parse_competitor');
    return response.data;
  } catch (error) {
    console.error('Error parsing competitor:', error);
    throw error;
  }
};

// API для запуску парсера наших цін
export const parseMe = async () => {
  try {
    const response = await api.post('/ai_upload/parse_me');
    return response.data;
  } catch (error) {
    console.error('Error parsing me:', error);
    throw error;
  }
};

export default api;
