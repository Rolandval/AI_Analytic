import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handlePreviousPage}
        disabled={currentPage <= 1}
        startIcon={<ArrowBackIcon />}
        sx={{ mr: 2 }}
      >
        Попередня
      </Button>
      
      <Typography variant="body1" sx={{ mx: 2 }}>
        Сторінка {currentPage} з {totalPages || 1}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
        endIcon={<ArrowForwardIcon />}
        sx={{ ml: 2 }}
      >
        Наступна
      </Button>
    </Box>
  );
};

export default Pagination;
