import React, { useEffect, useState } from 'react';
import {
  PrimaryButton,
  Stack,
  Dropdown,
  IDropdownOption,
  DatePicker,
  TextField,
} from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { Createaudit, IPeriod } from '@/services/ApiClient';
import { t } from 'i18next';

const stackTokens = { childrenGap: 15 };

interface FormData {
  startdate: Date | null;
  enddate: Date | null;
  auditingProcess: number;
  requestedby: number;
  name: string;
  periodId: number;
  assessmentGroup: string[];
}

interface AddorUpdateAuditProps {
  SelectedAudit: any;
  recordId: number | undefined;
  ClosePopup: () => void;
}

export default function AddorUpdateAudit(props: AddorUpdateAuditProps) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [auditingProcessOptions, setAuditingProcessOptions] = useState<IDropdownOption[]>([]);
  const [requestedByOptions1, setRequestedByOptions1] = useState<IDropdownOption[]>([]);
  const [periodOptions, setPeriodOptions] = useState<IDropdownOption[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      startdate: null,
      enddate: null,
      auditingProcess: 0,
      assessmentGroup: [],
    },
  });

  useEffect(() => {
    fetchAuditingProcesses();
    fetchRequestedByOptions1();
    fetchPeriodOptions();
  }, []);

  const fetchAuditingProcesses = async () => {
    try {
      const response = await apiClient.getProcessList();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((e: any) => ({ key: e.id, text: e.name }));
      setAuditingProcessOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting processes');
    }
  };

  const fetchRequestedByOptions1 = async () => {
    try {
      const response = await apiClient.activeUsers();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((e: any) => ({ key: e.id, text: e.name }));
      setRequestedByOptions1(options);
    } catch (error) {
      notify.showErrorNotify('Error getting users');
    }
  };
  
  const fetchPeriodOptions = async () => {
    try {
      const response = await apiClient.getAllPeriod();
      if (!response?.result) throw new Error('No result from API');
      const options = response.result.map((e: any) => ({ key: e.id, text: e.yearName }));
      setPeriodOptions(options);
    } catch (error) {
      notify.showErrorNotify('Error getting periods');
    }
  };

  useEffect(() => {
    if (props?.SelectedAudit) {
      reset({
        name: props.SelectedAudit.name || '',
        startdate: props.SelectedAudit.startdate ? new Date(props.SelectedAudit.startdate) : null,
        enddate: props.SelectedAudit.enddate ? new Date(props.SelectedAudit.enddate) : null,
        auditingProcess: props.SelectedAudit.auditingProcess || 0,
        requestedby: props.SelectedAudit.requestedby || 0,
        periodId: props.SelectedAudit.periodId || 0,
      });
    }
  }, [props?.SelectedAudit, reset]);


  const onSubmit = async (data: FormData) => {
    const isEdit = !!props.recordId;

    const createAudit = new Createaudit();
    const formatDate = (date: Date | null) => {
      if (!date) return '';
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      return utcDate.toISOString();
    };

    createAudit.init({
      id: props.recordId,
      startdate: formatDate(data.startdate),
      enddate: formatDate(data.enddate),
      auditingProcess: data.auditingProcess,
      assessmentGroup: '',
      periodId: data.periodId,
      name: data.name,
      requestedby: data.requestedby,
      isActive: isEdit ? true : props.SelectedAudit?.isActive || false,
    });

    try {
      await apiClient.addorUpdateAudit(createAudit);
      notify.showSuccessNotify(`${t(isEdit ? 'EDITED_SUCCESSFULLY' : 'ADDED_SUCCESSFULLY')}`);
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify(`${t('ERROR_SAVING_AUDIT')}`);
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
                errorMessage={errors.name && errors.name.message?.toString()}
              />
            )}
          />
          <Controller
            name="startdate"
            control={control}
            rules={{ required: 'Start Date is required' }}
            render={({ field }) => (
              <DatePicker
                label="Start Date"
                onSelectDate={(date) => field.onChange(date)}
                value={field.value || undefined}
                isMonthPickerVisible={false}
                minDate={new Date()}
              />
            )}
          />
          <Controller
            name="enddate"
            control={control}
            rules={{ required: 'End Date is required' }}
            render={({ field }) => (
              <DatePicker
                label="End Date"
                onSelectDate={(date) => field.onChange(date)}
                value={field.value || undefined}
                isMonthPickerVisible={false}
                minDate={new Date()}
              />
            )}
          />
          <Controller
            name="periodId"
            control={control}
            rules={{ required: 'Period is required' }}
            render={({ field }) => (
              <Dropdown
                label="Period"
                options={periodOptions}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.periodId?.message}
              />
            )}
          />
          <Controller
            name="auditingProcess"
            control={control}
            rules={{ required: 'Auditing Process is required' }}
            render={({ field }) => (
              <Dropdown
                label="Auditing Process"
                options={auditingProcessOptions}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.auditingProcess?.message}
              />
            )}
          />
          <Controller
            name="requestedby"
            control={control}
            rules={{ required: 'Requested By is required' }}
            render={({ field }) => (
              <Dropdown
                label="Requested By"
                options={requestedByOptions1}
                selectedKey={field.value}
                onChange={(_, option) => field.onChange(option?.key)}
                errorMessage={errors.requestedby?.message}
              />
            )}
          />
        </Stack>
        <div className="p-1 d-flex align-items-center justify-content-center">
          <PrimaryButton type="submit" text="Submit" disabled={!isValid} />
        </div>
      </form>
    </div>
  );
}
