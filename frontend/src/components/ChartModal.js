import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  Box,
  CircularProgress
} from '@mui/material';
import { getSuppliers } from '../api';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ChartModal = ({ open, onClose, battery, onConfirm }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Завантаження списку постачальників
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchSuppliers();
      setSelectedSuppliers([]);  // Скидаємо вибір при кожному відкритті
    }
  }, [open]);

  // Обробник зміни вибраних постачальників
  const handleSupplierChange = (event) => {
    const { value } = event.target;
    setSelectedSuppliers(value);
  };

  // Обробник підтвердження вибору
  const handleConfirm = () => {
    onConfirm(battery, selectedSuppliers);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Вибір постачальників для графіка</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FormControl sx={{ mt: 2, width: '100%' }}>
            <InputLabel id="suppliers-select-label">Постачальники</InputLabel>
            <Select
              labelId="suppliers-select-label"
              multiple
              value={selectedSuppliers}
              onChange={handleSupplierChange}
              input={<OutlinedInput id="select-suppliers" label="Постачальники" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Скасувати
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">
          Сформувати графік
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChartModal;
