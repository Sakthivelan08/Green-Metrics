import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { Period } from '@/services/ApiClient';
import { t } from 'i18next';

const stackTokens = { childrenGap: 15 };

interface FormData {
  month: string;
  quatter: number;
  yearName: string;
  fiscalYearId: number;
}

interface AddorUpdatePeriodProps {
  SelectedPeriod: any;
  recordId: number | undefined;
  ClosePopup: () => void;
}

export default function AddorUpdatePeriod(props: Readonly<AddorUpdatePeriodProps>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [quatterOptions, setQuatterOptions] = useState<IDropdownOption[]>([]);
  const [fiscalYearOptions, setFiscalYearOptions] = useState<IDropdownOption[]>([]);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      month: '',
      quatter: 0,
      yearName: '',
      fiscalYearId: 0
    }
  });

  useEffect(() => {
    fetchQuatterOptions();
    fetchFiscalYearOptions();
  }, []);

  const fetchQuatterOptions = async () => {
    try {
      const response = await apiClient.getQuatter();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((e: any) => ({ key: e.id, text: e.name }));
      setQuatterOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting quarters');
    }
  };
  const fetchFiscalYearOptions = async () => {
    try {
      const response = await apiClient.getAllFiscalYear(); 
      if (!response?.result) throw new Error("No result from API");
      const options = response.result.map((e: any) => ({ key: e.id, text: e.year }));
      setFiscalYearOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting fiscal years');
    }
  };

  const onSubmit = async (data: FormData) => {
    const period = new Period();

    period.init({
      month: data.month,
      quatter: data.quatter,
      yearName: data.yearName,
      fiscalYearId: data.fiscalYearId,
      createdBy: 0,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      id: 0,
      updatedBy: 0,
      isActive: true,
    });

    try {
      await apiClient.addOrUpdatePeriod(period);
      notify.showSuccessNotify('Period added/updated successfully');
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify('Error saving period');
    }
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="month"
            control={control}
            rules={{ required: 'Month is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('Month')}`}
                {...field}
                errorMessage={errors.month?.message?.toString()}
              />
            )}
          />
          <Controller
            name="quatter"
            control={control}
            rules={{ required: 'Quatter is required' }}
            render={({ field }) => (
              <Dropdown
                label="Quatter"
                options={quatterOptions}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.quatter?.message}
              />
            )}
          />
          <Controller
            name="yearName"
            control={control}
            defaultValue="FY" 
            rules={{
              required: 'Year Name is required',
              validate: (value) =>
                value.startsWith('FY') || 'Year Name must start with FY', 
            }}
            render={({ field }) => (
              <TextField
                label={`${t('Year Name')}`}
                {...field}
                value={field.value}
                onChange={(event) => {
                  const inputValue = (event.target as HTMLInputElement).value; 
                  if (!inputValue.startsWith('FY')) {
                    field.onChange(`FY${inputValue.replace(/FY/g, '')}`);
                  } else {
                    field.onChange(inputValue);
                  }
                }}
                errorMessage={errors.yearName?.message?.toString()}
              />
            )}
          />
          <Controller
            name="fiscalYearId"
            control={control}
            rules={{ required: 'Fiscal Year is required' }}
            render={({ field }) => (
              <Dropdown
                label="Fiscal Year"
                options={fiscalYearOptions}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.fiscalYearId?.message}
              />
            )}
          />
        </Stack>

        <div className="p-1 d-flex align-items-center justify-content-center">
          <PrimaryButton
            type="submit"
            text="Submit"
            disabled={!isValid}
          />
        </div>
      </form>
    </div>
  );
}
