// import { DefaultButton, Modal, TextField, Label, Checkbox, Text } from '@fluentui/react';
// import React, { useEffect, useState } from 'react'
// import { AddButton2, AddFam, PIMcontentStyles } from '../PimStyles';
// import { t } from 'i18next';
// import { Controller, useForm } from 'react-hook-form';
// import { Grid } from '@mui/material';
// import ApiManager from '@/services/ApiManager';
// import NotificationManager from '@/services/NotificationManager';
// import { SlaConfig } from '@/services/ApiClient';
// import { numberValidation } from '@/services/CommonServices';
// import Select from 'react-select';

// interface Props {
//     visible: boolean;
//     fields: any;
//     refresh: () => void;
//     togglePopUp: () => void;
//     clearMemory: () => void;
// }

// function AddOrUpdateSla(Props: Props) {
//     const apiClient = new ApiManager().CreateApiClient();
//     const notify = new NotificationManager();
//     const { visible, fields, refresh, togglePopUp, clearMemory } = Props;
//     const [stageAction, setStageAction] = useState<any[]>([]);
//     const [tableOptions, setTableOptions] = useState<any[]>([]);
//     const [triggerOptions, setTriggerOptions] = useState<any[]>([
//         { value: 'Create', label: 'Create' },
//         { value: 'Get', label: 'Get' },
//         { value: 'Update', label: 'Update' },
//         { value: 'delete', label: 'delete' },
//     ]);

//     const {
//         control,
//         handleSubmit,
//         formState: { errors, isValid = false },
//         setValue, watch, reset
//     } = useForm<any>({
//         mode: 'onChange',
//         defaultValues: {},
//     });

//     const realTimeValue = watch('realTime', false);

//     useEffect(() => {
//         if (fields) {
//             reset(fields[0]);
//         }
//     }, [reset, fields])

//     useEffect(() => {
//         getMasters();
//     }, []);

//     useEffect(() => {
//         if (realTimeValue) {
//             setValue('escalation', null);
//             setValue('escalationTime', null);
//         }
//     }, [realTimeValue, setValue]);

//     const getMasters = (list: number[] = [1, 2, 3]) => {
//         const fetchFunctions = list.map(async (e) => {
//             switch (e) {
//                 case 1:
//                     return { e, res: await apiClient.retriveAllTableName() };
//                 case 2:
//                     return { e, res: await apiClient.getStageActions() };
//             }
//         });
//         Promise.all(fetchFunctions).then((results) => {
//             results.forEach((result) => {
//                 if (result && !result.res.hasError) {
//                     const { e, res } = result;
//                     if (res.result) {
//                         switch (e) {
//                             case 1:
//                                 setTableOptions(res.result.map(e => ({ value: e, label: e })));
//                                 break;
//                             case 2:
//                                 setStageAction(res.result.map(e => ({ ...e, value: e.id, label: e.name })));
//                                 break;
//                             default:
//                                 break;
//                         }
//                     }
//                 }
//             });
//         });
//     };

//     const onSubmit = (data: any) => {
//         const body = new SlaConfig(data);
//         if (fields[0]?.id) {
//             body.id = fields[0].id;
//         } else {
//             body.id = 0;

//         }
//         body.isActive = true;
//         apiClient.addOrUpdateSla(body).then((response: any) => {
//             const message = response.hasError
//                 ? response.message
//                 : body.id === 0 || body.id === undefined
//                     ? `${t('MSG_ADD')}`
//                     : `${t('MSG_UPDATE')}`;

//             if (response.hasError) {
//                 notify.showErrorNotify(message);
//             } else {
//                 notify.showSuccessNotify(message);
//                 clearMemory();
//                 refresh();
//                 togglePopUp();
//             }
//         });
//     }

