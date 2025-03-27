import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, Dropdown, IDropdownOption } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import { MetricStandard } from '@/services/ApiClient';

const stackTokens = { childrenGap: 15 };

interface FormData {
  yearId: number;
  yearName: string;
}

interface AddOrUpdateFiscalYearProps {
  recordId: number | undefined;
  ClosePopup: () => void;
}

export default function AddOrUpdateStandard(props: Readonly<AddOrUpdateFiscalYearProps>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [yearOptions, setyearOptions] = useState<IDropdownOption[]>([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      yearId: 0,
      yearName: '',
    },
  });

  useEffect(() => {
    fetchyearOptions();
  }, []);

  const fetchyearOptions = async () => {
    try {
      const response = await apiClient.getAllPeriod();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((e: any) => ({ key: e.id, text: e.yearName }));
      setyearOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting months');
    }
  };

  const onSubmit = (data: any) => {
    const body = new MetricStandard();
    body.yearId = data.yearId;

    apiClient.addOrUpdateStandard(body).then((res) => {
      if (!props.recordId) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
      }
      props.ClosePopup();
    });
  };

  const handleDropdownChange = (_: any, option: any) => {
    // Update the form state
    const yearId = option?.key;
    setIsSubmitDisabled(!yearId); // Enable button only if a valid year is selected
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="yearId"
            control={control}
            rules={{ required: 'Year is required' }}
            render={({ field }) => (
              <Dropdown
                label="Year"
                options={yearOptions}
                selectedKey={field.value}
                onChange={(e, option) => {
                  field.onChange(option?.key); // Update form state
                  handleDropdownChange(e, option); // Handle dropdown change for button enable/disable
                }}
                errorMessage={errors.yearId?.message}
              />
            )}
          />
        </Stack>

        <div className="p-1 d-flex align-items-center justify-content-center">
          <PrimaryButton
            className="submitglobal"
            type="submit"
            text="Submit"
            disabled={isSubmitDisabled}
          />
        </div>
      </form>
    </div>
  );
}
