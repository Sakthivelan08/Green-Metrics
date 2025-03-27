import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import AuthManagerService from '@/services/AuthManagerService';
import { GoalSetting } from '@/services/ApiClient';

const stackTokens = { childrenGap: 15 };

interface FormData {
    yearId: number; 
    yearName: string; 
    name: string; 
}

interface AddOrUpdateGoalsettingProps {
  SelectedPeriod: any;
  recordId: number | undefined;
  ClosePopup: () => void;
}

export default function AddOrUpdateGoalsetting(props: Readonly<AddOrUpdateGoalsettingProps>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [yearOptions, setyearOptions] = useState<IDropdownOption[]>([]);
  const authManager = new AuthManagerService();
  const isAuthenticated = authManager.isAuthenticated();
  const user = isAuthenticated ? authManager.getUserData() : null;
  const userId: any = user?.id || 0;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
        yearId: 0,
        name: '',
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
      setyearOptions(options)
    } catch (error) {
      notify.showErrorNotify('Error getting months');
    }
  };

const onSubmit = (data: any) => {
    const body = new GoalSetting();
    body.createdBy= userId;
    body.name = data.name;
    body.yearId = data.yearId;

    apiClient.createGoalSettings(body).then((res) => {
      if (!props.recordId) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
      }
      props.ClosePopup();
    });
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
        <Controller
            name="name"
            control={control}
            rules={{ required: 'Goal name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('GOAL_NAME')}`}
                {...field}
                value={field.value ? String(field.value) : ''}
                  errorMessage={errors?.name?.message}
              />
            )}
          />
          <Controller
            name="yearId"
            control={control}
            rules={{ required: 'Year is required' }}
            render={({ field }) => (
              <Dropdown
                label="Year"
                options={yearOptions?.length ? yearOptions : []}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.yearId?.message}
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
