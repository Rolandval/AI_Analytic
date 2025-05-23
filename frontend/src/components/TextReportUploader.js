import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { uploadReportsText } from '../api';

const TextReportUploader = () => {
  const [text, setText] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    setError(null);
  };

  const handleSupplierChange = (e) => {
    setSupplierName(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Будь ласка, введіть текст для аналізу');
      return;
    }

    if (!supplierName.trim()) {
      setError('Будь ласка, введіть назву постачальника');
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);
      setError(null);

      await uploadReportsText(text, supplierName);
      setSuccess(true);
      setText('');
      setSupplierName('');
    } catch (error) {
      console.error('Error uploading text report:', error);
      setError(error.response?.data?.detail || 'Помилка при завантаженні тексту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Завантажити текстовий звіт
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Введіть текст з даними про акумулятори для аналізу та імпорту в базу даних.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Текст успішно завантажено та оброблено!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="supplier-name-label">Назва постачальника</InputLabel>
          <Select
            labelId="supplier-name-label"
            id="supplier-name"
            value={supplierName}
            label="Назва постачальника"
            onChange={handleSupplierChange}
            disabled={loading}
          >
            <MenuItem value="Акумулятор центр">Акумулятор центр</MenuItem>
            <MenuItem value="АвтоЗвук">АвтоЗвук</MenuItem>
            <MenuItem value="АКУ Львів">АКУ Львів</MenuItem>
            <MenuItem value="MAKB">MAKB</MenuItem>
            <MenuItem value="Шип-Шина">Шип-Шина</MenuItem>
            <MenuItem value="AET.UA">AET.UA</MenuItem>
            <MenuItem value="AKB-MAG">AKB-MAG</MenuItem>
            <MenuItem value="AKB+">AKB+</MenuItem>
            <MenuItem value="Дві Клеми">Дві Клеми</MenuItem>
            <MenuItem value="Інший">Інший</MenuItem>
          </Select>
        </FormControl>
        
        {supplierName === 'Інший' && (
          <TextField
            margin="normal"
            fullWidth
            id="custom-supplier"
            label="Введіть назву постачальника"
            name="customSupplier"
            onChange={(e) => setSupplierName(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="text-report"
          label="Текст звіту"
          name="textReport"
          multiline
          rows={10}
          value={text}
          onChange={handleTextChange}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={24} /> : <TextSnippetIcon />}
        >
          {loading ? 'Завантаження...' : 'Завантажити текст'}
        </Button>
      </Box>
    </Paper>
  );
};

export default TextReportUploader;
