import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Drawer, List, ListItem, ListItemText, Checkbox, Divider, CircularProgress } from '@mui/material';
import { IService } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import { t } from 'i18next';
import NotificationManager from '@/services/NotificationManager';

interface ServiceProps {
  handleBack: () => void;
  handleNext: () => void;
  selectedServiceNameSetter: (name: string) => void;
  selectedServiceIdSetter: (id: number) => void;
  selectedServiceId?: number | null;
  selectedServiceName?: string | null;
}

const Service: React.FC<ServiceProps> = ({
  handleBack,
  handleNext,
  selectedServiceNameSetter,
  selectedServiceIdSetter,
  selectedServiceId = null,
  selectedServiceName = null 
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(selectedServiceId); 
  const [selectedServiceTemp, setSelectedServiceTemp] = useState<number | null>(selectedServiceId); 
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notify = new NotificationManager();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const apiClient = new ApiManager().CreateApiClient();
      try {
        const response = await apiClient.getServices();
        if (response?.result) {
          setServices(response.result);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    setSelectedService(selectedServiceId);
    setSelectedServiceTemp(selectedServiceId); 
  }, [selectedServiceId]);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleToggleService = (id: number, name?: string) => {
    if (selectedService === id) {
      setSelectedService(null);
      selectedServiceNameSetter(''); 
       
    } else {
      setSelectedService(id); 
      if (name) {
        selectedServiceNameSetter(name); 
      }
    }
    setError(null); 
    
  };

  const handleSave = () => {
    if (selectedService !== null && selectedServiceName) {
      selectedServiceIdSetter(selectedService); 
      selectedServiceNameSetter(selectedServiceName);
      setSelectedServiceTemp(selectedService); 
      toggleDrawer(false)(); 
      notify.showSuccessNotify(t('SAVED_SUCCESSFULLY')); 
    } else {
      setError(t('PLEASE_SELECT_SERVICE')); 
    }
  };

  const handleNextClick = () => {
    if (selectedService === null) {
      setError(t('PLEASE_SELECT_SERVICE')); 
      return;
    }
    setError(null); 
    handleNext(); 
  };

  return (
    <Box sx={{ p: 2, minHeight: '400px' }}>
      <Paper elevation={3} sx={{ padding: 3, textAlign: 'left' }}>
        <Typography variant="h4" gutterBottom>
          {t('SERVICE_COMPONENT')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={toggleDrawer(true)}
          sx={{ mt: 2 }}
        >
          {t('SELECT_SERVICE')}
        </Button>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mt: 2, padding: 2, border: 'none', borderRadius: '4px', width: '200px', height: '150px' }}> {/* Reduced height here */}
          <Typography variant="h5">{t('SELECTED_SERVICE')}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {selectedServiceTemp ? services.find(service => service.id === selectedServiceTemp)?.name || 'No Service Selected' : 'No Service Selected'}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleBack} sx={{ mr: 2 }}>
          {t('BTN_BACK')}
        </Button>
        <Button variant="contained" onClick={handleNextClick}>
          {t('BTN_NEXT')}
        </Button>
      </Box>
      
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)} sx={{ '& .MuiDrawer-paper': { width: 400 } }}>
        <Box sx={{ padding: 2, width: '400px' }}>
          <Typography variant="h5" gutterBottom>
            {t('SELECT_SERVICE')} 
          </Typography>
          <Divider />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {services.map((service) => (
                <ListItem key={service.id}>
                  <Checkbox
                    checked={selectedService === service.id}
                    onChange={() => handleToggleService(service.id!, service.name)}
                  />
                  <ListItemText primary={service.name} />
                </ListItem>
              ))}
            </List>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mt: 2 }}
              disabled={selectedService === null}
            >
              {t('BTN_SAVE')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={toggleDrawer(false)}
              sx={{ mt: 2, ml: 1 }}
            >
              {t('BTN_CANCEL')}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Service;
