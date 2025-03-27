import { Compliance } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { PrimaryButton, Stack, TextField } from '@fluentui/react';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

const stackTokens = { childrenGap: 15 };

interface FormData {
    name: string;
    description: string;
}

export default function AddorUpdateCompliance(props: Readonly<{
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
    } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
        },
    });

    useEffect(() => {
    }, []);

    useEffect(() => {
        if (props?.SelectedUser) {
            reset({
                name: props.SelectedUser.name || '',
                description: props.SelectedUser.description || '',
            });
        }
    }, [props?.SelectedUser, reset]);

    const onSubmit = async (data: FormData) => {
        const isEdit = !!props.recordId;
        const compdata: any = new Compliance({
            name: data.name,
            description: data.description,
            id: props.recordId,
            isActive: isEdit ? true : props.SelectedUser?.isActive || false,
        });

        try {
            await apiClient.createCompliance(compdata);
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