//     return (
//         <Modal
//             isOpen={visible}
//             containerClassName={PIMcontentStyles.container}
//             onDismiss={() => togglePopUp()}
//         >
//             <div className={PIMcontentStyles.header}>
//                 {fields ? (
//                     <span className="modelHeaderText1">{`${t('CREATE_SLA')}`}</span>
//                 ) : (
//                     <span className="modelHeaderText1">{`${t('EDIT_SLA')}`}</span>
//                 )}
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} >
//                 <Controller
//                     name='tableName'
//                     control={control}
//                     rules={{ required: 'Table is required' }}
//                     render={({ field }) => (
//                         <>
//                             <Label className='header color-blue text'>{t('LABEL_TABLE')}</Label>
//                             {/* <Dropdown
//                                 {...field}
//                                 options={tableOptions}
//                                 selectedKey={field.value}
//                                 onChange={(e: any, option: any) => {
//                                     field.onChange(option?.key);
//                                 }}
//                                 errorMessage={errors.table && errors.table.message?.toString()}  // Correct error field name
//                             /> */}
//                             <Select
//                                 required
//                                 placeholder={t('TYPE_TO_SEARCH')}
//                                 options={tableOptions}
//                                 onChange={(newValue: any) => field.onChange(newValue.value)}
//                                 value={tableOptions.find(e => e.value === field.value)}
//                             />
//                             {typeof errors.tableName?.message === 'string' && (
//                                 <Text
//                                     variant="small"
//                                     styles={{ root: { color: 'red', marginTop: '4px' } }}
//                                 >
//                                     {errors.tableName.message}
//                                 </Text>
//                             )
//                             }
//                         </>
//                     )}
//                 />
//                 <Controller
//                     name='triggerType'
//                     control={control}
//                     rules={{ required: 'Trigger is required' }}
//                     render={({ field }) => (
//                         <>
//                             <Label className='header color-blue text'>{t('LABEL_TRIGGER')}</Label>
//                             {/* <Dropdown
//                                 {...field}
//                                 options={triggerOptions}
//                                 selectedKey={field.value}
//                                 onChange={(e: any, option: any) => {
//                                     field.onChange(option?.text);
//                                 }}
//                                 errorMessage={errors.name && errors.name.message?.toString()}
//                             /> */}
//                             <Select
//                                 required
//                                 placeholder={t('TYPE_TO_SEARCH')}
//                                 options={triggerOptions}
//                                 onChange={(newValue: any) => field.onChange(newValue.value)}
//                                 value={triggerOptions.find(e => e.value === field.value)}
//                             />
//                             {typeof errors.triggerType?.message === 'string' && (
//                                 <Text
//                                     variant="small"
//                                     styles={{ root: { color: 'red', marginTop: '4px' } }}
//                                 >
//                                     {errors.triggerType.message}
//                                 </Text>
//                             )
//                             }
//                         </>
//                     )}
//                 />
//                 <Controller
//                     name='realTime'
//                     control={control}
//                     render={({ field }) => (
//                         <Checkbox
//                             {...field}
//                             defaultChecked={field.value}
//                             label={`${t('LABEL_REAL_TIME')}`}
//                             className='header color-blue text'
//                         />
//                     )}
//                 />
//                 <Controller
//                     name='action'
//                     control={control}
//                     rules={{ required: 'Action is required' }}
//                     render={({ field }) => (
//                         <>
//                             <Label className='header color-blue text'>{t('LABEL_ACTION')}</Label>
//                             {/* <Dropdown
//                                 {...field}
//                                 options={stageAction}
//                                 selectedKey={field.value}
//                                 onChange={(e: any, option: any) => {
//                                     field.onChange(option?.key);
//                                 }}
//                                 errorMessage={errors.name && errors.name.message?.toString()}
//                             /> */}
//                             <Select
//                                 required
//                                 placeholder={t('TYPE_TO_SEARCH')}
//                                 options={stageAction}
//                                 onChange={(newValue: any) => field.onChange(newValue.value)}
//                                 value={stageAction.find(e => e.value === field.value)}
//                             />
//                             {typeof errors.action?.message === 'string' && (
//                                 <Text
//                                     variant="small"
//                                     styles={{ root: { color: 'red', marginTop: '4px' } }}
//                                 >
//                                     {errors.action.message}
//                                 </Text>
//                             )
//                             }
//                         </>
//                     )}
//                 />
//                 <Controller
//                     name='actionTime'
//                     control={control}
//                     rules={{
//                         required: 'Sla period is required',
//                         pattern: {
//                             value: /^ [0 - 9] + $ /,
//                             message: 'Only numbers are allowed',
//                         }
//                     }}
//                     render={({ field }) => (
//                         <>
//                             <Label className='header color-blue text'>{t('LABEL_ACTIONTIME')}</Label>
//                             <TextField
//                                 {...field}
//                                 onKeyDown={numberValidation}
//                                 onChange={(_event, value) => value ? field.onChange(parseInt(value, 10)) : field.onChange('')}
//                                 errorMessage={errors.slaPeriod && errors.slaPeriod.message?.toString()}
//                             />
//                         </>
//                     )}
//                 />
//                 {!realTimeValue && (<>
//                     <Controller
//                         name='escalation'
//                         control={control}
//                         rules={{ required: 'Esclation is required' }}
//                         render={({ field }) => (
//                             <>
//                                 <Label className='header color-blue text'>{t('LABEL_ESCLATION')}</Label>
//                                 {/* <Dropdown
//                                     {...field}
//                                     options={stageAction}
//                                     selectedKey={field.value}
//                                     onChange={(e: any, option: any) => {
//                                         field.onChange(option?.key);
//                                     }}
//                                     errorMessage={errors.name && errors.name.message?.toString()}
//                                 /> */}
//                                 <Select
//                                     required
//                                     placeholder={t('TYPE_TO_SEARCH')}
//                                     options={stageAction}
//                                     onChange={(newValue: any) => field.onChange(newValue.value)}
//                                     value={stageAction.find(e => e.value === field.value)}
//                                 />
//                                 {typeof errors.escalation?.message === 'string' && (
//                                     <Text
//                                         variant="small"
//                                         styles={{ root: { color: 'red', marginTop: '4px' } }}
//                                     >
//                                         {errors.escalation.message}
//                                     </Text>
//                                 )
//                                 }
//                             </>
//                         )}
//                     />
//                     <Controller
//                         name='escalationTime'
//                         control={control}
//                         rules={{
//                             required: 'Sla period is required',
//                             pattern: {
//                                 value: /^ [0 - 9] + $ /,
//                                 message: 'Only numbers are allowed',
//                             }
//                         }}
//                         render={({ field }) => (
//                             <>
//                                 <Label className='header color-blue text'>{t('LABEL_ESCLATIONTIME')}</Label>
//                                 <TextField
//                                     {...field}
//                                     onKeyDown={numberValidation}
//                                     onChange={(_event, value) => value ? field.onChange(parseInt(value, 10)) : field.onChange('')}
//                                     errorMessage={errors.slaPeriod && errors.slaPeriod.message?.toString()}
//                                 />
//                             </>
//                         )}
//                     />
//                 </>)
//                 }
//                 <hr />
//                 <div className={PIMcontentStyles.footer}>
//                     <Grid lg={12} item container spacing={2} direction={'row'}>
//                         <Grid item lg={1.5} xs={12} />
//                         <Grid item lg={4} xs={12}>
//                             <DefaultButton
//                                 className="button"
//                                 type="button"
//                                 text={`${t('BTN_CANCEL')}`}
//                                 styles={AddButton2}
//                                 onClick={() => togglePopUp()}
//                             />
//                         </Grid>
//                         <Grid item lg={0.5} xs={12} />
//                         <Grid item lg={4} xs={12}>
//                             <DefaultButton
//                                 className="button"
//                                 type="submit"
//                                 styles={AddFam}
//                                 text={`${t('BTN_SAVE')}`}
//                                 disabled={!isValid}
//                             />
//                         </Grid>
//                         <Grid item lg={2} xs={12} />
//                     </Grid>
//                 </div>
//             </form>

//         </Modal>
//     )
// }

// export default AddOrUpdateSla;