import { Template } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { IDropdownOption, PrimaryButton, Stack, TextField } from '@fluentui/react';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const stackTokens = { childrenGap: 15 };

interface FormData {
  name: string;
  group: number | undefined;
  description: string;
  roles: number[];
}

export default function AddEditTemplates(props: Readonly<{
  SelectedUser: any;
  recordId: number;
  ClosePopup: () => void;
}>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [, setRoleOptions] = useState<IDropdownOption[]>([]);
  const [, setGroupOptions] = useState<IDropdownOption[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      group: undefined,
      description: '',
      roles: [],
    },
  });

  useEffect(() => {
    getGroups();
    getRoles();
  }, []);

  useEffect(() => {
    if (props?.SelectedUser) {
      reset({
        name: props.SelectedUser.name || '',
        group: props.SelectedUser.metricGroupId || undefined,
        description: props.SelectedUser.description || '',
        roles: props.SelectedUser.roleIds || [],
      });
    }
  }, [props?.SelectedUser, reset]);

  const getGroups = async (): Promise<void> => {
    try {
      const options = await apiClient.getActiveMetricGroupsWithCount();
      const groups = options?.result ?? [];
      setGroupOptions(groups.map((e: any) => ({ key: e.groupId, text: e.name })));
    } catch (error) {
      notify.showErrorNotify(`${t('ERROR_FETCHING_GROUPS')}`);
    }
  };

  const getRoles = async (): Promise<void> => {
    try {
      const options = await apiClient.getRoles(true);
      const roles = options?.result ?? [];

      setRoleOptions(
        roles.map((e: any) => ({ key: e.id, text: e.name })) ?? []
      );
    } catch (error) {
      notify.showErrorNotify(`${t('ERROR_FETCHING_ROLES')}`);
    }
  };

  const onSubmit = async (data: FormData) => {
    const isEdit = !!props.recordId;
    const tempdata: any = new Template({
      name: data.name,
      metricGroupId: data.group,
      description: data.description,
      roleIds: undefined,
      id: props.recordId,
      isActive: isEdit ? true : props.SelectedUser?.isActive || false,
    });

    try {
      await apiClient.createTemplates(tempdata);
      notify.showSuccessNotify(`${t(isEdit ? 'EDITED_SUCCESSFULLY' : 'ADDED_SUCCESSFULLY')}`);
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify(`${t('ERROR_SAVING_TEMPLATE')}`);
    }
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('Name')}`}
                {...field}
                errorMessage={errors.name?.message?.toString()}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('Description')}`}
                multiline
                rows={3}
                {...field}
                errorMessage={
                   errors.description?.message?.toString()
                }
              />
            )}
          />
        </Stack>

        <div className="p-1 d-flex align-item-center justify-content-center">
          <PrimaryButton
          className="submitglobal"
            type="submit"
            text={`${t('BTN_SUBMIT')}`}
            disabled={!isValid}
          />
        </div>
      </form>
    </div>
  );
}
