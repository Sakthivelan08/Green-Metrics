import { GeoGraphyIEnumerableApiResponse, NewCities } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { Dropdown, PrimaryButton, Stack, TextField } from '@fluentui/react';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { geoGraphyEnum } from '../enumCommon';

const stackTokens = { childrenGap: 15 };

export default function AddEditCities(
  props: Readonly<{
    SelectedUser: any;
    recordId: number;
    ClosePopup: () => void;
  }>,
) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();

  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [_, setgeoGraphyListOptions] = useState<any[]>([]);

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

  const onSubmit = (data: any) => {
    let body = new NewCities();
    body.code = data.code;
    body.city = data.city;
    body.country = data.country;
    body.state = data.state;
    body.district = data.district;
    body.zone = data.zone;

    apiClient.createCities(body).then(() => {
      if (!props.recordId) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      } else {
        notify.showSuccessNotify(`${t('EDITED_SUCCESSFULLY')}`);
      }
      props.ClosePopup();
    });
  };

  useEffect(() => {
    getCitys();
  }, []);

  const getCitys = async (): Promise<void> => {
    const options = await apiClient.getCity();
    setCityOptions(options?.result?.map((e: any) => ({ ...e, key: e.id, text: e.name })) ?? []);
  };

  const onCitySelect = (item: any) => {
    const geo: any = apiClient.geoGraphyList(item.id).then((res) => {
      setgeoGraphyListOptions(geo);
      setValue('district', getValue(res, geoGraphyEnum.district));
      setValue('state', getValue(res, geoGraphyEnum.state));
      setValue('country', getValue(res, geoGraphyEnum.country));
      setValue('zone', getValue(res, geoGraphyEnum.zone));
    });
  };

  const getValue = (res: GeoGraphyIEnumerableApiResponse, key: string): string => {
    return res.result?.find((e) => e.type_Name === key)?.name ?? '';
  };

  return (
    <div className="w-100 h-100 overflow-hidden form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="code"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('Code')}`}
                {...field}
                errorMessage={errors.code && String(errors.code.message)}
              />
            )}
          />

          <Controller
            name="city"
            control={control}
            rules={{ required: 'City is required' }}
            render={({ field }) => (
              <Dropdown
                options={cityOptions}
                label={`${t('City')}`}
                selectedKey={cityOptions.find((option) => option.text === field.value)?.key}
                errorMessage={errors.city && String(errors.city.message)}
                onChange={(e, item: any) => {
                  if (item) {
                    field.onChange(item.text);
                    onCitySelect(item);
                  }
                }}
              />
            )}
          />
          <Controller
            name="district"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('District')}`}
                {...field}
                errorMessage={errors.district && String(errors.district.message)}
              />
            )}
          />
          <Controller
            name="zone"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('Zone')}`}
                {...field}
                errorMessage={errors.zone && String(errors.zone.message)}
              />
            )}
          />
          <Controller
            name="state"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('state')}`}
                {...field}
                errorMessage={errors.state && String(errors.state.message)}
              />
            )}
          />
          <Controller
            name="country"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label={`${t('Country')}`}
                {...field}
                errorMessage={errors.country && String(errors.country.message)}
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
