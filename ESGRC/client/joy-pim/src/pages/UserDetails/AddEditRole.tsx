import { HyperlinkEdit, Role } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { PrimaryButton, Stack, TextField } from '@fluentui/react';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

const stackTokens = { childrenGap: 15 };

export default function AddEditRole(props: Readonly<{
  SelectedUser: any;
  recordId: number;
  ClosePopup: () => void;
 }>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();

  const {
    control,
    handleSubmit,
    reset,
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

  const onSubmit = (data: any) => {
    const body = new Role({ ...data, id: props?.recordId ?? undefined });
    apiClient.addRole(body).then((res) => {
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
                label={`${t('TABLE_DESCRIPTION_NAME')}`}
                {...field}
                errorMessage={typeof errors.name?.message === 'string' ? errors.name.message : ''}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('COL_DESCRIPTION')}`}
                {...field}
                errorMessage={typeof errors.description?.message === 'string'? errors.description.message:''}
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
