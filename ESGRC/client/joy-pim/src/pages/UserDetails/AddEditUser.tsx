import {
  AppUserRoleDomainModel,
  AppUserRoleModel,
  HyperlinkEdit,
  Role,
} from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { Dropdown, PrimaryButton, Stack, TextField } from '@fluentui/react';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const stackTokens = { childrenGap: 15 };

export default function AddEditUser(props: {
  SelectedUser: any;
  recordId: number;
  ClosePopup: () => void;
}) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [roles, setRoles] = useState<any[]>([]);
  const [emailRegex, setEmailRegex] = useState<string>('');

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
    getRoles();
    appconfig();
  }, []);

  useEffect(() => {
    if (props?.SelectedUser) {
      reset(props?.SelectedUser);
    }
  }, [props?.SelectedUser, reset]);

  const getRoles = async (): Promise<void> => {
    const roleOptions = await apiClient.getRoles(true);
    setRoles(roleOptions?.result?.map((e) => ({ ...e, key: e.id, text: e.name })) ?? []);
  };

  const onSubmit = (data: any) => {
    addorUpdateUser(data);
    if (props.recordId) {
      updateRole(data);
    }
  };

  const addorUpdateUser = (data: any) => {
    const body = new HyperlinkEdit({ ...data, id: props?.recordId ?? undefined });
    apiClient.addOrUpdateUser(body).then((res) => {
      if (!props.recordId) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
      }
      props.ClosePopup();
    });
  };

  const appconfig = async (): Promise<void> => {
    const appconfigOption = await apiClient.getAppConfig();
    setEmailRegex(appconfigOption?.result?.find((e) => e.name === 'Email Regex')?.value || '');
  };
  const updateRole = (data: any) => {
    const body = new AppUserRoleModel({ appUserid: props?.recordId });
    const roleSelected = data.role.map((e: any) => {
      // mapping a new array for selected role
      const selectedRole: Role = roles.find((r) => r.id === e);
      const role = new AppUserRoleDomainModel({ roleId: selectedRole.id, name: selectedRole.name });
      return role;
    });
    body.appUserRoleDomainModel = roleSelected;
    apiClient.addUserRole(body);
  };

  return (
    <div className="w-100 h-100 overflow-hidden form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="firstName"
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('USERS_FIRST_NAME')}`}
                {...field}
                errorMessage={errors.firstName && errors.firstName.message?.toString()}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('USERS_LAST_NAME')}`}
                {...field}
                errorMessage={errors.lastName && errors.lastName.message?.toString()}
              />
            )}
          />

          <Controller
            name="mobile"
            control={control}
            rules={{
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Enter a valid 10-digit mobile number',
              },
            }}
            render={({ field }) => (
              <TextField
                label={`${t('USER_MOBILE_NUMBER')}`}
                type="tel"
                {...field}
                errorMessage={errors.mobile && errors.mobile.message?.toString()}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: new RegExp(emailRegex.slice(1, -1)),
                message: 'Enter a valid email address',
              },
            }}
            render={({ field }) => (
              <TextField
                label={`${t('USERS_EMAIL')}`}
                type="email"
                {...field}
                errorMessage={errors.email && errors.email.message?.toString()}
              />
            )}
          />

          {/* {props.recordId && ( */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label={`${t('MENU_ROLES')}`}
                  {...field}
                  multiSelect
                  options={roles}
                  selectedKeys={field.value || []}
                  onChange={(e, item: any) => {
                    const selectedKeys = field.value || [];
                    if (item?.selected) {
                      field.onChange([...selectedKeys, item.key]);
                    } else {
                      field.onChange(selectedKeys.filter((e: any) => e !== item.key));
                    }
                  }}
                  errorMessage={errors.role && errors.role.message?.toString()}
                />
              )}
            />
          {/* )} */}
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
