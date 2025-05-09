import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

// Функція для створення теми з підтримкою світлого і темного режимів
export const createAppTheme = (mode) => {
  // Створюємо базову тему
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#3b82f6' : '#60a5fa', // Синій колір
        light: mode === 'light' ? '#93c5fd' : '#bfdbfe',
        dark: mode === 'light' ? '#1d4ed8' : '#2563eb',
        contrastText: '#fff',
      },
      secondary: {
        main: mode === 'light' ? '#4f46e5' : '#818cf8', // Фіолетовий
        light: mode === 'light' ? '#818cf8' : '#a5b4fc',
        dark: mode === 'light' ? '#4338ca' : '#4f46e5',
        contrastText: '#fff',
      },
      success: {
        main: mode === 'light' ? '#10b981' : '#34d399', // Зелений для позитивних станів
        light: mode === 'light' ? '#34d399' : '#6ee7b7',
        dark: mode === 'light' ? '#059669' : '#10b981',
      },
      error: {
        main: mode === 'light' ? '#ef4444' : '#f87171', // Червоний для помилок
        light: mode === 'light' ? '#f87171' : '#fca5a5',
        dark: mode === 'light' ? '#b91c1c' : '#ef4444',
      },
      warning: {
        main: mode === 'light' ? '#f59e0b' : '#fbbf24', // Жовтий для попереджень
        light: mode === 'light' ? '#fbbf24' : '#fcd34d',
        dark: mode === 'light' ? '#d97706' : '#f59e0b',
      },
      info: {
        main: mode === 'light' ? '#3b82f6' : '#60a5fa', // Інформаційний синій
        light: mode === 'light' ? '#60a5fa' : '#93c5fd',
        dark: mode === 'light' ? '#2563eb' : '#3b82f6',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a', // Фон
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
        dark: mode === 'light' ? '#f1f5f9' : '#0f172a', // Фон для контрасту
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc', // Основний текст
        secondary: mode === 'light' ? '#64748b' : '#cbd5e1', // Додатковий текст
        disabled: mode === 'light' ? '#94a3b8' : '#64748b',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.5px',
        lineHeight: 1.5,
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.05)',
      '0px 6px 12px rgba(0, 0, 0, 0.05)',
      '0px 8px 16px rgba(0, 0, 0, 0.05)',
      '0px 10px 20px rgba(0, 0, 0, 0.05)',
      '0px 12px 24px rgba(0, 0, 0, 0.05)',
      '0px 14px 28px rgba(0, 0, 0, 0.05)',
      '0px 16px 32px rgba(0, 0, 0, 0.05)',
      '0px 18px 36px rgba(0, 0, 0, 0.05)',
      '0px 20px 40px rgba(0, 0, 0, 0.05)',
      '0px 22px 44px rgba(0, 0, 0, 0.05)',
      '0px 24px 48px rgba(0, 0, 0, 0.05)',
      '0px 26px 52px rgba(0, 0, 0, 0.05)',
      '0px 28px 56px rgba(0, 0, 0, 0.05)',
      '0px 30px 60px rgba(0, 0, 0, 0.05)',
      '0px 32px 64px rgba(0, 0, 0, 0.05)',
      '0px 34px 68px rgba(0, 0, 0, 0.05)',
      '0px 36px 72px rgba(0, 0, 0, 0.05)',
      '0px 38px 76px rgba(0, 0, 0, 0.05)',
      '0px 40px 80px rgba(0, 0, 0, 0.05)',
      '0px 42px 84px rgba(0, 0, 0, 0.05)',
      '0px 44px 88px rgba(0, 0, 0, 0.05)',
      '0px 46px 92px rgba(0, 0, 0, 0.05)',
      '0px 48px 96px rgba(0, 0, 0, 0.05)',
    ],
  });

  // Додаємо компоненти для більш сучасного вигляду
  theme = createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          '*': {
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
          },
          html: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          },
          body: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.standard,
            }),
          },
          '#root': {
            width: '100%',
            height: '100%',
          },
          input: {
            '&[type=number]': {
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button': {
                margin: 0,
                WebkitAppearance: 'none',
              },
              '&::-webkit-inner-spin-button': {
                margin: 0,
                WebkitAppearance: 'none',
              },
            },
          },
          img: {
            display: 'block',
            maxWidth: '100%',
          },
        }),
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            boxShadow: theme.palette.mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
              : '0px 4px 20px rgba(0, 0, 0, 0.2)',
            transition: 'box-shadow 0.3s, transform 0.3s',
            '&:hover': {
              boxShadow: theme.palette.mode === 'light'
                ? '0px 8px 30px rgba(0, 0, 0, 0.08)'
                : '0px 8px 30px rgba(0, 0, 0, 0.3)',
            },
          }),
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '24px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.02em',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }),
          contained: ({ theme }) => ({
            boxShadow: theme.palette.mode === 'light' 
              ? '0 4px 14px rgba(0, 0, 0, 0.12)'
              : '0 4px 14px rgba(0, 0, 0, 0.25)',
            '&:hover': {
              boxShadow: theme.palette.mode === 'light'
                ? '0 6px 20px rgba(0, 0, 0, 0.15)'
                : '0 6px 20px rgba(0, 0, 0, 0.3)',
              background: theme.palette.mode === 'light'
                ? `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.mode === 'light'
                ? theme.palette.grey[300]
                : theme.palette.grey[700],
              color: theme.palette.mode === 'light'
                ? theme.palette.grey[500]
                : theme.palette.grey[500],
            },
          }),
          outlined: ({ theme }) => ({
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: theme.palette.mode === 'light'
                ? alpha(theme.palette.primary.main, 0.04)
                : alpha(theme.palette.primary.main, 0.12),
            },
          }),
          containedPrimary: {
            background: ({ theme }) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          },
          containedSecondary: {
            background: ({ theme }) => `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'light' 
              ? theme.palette.background.dark 
              : theme.palette.background.paper,
            '& .MuiTableCell-head': {
              color: theme.palette.text.primary,
              fontWeight: 600,
              padding: '16px',
              borderBottom: `2px solid ${theme.palette.divider}`,
              letterSpacing: '0.025em',
            },
          }),
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:last-child td': {
              borderBottom: 0,
            },
            '&:hover': {
              backgroundColor: theme.palette.mode === 'light'
                ? alpha(theme.palette.primary.main, 0.04)
                : alpha(theme.palette.primary.main, 0.08),
              transition: 'background-color 0.2s ease-in-out',
            },
            borderBottom: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.2s ease-in-out',
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: '16px',
            fontSize: '0.875rem',
          }),
          head: {
            fontSize: '0.875rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: ({ theme }) => theme.palette.mode === 'light' 
              ? theme.palette.primary.main 
              : theme.palette.primary.light,
          },
          body: {
            color: ({ theme }) => theme.palette.text.primary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            transition: theme.transitions.create(['background-color', 'box-shadow']),
          }),
          elevation1: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          },
          elevation2: {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
          },
          elevation3: {
            boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'light' 
              ? theme.palette.background.paper 
              : theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.palette.mode === 'light'
              ? '0 2px 10px rgba(0, 0, 0, 0.05)'
              : '0 2px 10px rgba(0, 0, 0, 0.2)',
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            border: 'none',
            transition: theme.transitions.create(['background-color']),
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: 8,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            transition: theme.transitions.create(['background-color', 'border-color']),
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'light'
                ? theme.palette.primary.main
                : theme.palette.primary.light,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          }),
          notchedOutline: ({ theme }) => ({
            borderColor: theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(255, 255, 255, 0.15)',
            transition: theme.transitions.create(['border-color']),
          }),
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            transition: 'all 0.2s',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 16,
            fontWeight: 500,
            transition: theme.transitions.create(['background-color', 'box-shadow']),
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[800], 0.9)
              : alpha(theme.palette.grey[700], 0.9),
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '0.75rem',
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }),
          arrow: ({ theme }) => ({
            color: theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[800], 0.9)
              : alpha(theme.palette.grey[700], 0.9),
          }),
        },
      },
    },
  });

  // Робимо шрифти адаптивними
  theme = responsiveFontSizes(theme);

  return theme;
};

export default createAppTheme;
