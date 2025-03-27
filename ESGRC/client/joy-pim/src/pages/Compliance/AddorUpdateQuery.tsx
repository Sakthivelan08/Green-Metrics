import React, { useEffect, useState } from 'react';
import {
  PrimaryButton,
  Stack,
  Dropdown,
  IDropdownOption,
  TextField,
  Checkbox,
} from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { IRole, Queries } from '@/services/ApiClient';

const stackTokens = { childrenGap: 15 };

interface FormData {
  auditname: any | string;
  assignedto: any | number;
  querydescription: string;
  response: string;
  IsChangeNeeded: boolean;
}

interface AddorUpdateAuditProps {
  ClosePopup: () => void;
  kd: any[];
  Datakd: any;
  rowData1: any[];
}

export default function AddorUpdateQuery(props: AddorUpdateAuditProps) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [isEditMode, setIsEditMode] = useState(false);
  const [assignedToName, setAssignedToName] = useState<string>('');
  const [roles, setRoles] = useState<IRole[]>([]); 
  
  const name = window.location.pathname;
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      auditname: props.Datakd[0]?.auditName ||props.Datakd[0]?.auditname ,
      assignedto: props.Datakd[0]?.roleId || props.Datakd[0]?.roleid,
      response: '',
      IsChangeNeeded: false,
    },
  });

  // useEffect(() => {
  //   if (window.location.pathname === '/activity/queries') {
  //     populateFormFields();
  //   }
  // }, []);

  useEffect(() => {
  
  
    if (window.location.pathname === '/home/queries') {
      populateFormFields();
    }
  
    if (props.Datakd.length === 0) {
      reset(props.Datakd[0]);
    }
  }, [props.kd, props.Datakd, setValue]);
  
  
  const populateFormFields = async () => {
    try {
      const response = await apiClient.getViewQueries(props.kd[0].id);
      const queryData: any = response.result;

      if (queryData && queryData.length > 0) {
        setIsEditMode(true); // Ensure isEditMode is set if data exists
      } else {
        setIsEditMode(false);
      }

      setValue('auditname', queryData[0]?.auditname || '');
      setValue('assignedto', queryData[0]?.roleid || 0);
      setValue('querydescription', queryData[0]?.querydescription || '');
      setValue('response', queryData[0]?.response || '');
      setValue('IsChangeNeeded', queryData[0]?.ischangeneeded || false);
    } catch (error) {
      notify.showErrorNotify('Error loading form data');
    }
  };


  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.getRoles(true);
        if (response?.result) {
          setRoles(response.result); 
        } else {
          throw new Error('No roles found');
        }
      } catch (error) {
        notify.showErrorNotify('Error fetching roles');
      }
    };

    fetchRoles();
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log('Form Data:', data);

    try {
      const auditNameValue = props.Datakd[0].auditId;
      //  Array.isArray(data.auditname) ? data.auditname[0] : data.auditname;
      const assignedtovalue = Array.isArray(data.assignedto) ? data.assignedto[0] : data.assignedto;
      var processstageId = props.Datakd[0].id;

      const createquery = new Queries({
        assignedto: assignedtovalue,
        querydescription: data.querydescription,
        response: data.response,
        isChangeNeeded: data.IsChangeNeeded,
        auditId: auditNameValue,
        processstageId: processstageId,
      });

      if (isEditMode) {
        debugger
        const id = props.Datakd[0].id;
        var processstageId = props.Datakd[0].processstageid;
        var auditId = props.Datakd[0].auditid;
        await apiClient.editQueries(id, data.response, processstageId, auditId);
        setValue('response', data.response);
        notify.showSuccessNotify('Query updated successfully');
      } else {
        await apiClient.createQueries(createquery);
        notify.showSuccessNotify('Query created successfully');
      }
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify('Error saving query');
    }
  };

  return (
    <div className="w-100 h-100 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="auditname"
            control={control}
            rules={{ required: 'audit name is required' }}
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
            render={({ field }) => {
              const selectedRole = roles.find(role => role.id === field.value);
              const roleName = selectedRole ? selectedRole.name : '';
              return (
                <TextField
                  label="Assigned To"
                  value={roleName} 
                  onChange={(_, newValue) => {
                    if (newValue) {
                      const role = roles.find(role => role.name?.toLowerCase() === newValue.toLowerCase());
                      const roleId = role ? role.id : 0;
                      field.onChange(roleId); 
                    }
                  }}
                  errorMessage={errors.assignedto?.message as string}
                />
              );
            }}
          />

          <Controller
            name="querydescription"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                label="Query Description"
                multiline
                rows={4}
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                errorMessage={errors.querydescription && errors.querydescription.message}
              />
            )}
          />

          {isEditMode ? (
            <Controller
              name="response"
              control={control}
              rules={{ required: 'Response is required' }}
              render={({ field }) => (
                <TextField
                  label="Response"
                  multiline
                  rows={4}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  errorMessage={errors.response && errors.response.message}
                />
              )}
            />
          ) : null}

          <Controller
            name="IsChangeNeeded"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Is Change Needed?"
                checked={field.value}
                onChange={(_, checked) => field.onChange(checked)}
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
