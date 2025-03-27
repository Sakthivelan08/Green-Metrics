import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import Util from '@/services/Util';
import { PrimaryButton } from '@fluentui/react';
import { t } from 'i18next';
import { Dropdown, Stack, TextField } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

const stackTokens = { childrenGap: 15 };

export default function EditMetricGroup() {
  const util = new Util();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();

  const [industary, setindustry] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<any>({
    mode: 'onChange',
    defaultValues: {},
  });

  useEffect(() => {
    getIndustary();
  }, []);

  useEffect(() => {
    if (id) {
      apiClient.getMetricGroupWithId(parseInt(id.toString(), 10)).then((res) => {
        if (res && res.result) {
          reset({
            ...res.result[0],
            complianceId: undefined,
            industary: res.result[0]?.industry,
          });
        }
      });
    }
  }, [id, reset]);

  const onSubmit = (data: any) => {
    data.complianceId = undefined;
    data.esgrcType = data.industary;
    apiClient.createMetricGroup(data).then((res) => {
      if (!res.hasError) {
        notify.showSuccessNotify(`${t('METRIC_GROUP_UPDATED_SUCCESSFULLY')}`);
      }
    });
  };

  const getIndustary = async (): Promise<void> => {
    const industryOptions = await apiClient.getIndustry();
    setindustry(industryOptions?.result?.map((e) => ({ ...e, key: e.id, text: e.name })) ?? []);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-20">
        <Stack tokens={stackTokens}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('name')}`}
                {...field}
                errorMessage={errors.name && errors.name.message?.toString()}
                iconProps={{ iconName: 'Lock' }}
                disabled={true}
              />
            )}
          />

          <Controller
            name="label"
            control={control}
            rules={{ required: 'label is required' }}
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
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <Dropdown
                label={`${t('MENU_INDUSTURY')}`}
                {...fieldProps}
                options={industary}
                selectedKey={value || undefined}
                onChange={(e, item: any) => {
                  onChange(item?.key);
                }}
                errorMessage={errors.industary && errors.industary.message?.toString()}
              />
            )}
          />
          <div className="p-1 d-flex align-item-center justify-content-center">
            <PrimaryButton
              className="submitglobal"
              type="submit"
              text={`${t('BTN_SUBMIT')}`}
              disabled={!isValid}
            />
          </div>
        </Stack>
      </div>
    </form>
  );
}
