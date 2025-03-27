import React, { useState, useEffect } from 'react';
import { Stack, TextField, PrimaryButton, DatePicker } from '@fluentui/react';
import { Controller, useForm } from 'react-hook-form';
import { withTranslation } from 'react-i18next';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { Grid, Typography } from '@material-ui/core';
import { TaskAction } from '@/services/ApiClient';
import { useLocation } from 'react-router-dom';

interface TaskActionFormData {
  description: string;
  plannedStartDate: Date | undefined;
  plannedEndDate: Date | undefined;
  actualStartDate: Date | undefined;
  actualEndDate: Date | undefined;
  status: number;
  metricId: number | undefined;
}

interface AddOrUpdateTaskActionProps {
  template?: Partial<TaskActionFormData>;
  onSubmitComplete: () => void;
  t: (key: string) => string;
  rowData: any;
  recordId1: number;
  ClosePopup: () => void;
}

const defaultTaskActionFormData: TaskActionFormData = {
  description: '',
  plannedStartDate: undefined,
  plannedEndDate: undefined,
  actualStartDate: undefined,
  actualEndDate: undefined,
  status: 0,
  metricId: 0,
};

const AddOrUpdateActions: React.FC<AddOrUpdateTaskActionProps> = ({
  onSubmitComplete,
  t,
  rowData,
  recordId1,
  ClosePopup,
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [formData] = useState<TaskActionFormData>(defaultTaskActionFormData);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<TaskActionFormData>({
    mode: 'onChange',
    defaultValues: formData,
  });

  useEffect(() => {
    fetchTypeOptions1();
  }, []);

  const fetchTypeOptions1 = async () => {
    try {
      const response = await apiClient.getTaskActions();
      if (!response?.result) throw new Error('No result from API');

      const parseDate = (date: any) => (date ? new Date(date) : undefined);

      setValue('description', rowData[0]?.description);
      setValue('plannedStartDate', parseDate(rowData[0]?.plannedStartDate));
      setValue('plannedEndDate', parseDate(rowData[0]?.plannedEndDate));
      setValue('actualStartDate', parseDate(rowData[0]?.actualStartDate));
      setValue('actualEndDate', parseDate(rowData[0]?.actualEndDate));
    } catch (error) {
      notify.showErrorNotify('Failed to fetch type options.');
    }
  };

  useEffect(() => {
    if (rowData) {
      reset({
        description: rowData.description,
        plannedStartDate: new Date(rowData.plannedStartDate),
        plannedEndDate: new Date(rowData.plannedEndDate),
        actualStartDate: new Date(rowData.actualStartDate),
        actualEndDate: new Date(rowData.actualEndDate),
      });
    }
  }, [rowData, reset]);

  const onSubmit = async (data: TaskActionFormData) => {
    try {
      const taskActionData: TaskAction = TaskAction.fromJS({
        ...data,
        metricId: id,
        plannedStartDate: data.plannedStartDate?.toISOString() || null,
        plannedEndDate: data.plannedEndDate?.toISOString() || null,
        actualStartDate: data.actualStartDate?.toISOString() || null,
        actualEndDate: data.actualEndDate?.toISOString() || null,
        ...(recordId1 ? { id: recordId1 } : {}),
      });

      if (recordId1) {
        await apiClient.createTaskAction(taskActionData);
        notify.showSuccessNotify(t('TASK_ACTION_UPDATED_SUCCESSFULLY'));
      } else {
        await apiClient.createTaskAction(taskActionData);
        notify.showSuccessNotify(t('TASK_ACTION_CREATED_SUCCESSFULLY'));
      }

      onSubmitComplete();
      ClosePopup();
    } catch (error) {
      notify.showErrorNotify(t('Error processing Task Action'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <Grid container spacing={1} direction="row" justifyContent="center" style={{ width: '100%' }}>
        <Stack
          tokens={{ childrenGap: 4.5 }}
          style={{
            paddingRight: 20,
            paddingBottom: 5,
            width: '90%',
            maxWidth: 500,
            margin: '0 auto',
            marginTop: '-5px',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            <Typography variant="h5">
              <b>{recordId1 ? t('EDIT_ACTION') : t('ADD_ACTION')}</b>
            </Typography>
          </div>

          <Controller
            name="description"
            control={control}
            rules={{ required: t('Description is required') }}
            render={({ field }) => (
              <TextField
                label={t('COL_DESCRIPTION')}
                {...field}
                value={field.value}
                errorMessage={errors.description && String(errors.description.message)}
                styles={{ root: { width: '100%' } }}
              />
            )}
          />
          <Controller
            name="plannedStartDate"
            control={control}
            rules={{ required: t('Planned Start Date is required') }}
            render={({ field }) => (
              <DatePicker
                label={t('COL_PLANNED_START_DATE')}
                onSelectDate={(date) => field.onChange(date)}
                value={field.value || undefined}
                isMonthPickerVisible={false}
                minDate={new Date()}
                styles={{ root: { width: '100%' } }}
              />
            )}
          />
          <Controller
            name="plannedEndDate"
            control={control}
            rules={{ required: t('Planned End Date is required') }}
            render={({ field }) => (
              <DatePicker
                label={t('COL_PLANNED_END_DATE')}
                onSelectDate={(date) => field.onChange(date)}
                value={field.value || undefined}
                isMonthPickerVisible={false}
                minDate={new Date()}
                styles={{ root: { width: '100%' } }}
              />
            )}
          />
          <Controller
            name="actualStartDate"
            control={control}
            rules={{ required: t('Actual Start Date is required') }}
            render={({ field }) => (
              <DatePicker
                label={t('COL_ACTUAL_START_DATE')}
                onSelectDate={(date) => field.onChange(date)}
                value={field.value || undefined}
                isMonthPickerVisible={false}
                minDate={new Date()}
                styles={{ root: { width: '100%' } }}
              />
            )}
          />
          <Controller
            name="actualEndDate"
            control={control}
            rules={{ required: t('Actual End Date is required') }}
            render={({ field }) => (
              <DatePicker
                label={t('COL_ACTUAL_END_DATE')}
                onSelectDate={(date) => field.onChange(date)}
                value={field.value || undefined}
                isMonthPickerVisible={false}
                minDate={new Date()}
                styles={{ root: { width: '100%' } }}
              />
            )}
          />
          {/* <Controller
            name="status"
            control={control}
            rules={{ required: t('Status is required') }}
            render={({ field }) => (
              <TextField
                label={t('COL_STATUS')}
                {...field}
                type="number"
                value={field.value?.toString() || ''}
                onChange={(e, newValue) => field.onChange(newValue ? parseInt(newValue) : '')}
                errorMessage={errors.status && String(errors.status.message)}
                styles={{ root: { width: '100%' } }}
              />
            )}
          /> */}
          <div style={{ textAlign: 'center' }}>
            <PrimaryButton type="submit" text="Submit" disabled={!isValid} />
          </div>
        </Stack>
      </Grid>
    </form>
  );
};

export default withTranslation()(AddOrUpdateActions);
