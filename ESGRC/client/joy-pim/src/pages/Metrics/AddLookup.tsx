import { Modal, Text, IconButton, Dropdown, DefaultButton } from '@fluentui/react'
import React from 'react'
import { AddFam, CancelBtn, PIMcontentStyles } from '../PimStyles';
import { t } from 'i18next';
import { cancelIcon, CancelStyles } from '@/common/properties';
import { Grid } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

interface PropsState {
    isOpen: boolean;
    lookUpTableOptions: any[];
    lookUpColumnOptions: any[];
    toggleLookUp: () => void;
    onLookupSaveClick: (data: any) => void;
    getLookUpColumns: (tableName: string) => void;
}

function AddLookUp(props: PropsState) {
    const { isOpen, toggleLookUp, lookUpTableOptions, lookUpColumnOptions, onLookupSaveClick } = props;

    const {
        control,
        handleSubmit,
        formState: { errors, isValid = false },
    } = useForm<any>({
        mode: 'onChange',
        defaultValues: {},
    });

    const onSubmit = (data: any) => {
        onLookupSaveClick(data);
    }

    return (
        <Modal
            isOpen={isOpen}
            containerClassName={PIMcontentStyles.confirmContainer}
            onDismiss={() => toggleLookUp()}
        >
            <form onSubmit={handleSubmit(onSubmit)}>


                <div className='w-100 overflow-x-hidden'>
                    <div className='d-flex align-item-center justify-content-between'>
                        <Text variant="xLarge" className="apptext1">{`${t('ADD_LOOK_UP')}`}</Text>
                        <IconButton
                            type='button'
                            styles={CancelStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={() => toggleLookUp()}
                        />
                    </div>

                </div>
                <div className='p-1'>
                    <Controller
                        name="lookupTable"
                        control={control}
                        rules={{ required: 'Lookup Table is required' }}
                        render={({ field }) => (
                            <Dropdown
                                {...field}
                                placeholder={`${t('SELECT_LOOKUP_TABLE')}`}
                                options={lookUpTableOptions}
                                selectedKey={field.value}
                                label={`${t('LOOK_UP_TABLE')}`}
                                onChange={(e: any, option: any) => {
                                    field.onChange(option?.text);
                                    props.getLookUpColumns(option?.text)
                                }}
                                errorMessage={errors?.lookupTable && errors?.lookUpTable?.message?.toString()}
                            />)}
                    />
                    <Controller
                        name='lookupTableColumn'
                        control={control}
                        rules={{ required: 'Lookup Column is required' }}
                        render={({ field }) => (
                            <Dropdown
                                {...field}
                                placeholder={`${t('SELECT_LOOKUP_TABLE_COMUMN')}`}
                                options={lookUpColumnOptions}
                                selectedKey={field.value}
                                label={`${t('LOOK_UP_COLUMN')}`}
                                onChange={(e: any, option: any) => field.onChange(option?.text)}
                                errorMessage={errors?.lookupTableColumn && errors?.lookupTableColumn?.message?.toString()}
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
                                text={`${t('BTN_SAVE')}`}
                            />
                        </Grid>
                        <Grid item lg={0.5} xs={12} />
                        <Grid item lg={4} xs={12}>
                            <DefaultButton
                                className="button"
                                type='button'
                                text={`${t('BTN_CANCEL')}`}
                                styles={CancelBtn}
                                onClick={() => toggleLookUp()}
                            />
                        </Grid>
                        <Grid item lg={2} xs={12} />
                    </Grid>
                </div>
            </form>
        </Modal >
    )
}

export default AddLookUp