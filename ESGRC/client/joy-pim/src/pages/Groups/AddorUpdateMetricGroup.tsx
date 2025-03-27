import { MetricGroup } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { PrimaryButton, Stack, TextField } from '@fluentui/react';
import { t } from 'i18next';
import { Checkbox, Dropdown } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const stackTokens = { childrenGap: 15 };

export default function AddorUpdateMetricGroup(props: {
  SelectedUser: any;
  recordId: number;
  ClosePopup: () => void;
}) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();

  const [industary, setIndustry] = useState<any[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);
  const [isDropdownEnabled, setIsDropdownEnabled] = useState(false);

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

  useEffect(() => {
    getIndustary();
    fetchDropdownData();
  }, []);

  const onSubmit = (data: any) => {
    const body = new MetricGroup();
    body.name = data.name;
    body.label = data.label;
    body.description = '';
    body.complianceId = undefined;
    body.industry = data.industary;
    body.isHierarchy = false;

    if (data.groupId) {
      body.parentId = data.groupId;
      body.isHierarchy = true;
    }

    apiClient.createMetricGroup(body).then(() => {
      if (!props.recordId) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
      }
      props.ClosePopup();
    });
  };

  const getIndustary = async (): Promise<void> => {
    const industryOptions = await apiClient.getIndustry();
    setIndustry(industryOptions?.result?.map((e) => ({ key: e.id, text: e.name })) ?? []);
  };

  const fetchDropdownData = async () => {
    try {
      const apiResponse = await apiClient.getActiveMetricGroupsWithCount();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.groupId,
          text: item.name,
        })) || [];
      setDropdownOptions(options);
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      notify.showErrorNotify(e.message);
    }
  };

  return (
    <div className="w-100 h-100 overflow-hidden form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="isHierarchy"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginLeft: '1vh', marginRight: '8px', fontWeight: 'bold' }}>{`${t(
                  'isHierarchy',
                )}`}</label>
                <Checkbox
                  {...field}
                  checked={field.value || false}
                  onChange={(e: any, checked: any) => {
                    field.onChange(checked);
                    setIsDropdownEnabled(checked);
                  }}
                />
              </div>
            )}
          />

          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('name')}`}
                {...field}
                errorMessage={errors.name && errors.name.message?.toString()}
              />
            )}
          />

          <Controller
            name="groupId"
            control={control}
            render={({ field }) => (
              <Dropdown
                label={`${t('METRIC_GROUP_PARENT')}`}
                {...field}
                options={dropdownOptions}
                selectedKey={field.value || undefined}
                onChange={(e, item: any) => {
                  field.onChange(item?.key);
                }}
                disabled={!isDropdownEnabled}
              />
            )}
          />

          <Controller
            name="label"
            control={control}
            rules={{ required: 'Label is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('label')}`}
                {...field}
                errorMessage={errors.label && errors.label.message?.toString()}
              />
            )}
          />

          <Controller
            name="industary"
            control={control}
            render={({ field }) => (
              <Dropdown
                label={`${t('MENU_INDUSTURY')}`}
                {...field}
                options={industary}
                selectedKey={field.value || undefined}
                onChange={(e, item: any) => {
                  field.onChange(item?.key);
                }}
                errorMessage={errors.industary && errors.industary.message?.toString()}
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
