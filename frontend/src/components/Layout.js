import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Імпорт компонента перемикача теми
import ThemeToggle from './ThemeToggle';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Звіти та Парсери',
      icon: <UploadFileIcon />,
      path: '/reports',
    },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          background: theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          mb: 1,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <BatteryChargingFullIcon sx={{ 
          color: 'white', 
          mr: 1, 
          fontSize: 28,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.8 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.8 }
          }
        }} />
        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Акумулятори
        </Typography>
      </Box>
      <Divider sx={{ opacity: 0.6 }} />
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, mb: 2, fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.75rem' }}>
          ГОЛОВНЕ МЕНЮ
        </Typography>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                mb: 0.8,
                borderRadius: 2,
                py: 1.2,
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    transform: 'translateX(4px)',
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40, 
                  '& svg': { 
                    fontSize: 22,
                    transition: 'transform 0.2s ease-in-out',
                  },
                  '&:hover svg': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: '0.95rem',
                  letterSpacing: '0.2px'
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 3, background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)` }}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ fontWeight: 500 }}>
          © {new Date().getFullYear()} Battery Analytics
        </Typography>
        <Typography variant="caption" color="text.disabled" align="center" sx={{ display: 'block', mt: 0.5 }}>
          Версія 2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          background: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(30, 41, 59, 0.9)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 4px 20px rgba(0, 0, 0, 0.05)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Система аналізу акумуляторів
            </Typography>
          </Box>
          
          {/* Права частина AppBar */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Сповіщення */}
            <Tooltip title="Сповіщення">
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Перемикач теми */}
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Мобільна версія */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Краща продуктивність на мобільних
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Десктопна версія */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.standard,
          }),
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              opacity: 0,
              animation: 'fadeIn 0.5s ease-in-out forwards',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(10px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                },
              },
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
