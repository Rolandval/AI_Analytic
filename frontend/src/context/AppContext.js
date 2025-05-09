import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBrands, getSuppliers } from '../api';

// Створюємо контекст
const AppContext = createContext();

// Хук для використання контексту
export const useAppContext = () => useContext(AppContext);

// Провайдер контексту
export const AppProvider = ({ children }) => {
  // Стан для брендів
  const [brands, setBrands] = useState([]);
  // Стан для постачальників
  const [suppliers, setSuppliers] = useState([]);
  // Стан для індикатора завантаження
  const [loading, setLoading] = useState(false);
  // Стан для помилок
  const [error, setError] = useState(null);

  // Функція для завантаження брендів
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      setBrands(data);
      setError(null);
    } catch (err) {
      setError('Помилка при завантаженні брендів');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Функція для завантаження постачальників
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError('Помилка при завантаженні постачальників');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Завантажуємо дані при першому рендері
  useEffect(() => {
    fetchBrands();
    fetchSuppliers();
  }, []);

  // Значення, які будуть доступні через контекст
  const value = {
    brands,
    suppliers,
    loading,
    error,
    fetchBrands,
    fetchSuppliers,
    setLoading,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
