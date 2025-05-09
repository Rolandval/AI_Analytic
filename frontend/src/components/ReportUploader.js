import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadReports } from '../api';

const ReportUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Перевіряємо, чи файл має правильне розширення
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (['xls', 'xlsx'].includes(fileExtension)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Будь ласка, виберіть файл у форматі XLS або XLSX');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Будь ласка, виберіть файл для завантаження');
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);
      setError(null);

      await uploadReports(file);
      setSuccess(true);
      setFile(null);
      
      // Очищаємо input file
      e.target.reset();
    } catch (err) {
      console.error('Error uploading report:', err);
      setError('Помилка при завантаженні звіту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Форма для завантаження звіту
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <input
            accept=".xls,.xlsx"
            style={{ display: 'none' }}
            id="report-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="report-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Вибрати файл
            </Button>
          </label>
          
          {file && (
            <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
              Вибрано: {file.name}
            </Typography>
          )}
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={24} /> : <CloudUploadIcon />}
        >
          {loading ? 'Завантаження...' : 'Завантажити звіт'}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Звіт успішно завантажено!
          </Alert>
        )}
      </form>
    </Paper>
  );
};

export default ReportUploader;
