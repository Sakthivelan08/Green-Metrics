import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import { FiscalYear } from '@/services/ApiClient';

const stackTokens = { childrenGap: 15 };

interface FormData {
  startMonth: string;
  endMonth: string;
  year: number;
}

interface AddOrUpdateFiscalYearProps {
  SelectedPeriod: any;
  recordId: number | undefined;
  ClosePopup: () => void;
}

export default function AddOrUpdateFiscalYear(props: Readonly<AddOrUpdateFiscalYearProps>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [monthsOptions, setmonthsOptions] = useState<IDropdownOption[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      startMonth: '',
      endMonth: '',
      year: 0,
    },
  });

  useEffect(() => {
    fetchmonthsOptions();
  }, []);

  const fetchmonthsOptions = async () => {
    try {
      const response = await apiClient.getMonths();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((e: any) => ({ key: e.id, text: e.name }));
      setmonthsOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting months');
    }
  };

  const onSubmit = async (data: FormData) => {
    const period = new FiscalYear({
      year: data.year,
      startMonth: data.startMonth,
      endMonth: data.endMonth,
    });
    try {
      await apiClient.addOrUpdateFiscalYear(period);
      notify.showSuccessNotify('Period added/updated successfully');
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify('Error saving period');
    }
  };

  const getSelectedKey = (value: string) => {
    return monthsOptions.find((option) => option.text === value)?.key;
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="year"
            control={control}
            rules={{
              required: 'Fiscal Year is required',
              validate: (value) => /^\d+$/.test(String(value)) || 'Only numbers are allowed',
            }}
            render={({ field }) => (
              <TextField
                label={`${t('SUBMENU_FISCALYEAR')}`}
                {...field}
                value={field.value ? String(field.value) : ''}
                onChange={(
                  event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                  newValue?: string,
                ) => {
                  const inputValue = newValue || '';
                  field.onChange(inputValue);
                }}
                errorMessage={errors.year?.message}
              />
            )}
          />
            <Controller
              name="startMonth"
              control={control}
              rules={{ required: 'Startmonth is required' }}
              render={({ field }) => (
                <Dropdown
                  label="Start Month"
                  options={monthsOptions}
                  selectedKey={getSelectedKey(field.value)}
                  onChange={(_, option) => field.onChange(option?.text)}
                  errorMessage={errors.startMonth?.message}
                />
              )}
            />
          <Controller
            name="endMonth"
            control={control}
            rules={{ required: 'Endmonth is required' }}
            render={({ field }) => (
              <Dropdown
                label="End Month"
                options={monthsOptions}
                selectedKey={getSelectedKey(field.value)}
                onChange={(_, option) => field.onChange(option?.text)}
                errorMessage={errors.endMonth?.message}
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
