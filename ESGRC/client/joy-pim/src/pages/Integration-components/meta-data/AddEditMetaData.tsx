import { cancelIcon, CancelStyles, MarketplaceStyles } from '@/common/properties';
import { AddButton2, AddFam, CancelBtn, PIMcontentStyles } from '@/pages/PimStyles';
import { ApiMetadataDto } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { DefaultButton, IconButton, Modal, Text, TextField } from '@fluentui/react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
interface Props {
  isOpen: boolean;
  togglePopup: () => void;
  refreshData: () => void;
}

type FormValues = {
  baseUrl: string;
  secretName: string;
  fields: {
    key: string;
    value: string;
  }[];
};

function AddEditMetaData(props: Props) {
  const apiClient = new ApiManager().CreateApiClient();
  const notificationManager = new NotificationManager();
  const { isOpen, togglePopup, refreshData } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid = false },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      fields: [{ key: '', value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  useEffect(() => {
    reset();
  }, []);

  const onSubmit = (data: FormValues) => {
    console.log(data);
    const body = new ApiMetadataDto();
    body.baseUrl = data.baseUrl;
    body.name = data.secretName;
    body.secretKeyName = data.secretName;
    body.secretValue = mapSecretValue(data.fields);
    apiClient.addOrUpdateApiMetadata(body).then((res) => {
      if (!res.hasError) {
        notificationManager.showSuccessNotify1(`${t('MSG_ADD')}`);
        reset();
        togglePopup();
        refreshData();
      }
    });
  };

  const mapSecretValue = (field: { key: string; value: string }[]) => {
    const secretValue = field.map((item: { key: string; value: string }) => ({
      [item?.key]: item?.value,
    }));
    let value = {};
    secretValue.forEach((item) => {
      value = { ...value, ...item };
    });
    console.log(value, 'secret value');
    return value;
  };

  return (
    <Modal
      isOpen={isOpen}
      containerClassName={PIMcontentStyles.container}
      onDismiss={() => togglePopup()}
    >
      <div className="d-flex align-item-center justify-content-between overflow-x-hidden">
        <Text variant="xLarge" className="modelHeaderText1">{`${t('ADD_META_DATA')}`}</Text>
        <IconButton
          styles={CancelStyles}
          iconProps={cancelIcon}
          ariaLabel="Close popup modal"
          onClick={() => togglePopup()}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className={PIMcontentStyles.body}>
            <Grid container spacing={2} direction="row">
              <Grid item lg={12} xs={12}>
                <Controller
                  name="baseUrl"
                  control={control}
                  rules={{ required: 'Base Url is required' }}
                  render={({ field }) => (
                    <TextField
                      label={`${t('BASE_URL')}`}
                      {...field}
                      errorMessage={errors.baseUrl && errors.baseUrl.message?.toString()}
                    />
                  )}
                />
              </Grid>

              <Grid container item lg={12} xs={12} spacing={2}>
                <Grid item lg={8} xs={12}>
                  <Controller
                    name="secretName"
                    control={control}
                    rules={{ required: 'Secret name is required' }}
                    render={({ field }) => (
                      <TextField
                        className="w-100"
                        {...field}
                        label={`${t('SECRET_NAME')}`}
                        errorMessage={errors.secretName && errors.secretName.message?.toString()}
                      />
                    )}
                  />
                </Grid>
                <Grid item lg={4} xs={12} className="d-flex align-items-center">
                  <DefaultButton
                    className="button w-auto btnalign"
                    styles={AddFam}
                    type="button"
                    onClick={() => append({ key: '', value: '' })}
                    text={`${t('ADD')}`}
                  />
                </Grid>
              </Grid>

              {fields.map((item, index) => (
                <Grid container item lg={12} xs={12} spacing={2} key={item?.id}>
                  <Grid item lg={5} xs={12}>
                    <Controller
                      name={`fields.${index}.key`}
                      control={control}
                      rules={{ required: 'Key is required' }}
                      render={({ field }) => (
                        <TextField
                          label={`${t('KEY')}`}
                          {...field}
                          errorMessage={
                            errors?.fields && errors?.fields[index]?.key?.message?.toString()
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={5} xs={12}>
                    <Controller
                      name={`fields.${index}.value`}
                      control={control}
                      rules={{ required: 'Value is required' }}
                      render={({ field }) => (
                        <TextField
                          label={`${t('VALUE')}`}
                          {...field}
                          errorMessage={
                            errors?.fields && errors?.fields[index]?.value?.message?.toString()
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} xs={12} className="d-flex align-items-center">
                    <IconButton
                      className="btnalign"
                      iconProps={{ iconName: 'Delete' }}
                      title="Remove"
                      ariaLabel="Remove"
                      onClick={() => remove(index)}
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
            {/* <Controller
                            name="secretType"
                            control={control}
                            rules={{ required: 'Secret type is required' }}
                            render={({ field }) => (
                                <TextField
                                    label={`${t('SECRET_KEY_TYPE')}`}
                                    {...field}
                                    errorMessage={errors.secretType && errors.secretType.message?.toString()}
                                />
                            )}
                        />

                        <Controller
                            name="clientSecretStr"
                            control={control}
                            rules={{ required: 'Client Secret String type is required' }}
                            render={({ field }) => (
                                <TextField
                                    label={`${t('CLIENT_SECRET_STRING')}`}
                                    {...field}
                                    errorMessage={errors.clientSecretStr && errors.clientSecretStr.message?.toString()}
                                />
                            )}
                        /> */}
          </div>

          <hr />

          <div className={PIMcontentStyles.footer}>
            <Grid container spacing={2} direction="row">
              <Grid item lg={5} xs={12} />
              <Grid item lg={1.5} xs={12}>
                <DefaultButton
                  className="button"
                  text={`${t('BTN_CANCEL')}`}
                  styles={AddButton2}
                  onClick={() => togglePopup()}
                />
              </Grid>
              <Grid item lg={2} xs={12} />
              <Grid item lg={1.5} xs={12}>
                <DefaultButton
                  className="button"
                  styles={AddFam}
                  type="submit"
                  disabled={!isValid}
                  text={`${t('BTN_SUBMIT')}`}
                />
              </Grid>
              <Grid item lg={2} xs={12} />
            </Grid>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddEditMetaData;
