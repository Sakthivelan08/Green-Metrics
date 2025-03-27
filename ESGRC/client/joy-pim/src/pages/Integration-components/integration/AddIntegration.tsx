import { AddButton2, AddFam, PIMcontentStyles } from '@/pages/PimStyles';
import { ApiIntegration, ApiMetadataDtoListApiResponse } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { DefaultButton, Modal, TextField, Text, Label } from '@fluentui/react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';

interface Props {
    isOpen: boolean;
    togglePopup: () => void;
    refreshData: () => void;
}

function AddIntegration(props: Props) {
    const apiClient = new ApiManager().CreateApiClient();
    const notificationManager = new NotificationManager();
    const { isOpen, togglePopup, refreshData } = props;
    const [apiResponseOptions, setApiResponseOptions] = useState<any[]>([]);
    const {
        control,
        handleSubmit,
        formState: { errors, isValid = false },
    } = useForm<any>({
        mode: 'onChange',
        defaultValues: {},
    });

    useEffect(() => {
        getMaster();
    }, []);

    const getMaster = () => {
        const list = [1];
        const response = Promise.all(list.map(async e => {
            let res;
            if (e === 1) {
                res = await apiClient.getApiMetadata();
            }
            return { e, res };
        }));
        response.then(res => responseMapping(res));
    }

    const responseMapping = (ApiResponse: { e: number; res: ApiMetadataDtoListApiResponse | undefined; }[]) => {
        ApiResponse.forEach(element => {
            if (element.e === 1 && !element.res?.hasError && element.res?.result) {
                setApiResponseOptions(element.res.result.map(e => ({ ...e, value: e.id, label: e.baseUrl })))
            }
        });
    }


    const onSubmit = (data: any) => {
        console.log(data);
        const body = new ApiIntegration(data);
        apiClient.addOrUpdateApiIntegration(body).then(res => {
            if (!res.hasError) {
                notificationManager.showSuccessNotify1(`${t('MSG_ADD')}`);
                togglePopup(); refreshData();
            }
        })

    }

    return (
        <Modal
            isOpen={isOpen}
            containerClassName={PIMcontentStyles.container}
            onDismiss={() => togglePopup()}
        >

            <div className={PIMcontentStyles.header}>
                <span className="modelHeaderText1">{`${t('ADD_INTEGRATION')}`}</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className={PIMcontentStyles.body}>

                        <Controller
                            name="apiId"
                            control={control}
                            rules={{ required: 'Base Url is required' }}
                            render={({ field }) => (
                                <>
                                    <Label>{t('BASE_URL')}</Label>
                                    <Select
                                        required
                                        placeholder={t('TYPE_TO_SEARCH')}
                                        options={apiResponseOptions}
                                        onChange={(newValue: any) => field.onChange(newValue.value)}
                                        value={apiResponseOptions.find(e => e.value === field.value)}
                                    />
                                    {typeof errors.apiId?.message === 'string' && (
                                        <Text
                                            variant="small"
                                            styles={{ root: { color: 'red', marginTop: '4px' } }}
                                        >
                                            {errors.apiId.message}
                                        </Text>
                                    )
                                    }
                                </>
                            )}
                        />

                        <Controller
                            name="type"
                            control={control}
                            rules={{ required: 'Type is required' }}
                            render={({ field }) => (
                                <TextField
                                    label={`${t('LABEL_TYPE')}`}
                                    {...field}
                                    errorMessage={errors.type && errors.type.message?.toString()}
                                />
                            )}
                        />

                        <Controller
                            name="path"
                            control={control}
                            rules={{ required: 'path is required' }}
                            render={({ field }) => (
                                <TextField
                                    label={`${t('LABEL_PATH')}`}
                                    {...field}
                                    errorMessage={errors.path && errors.path.message?.toString()}
                                />
                            )}
                        />

                        <Controller
                            name="parameter"
                            control={control}
                            rules={{ required: 'parameter is required' }}
                            render={({ field }) => (
                                <TextField
                                    label={`${t('LABEL_PARAMETER')}`}
                                    {...field}
                                    errorMessage={errors.parameter && errors.parameter.message?.toString()}
                                />
                            )}
                        />
                    </div>
                    <hr />
                    <div className={PIMcontentStyles.footer}>
                        <Grid lg={12} item container spacing={2} direction={'row'}>
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
                                    disabled={!isValid}
                                    className="button"
                                    styles={AddFam}
                                    type="submit"
                                    text={`${t('BTN_SUBMIT')}`}
                                />
                            </Grid>
                            <Grid item lg={2} xs={12} />
                        </Grid>
                    </div>
                </div>
            </form>
        </Modal>
    )
}

export default AddIntegration;