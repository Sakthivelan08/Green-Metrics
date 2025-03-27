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
    yearId: number;
    yearName: string;
    metricId: number; 
    timeDimensionId: number; 
    formulaeField: string;  
}

interface AddOrUpdateTimeDimensionProps {
  SelectedPeriod: any;
  recordId: number | undefined;
  ClosePopup: () => void;
}

export default function AddOrUpdateTimeDimension(props: AddOrUpdateTimeDimensionProps) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [metricOptions, setMetricOptions] = useState<IDropdownOption[]>([]); 
  const [timeDimensionOptions, setTimeDimensionOptions] = useState<IDropdownOption[]>([]);  
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
    defaultValues: {
      yearId: 0,
      yearName: '',
      metricId: 0, 
      timeDimensionId: 0, 
      formulaeField: '',  
    },
  });

  useEffect(() => {
    fetchMetricOptions();
    fetchTimeDimensionOptions();
  }, []);

  const fetchMetricOptions = async () => {
    try {
      const response = await apiClient.getMetric();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((metric: any) => ({ key: metric.id, text: metric.name }));
      setMetricOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting metrics');
    }
  };

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

  const createTimeDimension = async (data: FormData, cancelToken?: CancelToken) => {
    const body: CalculationProcess = new CalculationProcess();
    body.createdBy = 0;  
    body.dateCreated = new Date().toISOString(); 
    body.dateModified = new Date().toISOString(); 
    body.id = 0; 
    body.updatedBy = 0;  
    body.isActive = true;  
    body.ingestionId = undefined; 
    body.calculation = undefined;  
    body.timeDimension = data.timeDimensionId;  
    body.metricId = data.metricId; 
    body.formulaeField = undefined;  
    if (body.init) {
      body.init();  
    }
    try {
      const response = await apiClient.createTimeDimension(body, cancelToken);
      if (response?.hasError) {
        notify.showErrorNotify(`Error creating Time Dimension: ${response.message || 'Unknown error'}`);
      } else {
        notify.showSuccessNotify('Time Dimension created successfully');
        props.ClosePopup();  
      }
    } catch (error) {
      notify.showErrorNotify('Failed to create Time Dimension');
    }
  };

 
  const onSubmit = (data: FormData) => {
    createTimeDimension(data);  
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>

          <Controller
            name="metricId"
            control={control}
            rules={{ required: 'Metric is required' }}
            render={({ field }) => (
              <Dropdown
                label="Metric"
                options={metricOptions}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.metricId?.message}
              />
            )}
          />

          <Controller
            name="timeDimensionId"
            control={control}
            rules={{ required: 'Time Dimension is required' }}
            render={({ field }) => (
              <Dropdown
                label="Time Dimension"
                options={timeDimensionOptions}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.timeDimensionId?.message}
              />
            )}
          />

          {/* <Controller
            name="formulaeField"  
            control={control}
            render={({ field }) => (
              <TextField
                label="Formula"
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                errorMessage={errors.formulaeField?.message}  
              />
            )}
          /> */}
        </Stack>
        <div className="p-1 d-flex align-items-center justify-content-center">
          <PrimaryButton className="submitglobal" type="submit" text="Submit" disabled={!isValid} />
        </div>
      </form>
    </div>
  );
}
