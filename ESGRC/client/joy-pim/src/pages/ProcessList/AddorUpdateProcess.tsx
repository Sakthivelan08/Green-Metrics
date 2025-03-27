import { Process } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import AuthManagerService from '@/services/AuthManagerService';
import NotificationManager from '@/services/NotificationManager';
import { PrimaryButton, Stack, TextField, Dropdown } from '@fluentui/react';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const stackTokens = { childrenGap: 15 };

export default function AddorUpdateProcess(props: Readonly<{
  SelectedUser: any;
  recordId: number;
  ClosePopup: () => void;
}>) {
  const apiClient = new ApiManager().CreateApiClient();
  const authManager = new AuthManagerService();
  const isAuthenticated =authManager.isAuthenticated();
  const user =isAuthenticated ?authManager.getUserData() : null;
  const userId: any =user?.id || 0;
  const notify = new NotificationManager();

  const [metricgroupOptions, setMetricgroupOptions] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: props?.SelectedUser,
  });

  useEffect(() => {
    if (props?.SelectedUser) {
      reset(props?.SelectedUser);
    }
  }, [props?.SelectedUser, reset]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const options = await apiClient.getAllActiveCompliance();
        const roleOptions = options?.result?.map((e: any) => ({
          key: e.id,
          text: e.name,
        })) ?? [];
        setMetricgroupOptions(roleOptions);
      } catch (error: any) {
        notify.showErrorNotify(error.message);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = (data: any) => {
    const body = new Process();
    body.name = data.name;
    body.description = data.description;
    body.complianceId = data.metricgroup;
    body.createdBy = userId;
    apiClient.addorUpdateProcess(body).then((res) => {
      if (!props.recordId) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
      }
      props.ClosePopup();
    });
  };

  return (
    <div className="w-100 h-100 overflow-hidden form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('COL_NAME')}`}
                {...field}
                errorMessage={errors.name && String(errors.name.message)}
              />
            )}
          />

          <Controller
            name="metricgroup"
            control={control}
            rules={{ required: 'compliance is required' }}
            render={({ field }) => (
              <Dropdown
                options={metricgroupOptions}
                label={`${t('SUBMENU_COMPLIANCE')}`}
                selectedKey={field.value || undefined}
                onChange={(e, option) => {
                  setValue('metricgroup', option ? option.key : '', { shouldValidate: true });
                }}
                errorMessage={errors.metricgroup && String(errors.metricgroup.message)}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                label={`${t('Description')}`}
                {...field}
                errorMessage={errors.description && String(errors.description.message)}
              />
            )}
          />
        </Stack>
        <div className="p-1 d-flex align-item-center justify-content-center">
          <PrimaryButton className="submitglobal" type="submit" text={`${t('BTN_SUBMIT')}`} disabled={!isValid} />
        </div>
      </form>
    </div>
  );
}
