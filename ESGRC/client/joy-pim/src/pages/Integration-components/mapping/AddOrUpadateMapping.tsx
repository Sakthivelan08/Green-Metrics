import { AddButton2, AddFam, PIMcontentStyles } from '@/pages/PimStyles';
import { ApiMapping } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { DefaultButton, Dropdown, Modal } from '@fluentui/react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { notify } from 'react-notify-toast';

interface Props {
    isOpen: boolean;
    togglePopup: () => void;
    refreshData: () => void;
}

function AddOrUpadateMapping({ isOpen, togglePopup, refreshData }: Props) {

    const apiClient = new ApiManager().CreateApiClient();
    const notify = new NotificationManager();
    const [destinationOptions, setDestinationOptions] = useState<any[]>([]);
    const [sourceOptions, setSourceOptions] = useState<any[]>([]);
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

    const getMaster = (list: number[] = [1, 2]) => {
        const fetchFunctions = list.map(async (e) => {
            switch (e) {
                case 1:
                    return { e, res: await apiClient.listAllAttributes(true) };
                    break;
                case 2:
                    return { e, res: await apiClient.getSourceColumns(2) };
                    break;
                default:
                    break;
            }
        });
        Promise.all(fetchFunctions).then(respones => {
            respones.forEach((result) => {
                if (result && !result.res.hasError) {
                    const { e, res } = result;
                    if (res.result) {
                        switch (e) {
                            case 1:
                                setDestinationOptions(res.result.map(e => ({ ...e, key: e.name, text: e.name })));
                                break;
                            case 2:
                                setSourceOptions(res.result.map(e => ({ key: e, text: e })));
                            default:
                                break;
                        }
                    }
                }
            })
        })
    }

    const onSubmit = (data: any) => {
        const body = new ApiMapping(data);
        body.integrationId = 2;
        apiClient.addOrUpdateApiMapping(body).then(res => {
            if (!res.hasError) {
                notify.showSuccessNotify1('ADDED');
                refreshData();
                togglePopup();
            }
        });
    }

    return (
        <Modal
            isOpen={isOpen}
            containerClassName={PIMcontentStyles.container}
            onDismiss={() => togglePopup()}
        >

            <div className={PIMcontentStyles.header}>
                <span className="modelHeaderText1">{`${t('ADD_MAPPING')}`}</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className={PIMcontentStyles.body}>
                        <Controller
                            name="apiId"
                            control={control}
                            rules={{ required: 'Base Url is required' }}
                            render={({ field }) => (
                                <Dropdown
                                    {...field}
                                    placeholder={`${t('LABEL_SOURCE')}`}
                                    options={sourceOptions}
                                    selectedKey={field.value}
                                    label={`${t('LABEL_SOURCE')}`}
                                    onChange={(e: any, option: any) => field.onChange(option?.key)}
                                    errorMessage={errors?.apiId && errors?.apiId?.message?.toString()}
                                />
                            )}
                        />
                        <Controller
                            name="apiId"
                            control={control}
                            rules={{ required: 'Base Url is required' }}
                            render={({ field }) => (
                                <Dropdown
                                    {...field}
                                    placeholder={`${t('SELECT_STAGE_CATEGORY')}`}
                                    options={destinationOptions}
                                    selectedKey={field.value}
                                    label={`${t('LABEL_DESTINATION')}`}
                                    onChange={(e: any, option: any) => field.onChange(option?.key)}
                                    errorMessage={errors?.apiId && errors?.apiId?.message?.toString()}
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

export default AddOrUpadateMapping;