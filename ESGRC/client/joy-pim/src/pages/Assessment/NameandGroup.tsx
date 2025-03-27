import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, FormControl, Select, MenuItem, InputLabel, CircularProgress } from '@mui/material';
import { IRole } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import { t } from 'i18next';
import NotificationManager from '@/services/NotificationManager';

interface NextStepProps {
  handleBack: () => void;
  handleNext: () => void;
  selectedGroupNameSetter: (name: string) => void;
  selectedRoleIdSetter: (id: number | null) => void;
  selectedAssessmentName: (name: string) => void;
  initialAssessmentName: string | null;
  initialSelectedGroup: string | null;
  initialSelectedRoleId: number | null;
}

const NameandGroup: React.FC<NextStepProps> = ({
  handleBack,
  handleNext,
  selectedGroupNameSetter,
  selectedRoleIdSetter,
  selectedAssessmentName,
  initialAssessmentName,
  initialSelectedGroup,
  initialSelectedRoleId,
}) => {
  const [assessmentName, setAssessmentName] = useState(initialAssessmentName || ''); 
  const [selectedGroup, setSelectedGroup] = useState(initialSelectedGroup || '');
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null); 
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(initialSelectedRoleId);
  const [validationError, setValidationError] = useState<string | null>(null); 
  const [validationsError, setValidationsError] = useState<string | null>(null);
  const [assessmentNameError, setAssessmentNameError] = useState<string | null>(null); 
  const [roleSelectionError, setRoleSelectionError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false); 
  const [isDataModified, setIsDataModified] = useState<boolean>(false);


  const notify = new NotificationManager();

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      const apiClient = new ApiManager().CreateApiClient();
      try {
        const response = await apiClient.getRoles(true);
        if (response?.result) {
          setRoles(response.result); 
        }
      } catch (error) {
        setError('Failed fetching roles');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);


  const handleDropdownChange = (value: string, id: number | null) => {
    setSelectedGroup(value);
    setSelectedRoleId(id);
    selectedGroupNameSetter(value);
    selectedRoleIdSetter(id);
    setRoleSelectionError(null); 
    setIsDataModified(true);
  };


  const handleSave = () => {
    let isValid = true;
    setAssessmentNameError(null);
    setRoleSelectionError(null);
    setValidationError(null);
    setValidationsError(null);
    if (!assessmentName.trim()) {
      setAssessmentNameError(t('ENTER_NAME'));
      isValid = false;
    }
  
    if (selectedRoleId === null) {
      setRoleSelectionError(t('SELECT_ROLE'));
      isValid = false;
    }
  
    if (isValid) {
      selectedAssessmentName(assessmentName); 
      setIsSaved(true);
      setIsDataModified(false); 
      notify.showSuccessNotify(t('SAVED_SUCCESSFULLY'));
    }
  };


  const handleNextClick = () => {
    if (isDataModified && !isSaved) {
      setValidationsError(t('SAVE_BEFORE_PROCEEDING'));
      return;
    }
    if (!assessmentName.trim() || selectedRoleId === null) {
      setValidationError(t('FILL_ALL_FIELDS'));
      return;
    }
    handleNext();
  };

  const handleBackClick = () => {
    setValidationsError(''); 
    handleBack();
  };

  return (
    <Box sx={{ p: 2, minHeight: '600px' }}>
      <Paper sx={{ p: 2 }}>
        {validationError && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
            {validationError}
          </Typography>
        )}
        
        <Typography variant="h5">{t('ASSESSMENT_NAME')}</Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={assessmentName}
          onChange={(e) => {
            setAssessmentName(e.target.value);
            setIsDataModified(true); 
          }}
          placeholder={t('ENTER_ASSESSMENT_NAME')?.toString()}
          sx={{ mt: 2, mb: 3 }}
        />
        {assessmentNameError && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
            {assessmentNameError}
          </Typography>
        )}
        
        <Typography variant="h5">{t('ASSESSMENT_GROUP')}</Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {t('USE_EXISTING_GROUP')}
        </Typography>

        <FormControl variant="outlined" sx={{ mt: 2, width: '200px' }}>
          <InputLabel id="group-select-label">Default Group</InputLabel>
          <Select
            labelId="group-select-label"
            value={selectedGroup}
            onChange={(e) => {
              const selectedRole = roles.find(role => role.name === e.target.value);
              handleDropdownChange(e.target.value as string, selectedRole?.id ?? null);
            }}
            label="Default Group"
          >
            {loading ? (
              <MenuItem disabled>
                <CircularProgress size={24} />
              </MenuItem>
            ) : (
              roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {roleSelectionError && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
            {roleSelectionError}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSave}>
            {t('BTN_SAVE')}
          </Button>
        </Box>

        {validationsError && (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
            {validationsError}
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleBackClick} sx={{ mr: 2 }}>
          {t('BTN_BACK')}
        </Button>
        <Button variant="contained" onClick={handleNextClick}>
          {t('BTN_NEXT')}
        </Button>
      </Box>
    </Box>
  );
};

export default NameandGroup;
