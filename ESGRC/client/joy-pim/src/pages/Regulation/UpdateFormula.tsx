import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import AuthManagerService from '@/services/AuthManagerService';
import { CalculationProcess } from '@/services/ApiClient';
import { CancelToken } from 'axios';

const stackTokens = { childrenGap: 15 };

interface FormData {
  timeDimensionId: number;
  formulaeField: string;
}

interface AddOrUpdateTimeDimensionProps {
  SelectedPeriod: any;
  recordId: number | undefined;
  ClosePopup: () => void;
  selectedTimeDimension: number; 
  selectedFormula: string;        
}


export default function UpdateFormula(props: AddOrUpdateTimeDimensionProps) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [metricOptions, setMetricOptions] = useState<IDropdownOption[]>([]);
  const [timeDimensionOptions, setTimeDimensionOptions] = useState<IDropdownOption[]>([]);
  const [formula, setFormula] = useState<string>('');  
  const authManager = new AuthManagerService();
  const isAuthenticated = authManager.isAuthenticated();
  const user = isAuthenticated ? authManager.getUserData() : null;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {},
  });


  useEffect(() => {
    if (props.recordId) {
      fetchTimeDimensionOptions(); 
    }
    setValue('timeDimensionId', props.selectedTimeDimension); 
    setValue('formulaeField', props.selectedFormula);
  }, [props.recordId, props.selectedTimeDimension, props.selectedFormula]);
  

  const fetchTimeDimensionOptions = async () => {
    try {
      const response = await apiClient.getTimeDimension();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((timeDim: any) => ({ key: timeDim.id, text: timeDim.name }));
      setTimeDimensionOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting time dimensions');
    }
  };

  const calculateNewFormula = async (timeDimensionId: number | undefined, cancelToken?: CancelToken) => {
    if (!timeDimensionId) return;
    try {
      const response = await apiClient.calculateNewFormula(timeDimensionId, cancelToken);
      if (response?.result) {
        setFormula(response.result);  
        setValue('formulaeField', response.result);  
      }
    } catch (error) {
      notify.showErrorNotify('Error calculating new formula');
    }
  };

  const updateFormula = async (id: number | undefined, timeDimensionId: number | undefined, formula: string | undefined, cancelToken?: CancelToken) => {
    
    if (!id || !timeDimensionId || !formula) {
      notify.showErrorNotify('Missing required fields for formula update');
      return;
    }
    try {
      const response = await apiClient.updateFormula(id, timeDimensionId, formula, cancelToken);
      if (response?.hasError) {
        notify.showErrorNotify(`Error updating formula: ${response.message || 'Unknown error'}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
        props.ClosePopup();
      }
    } catch (error) {
      notify.showErrorNotify('Failed to update formula');
    }
  };

  const onSubmit = (data: FormData) => {
    updateFormula(props.recordId, data.timeDimensionId, formula);
  };

  const handleTimeDimensionChange = async (timeDimensionId: number) => {
    await calculateNewFormula(timeDimensionId);
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="timeDimensionId"
            control={control}
            rules={{ required: 'Time Dimension is required' }}
            render={({ field }) => (
              <Dropdown
                label="Time Dimension"
                options={timeDimensionOptions}
                selectedKey={field.value || props.selectedTimeDimension} 
                onChange={(_, option) => {
                  field.onChange(option?.key);
                  handleTimeDimensionChange(option?.key as number);  
                }}
                errorMessage={errors.timeDimensionId?.message}
              />
            )}
          />
          <Controller
            name="formulaeField"
            control={control}
            render={({ field }) => (
              <TextField
                label="Formula"
                value={field.value || props.selectedFormula}
                onChange={(_, newValue) => field.onChange(newValue)}
                errorMessage={errors.formulaeField?.message}
              />
            )}
          />
        </Stack>
        <div className="p-1 d-flex align-items-center justify-content-center">
          <PrimaryButton className="submitglobal" type="submit" text="Submit" disabled={!isValid} />
        </div>
      </form>
    </div>
  );
}
