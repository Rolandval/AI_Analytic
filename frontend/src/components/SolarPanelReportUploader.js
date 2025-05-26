import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  alpha,
  useTheme,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { uploadReports, uploadReportsText } from '../api';
import { useAppContext } from '../context/AppContext';

const SolarPanelReportUploader = () => {
  const theme = useTheme();
  const { setError } = useAppContext();
  const [file, setFile] = useState(null);
  const [supplierName, setSupplierName] = useState('');
  const [textReport, setTextReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('file'); // 'file' або 'text'

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSupplierNameChange = (event) => {
    setSupplierName(event.target.value);
  };

  const handleTextReportChange = (event) => {
    setTextReport(event.target.value);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Будь ласка, виберіть файл для завантаження');
      return;
    }

    if (!supplierName) {
      setError('Будь ласка, вкажіть назву постачальника');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Використовуємо productType='solar_panels' для API
      const response = await uploadReports(file, 'solar_panels');
      console.log('Upload response:', response);
      setSuccess('Звіт успішно завантажено!');
      setFile(null);
      // Очищаємо поле вибору файлу
      const fileInput = document.getElementById('solar-panel-report-file');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Помилка при завантаженні файлу: ' + (err.message || 'Невідома помилка'));
    } finally {
      setLoading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textReport.trim()) {
      setError('Будь ласка, введіть текст звіту');
      return;
    }

    if (!supplierName) {
      setError('Будь ласка, вкажіть назву постачальника');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Використовуємо productType='solar_panels' для API
      const response = await uploadReportsText(textReport, supplierName, 'solar_panels');
      console.log('Text upload response:', response);
      setSuccess('Текстовий звіт успішно завантажено!');
      setTextReport('');
    } catch (err) {
      console.error('Error uploading text report:', err);
      setError('Помилка при завантаженні текстового звіту: ' + (err.message || 'Невідома помилка'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SolarPowerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Завантаження звітів сонячних панелей
                </Typography>
              </Box>
              <Tooltip title="Завантажте звіти з цінами на сонячні панелі для аналізу">
                <HelpOutlineIcon sx={{ color: theme.palette.text.secondary }} />
              </Tooltip>
            </Box>
          }
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Назва постачальника"
                variant="outlined"
                fullWidth
                value={supplierName}
                onChange={handleSupplierNameChange}
                sx={{ mb: 3 }}
                placeholder="Введіть назву постачальника"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Button
                  variant={activeTab === 'file' ? 'contained' : 'outlined'}
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setActiveTab('file')}
                  sx={{ mr: 1 }}
                >
                  Файл
                </Button>
                <Button
                  variant={activeTab === 'text' ? 'contained' : 'outlined'}
                  startIcon={<TextSnippetIcon />}
                  onClick={() => setActiveTab('text')}
                >
                  Текст
                </Button>
              </Box>
              
              {activeTab === 'file' ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    border: '1px dashed', 
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02)
                  }}
                >
                  <input
                    accept=".xlsx,.xls,.csv,.txt,.pdf"
                    id="solar-panel-report-file"
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="solar-panel-report-file">
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="body1" gutterBottom>
                        Перетягніть файл сюди або
                      </Typography>
                      <Button 
                        variant="outlined" 
                        component="span"
                        sx={{ mt: 1 }}
                      >
                        Виберіть файл
                      </Button>
                      {file && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          Вибрано: {file.name}
                        </Typography>
                      )}
                    </Box>
                  </label>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFileUpload}
                      disabled={loading || !file}
                      startIcon={loading ? <CircularProgress size={24} /> : null}
                      sx={{ 
                        py: 1.5,
                        px: 4,
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px ' + alpha(theme.palette.primary.main, 0.2),
                        fontWeight: 600,
                        '&:hover': {
                          boxShadow: '0 6px 15px ' + alpha(theme.palette.primary.main, 0.3),
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {loading ? 'Завантаження...' : 'Завантажити звіт'}
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    border: '1px dashed', 
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02)
                  }}
                >
                  <TextField
                    label="Текст звіту"
                    multiline
                    rows={10}
                    variant="outlined"
                    fullWidth
                    value={textReport}
                    onChange={handleTextReportChange}
                    placeholder="Вставте текст звіту з цінами на сонячні панелі"
                  />
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleTextUpload}
                      disabled={loading || !textReport.trim()}
                      startIcon={loading ? <CircularProgress size={24} /> : null}
                      sx={{ 
                        py: 1.5,
                        px: 4,
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px ' + alpha(theme.palette.primary.main, 0.2),
                        fontWeight: 600,
                        '&:hover': {
                          boxShadow: '0 6px 15px ' + alpha(theme.palette.primary.main, 0.3),
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {loading ? 'Завантаження...' : 'Завантажити текст'}
                    </Button>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
          
          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {success}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolarPanelReportUploader;
