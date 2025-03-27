import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, TextField, DatePicker, IDropdownOption, Dropdown } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { AuditIssue } from '@/services/ApiClient';
import { t } from 'i18next';

const stackTokens = { childrenGap: 15 };

interface FormData {
  auditname: any | string;
  assignedto: any | number;
  issusereason: string;
  startdate: Date | null;
  enddate: Date | null;
}

interface AddorUpdateAuditProps {
  ClosePopup: () => void;
  ApproveslectedData: any[];
}

export default function RaiseIssuse(props: AddorUpdateAuditProps) {
  const apiClient = new ApiManager().CreateApiClient();
  const [roles, setRoles] = useState<IDropdownOption[]>([]);
  const notify = new NotificationManager();
  const name = window.location.pathname;
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      auditname: props?.ApproveslectedData[0]?.auditName || '',
      assignedto: props?.ApproveslectedData[0]?.roleId,
      issusereason: '',
      startdate: null,
      enddate: null,
    },
  });
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString();
  };

  const onSubmit = async (data: FormData) => {
    console.log('Form Data:', data);
    try {
      var body = new AuditIssue({
        auditId: props?.ApproveslectedData[0].auditId,
        assignedTo: data.assignedto,
        issueReason: data.issusereason,
        startDate: formatDate(data.startdate),
        endDate: formatDate(data.enddate),
      });
      await apiClient.raiseIssue(body);
      props.ClosePopup();
      notify.showSuccessNotify('Query created successfully');
    } catch (error) {
      notify.showErrorNotify('Error while Adding the raiseissuse');
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.getRoles(true); 
        if (response?.result) {
          const roleOptions: IDropdownOption[] = response.result.map((role: any) => ({
            key: role.id,
            text: role.name,
          }));
          setRoles(roleOptions); 
        } else {
          throw new Error('No roles found');
        }
      } catch (error) {
        notify.showErrorNotify('Error fetching roles');
      }
    };
  
    fetchRoles(); 
  }, []); 

  const getAssignedToName = (roleId: number | undefined) => {
    const role = roles.find((role) => role.key === roleId);
    return role ? role.text : '';
  };
  
  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="auditname"
            control={control}
            rules={{ required: 'Audit name is required' }}
            render={({ field }) => (
              <TextField
                label="Audit Name"
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                errorMessage={errors.auditname?.message as string}
              />
            )}
          />

          <Controller
            name="assignedto"
            control={control}
            rules={{ required: 'Assigned To is required' }}
            render={({ field }) => (
              <TextField
                label="Assigned To"
                value={getAssignedToName(field.value)} 
                onChange={(_, newValue) => field.onChange(newValue)} 
                errorMessage={errors.assignedto?.message as string}
                readOnly 
              />
            )}
          />

          <Controller
            name="issusereason"
            control={control}
            rules={{ required: 'Reason is required' }}
            render={({ field }) => (
              <TextField
                label="Reason"
                multiline
                rows={4}
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                errorMessage={errors.issusereason?.message as string}
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
                value={field.value || undefined} // Convert null to undefined
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
                value={field.value || undefined} // Convert null to undefined
                isMonthPickerVisible={false}
                minDate={new Date()}
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
