import { cancelIcon, CancelStyles, MarketplaceStyles } from '@/common/properties';
import { AddFam, CancelBtn, PIMcontentStyles } from '@/pages/PimStyles';
import { ApiIntegration, ApiMetadataDto, ApiMetadataDtoListApiResponse, ApiUserMapping, AppUser, AppUserListApiResponse, ClientSecret } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { DefaultButton, Dropdown, IconButton, Modal, Text, TextField } from '@fluentui/react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
interface Props {
    isOpen: boolean;
    togglePopup: () => void;
    refreshData: () => void;
}
function AssignIntegration(props: Props) {
    const apiClient = new ApiManager().CreateApiClient();
    const notificationManager = new NotificationManager();
    const { isOpen, togglePopup, refreshData } = props;
    const [apiResponseOptions, setApiResponseOptions] = useState<any[]>([]);
    const [userList, setuserList] = useState<any[]>([]);
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
        const list = [1, 2];
        const response = Promise.all(list.map(async e => {
            let res;
            if (e === 1) {
                res = await apiClient.getApiMetadata();
            }
            if (e === 2) {
                res = await apiClient.activeUsers();
            }
            return { e, res };
        }));
        response.then(res => responseMapping(res));
    }

    const responseMapping = (ApiResponse: { e: number; res: ApiMetadataDtoListApiResponse | AppUserListApiResponse | undefined; }[]) => {
        ApiResponse.forEach(element => {
            if (element.e === 1 && !element.res?.hasError && element.res?.result) {
                setApiResponseOptions(element.res.result.map((e: ApiMetadataDto) => ({ ...e, key: e.id, text: e.baseUrl })));
            }
            if (element.e === 2 && !element.res?.hasError && element.res?.result) {
                setuserList(element.res.result.map((e: any) => ({ ...e, key: e.id, text: e.name })));
            }
        });
    }


    const onSubmit = (data: any) => {
        console.log(data);
        const body = new ApiUserMapping(data);
        apiClient.assignApiToUser(body).then(res => {
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

            <div className='d-flex align-item-center justify-content-between overflow-x-hidden'>
                <Text variant="xLarge" className="apptext1">{`${t('ASSIGN_USER')}`}</Text>
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

                        <Controller
                            name="metadataId"
                            control={control}
                            rules={{ required: 'Base Url is required' }}
                            render={({ field }) => (
                                <Dropdown
                                    {...field}
                                    placeholder={`${t('SELECT_BASE_URL')}`}
                                    options={apiResponseOptions}
                                    selectedKey={field.value}
                                    label={`${t('BASE_URL')}`}
                                    onChange={(e: any, option: any) => field.onChange(option?.key)}
                                    errorMessage={errors?.apiId && errors?.apiId?.message?.toString()}
                                />
                            )}
                        />

                        <Controller
                            name="userId"
                            control={control}
                            rules={{ required: 'User is required' }}
                            render={({ field }) => (
                                <Dropdown
                                    {...field}
                                    placeholder={`${t('SELECT_USER')}`}
                                    options={userList}
                                    selectedKey={field.value}
                                    label={`${t('LABEL_USER')}`}
                                    onChange={(e: any, option: any) => field.onChange(option?.key)}
                                    errorMessage={errors?.apiId && errors?.apiId?.message?.toString()}
                                />
                            )}
                        />

                    </div>
                    <div className={PIMcontentStyles.footer}>
                        <Grid lg={12} item container spacing={2} direction={'row'}>
                            <Grid item lg={1.5} xs={12} />
                            <Grid item lg={4} xs={12}>
                                <DefaultButton
                                    className="button"
                                    styles={AddFam}
                                    type="submit"
                                    text={`${t('BTN_SUBMIT')}`}
                                />
                            </Grid>
                            <Grid item lg={0.5} xs={12} />
                            <Grid item lg={4} xs={12}>
                                <DefaultButton
                                    className="button"
                                    text={`${t('BTN_CANCEL')}`}
                                    styles={CancelBtn}
                                    onClick={() => togglePopup()}
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

export default AssignIntegration;