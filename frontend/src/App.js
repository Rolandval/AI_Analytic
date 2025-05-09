import React, { useState, useMemo, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import './App.css';

// Компоненти
import Layout from './components/Layout';

// Сторінки
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';

// Контекст
import { AppProvider } from './context/AppContext';

// Імпорт теми
import { createAppTheme } from './theme';

// Контекст для теми
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

function App() {
  // Стан для режиму теми (світла/темна)
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  
  // Функція для перемикання теми
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode); // Зберігаємо вибір користувача
      },
      mode,
    }),
    [mode],
  );

  // Створюємо тему на основі поточного режиму
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </Layout>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
