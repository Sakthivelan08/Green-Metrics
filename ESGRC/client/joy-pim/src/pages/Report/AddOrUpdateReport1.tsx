import React, { useEffect, useState } from 'react';
import { PrimaryButton, Stack, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import { MergeReport } from '@/services/ApiClient';
import AuthManagerService from '@/services/AuthManagerService';

const stackTokens = { childrenGap: 15 };

interface FormData {
  reportname: string | undefined;
  pdfId: string | undefined;
  description: string | undefined;
}

interface AddOrUpdateReports {
  ClosePopup: () => void;
  onFormSubmitSuccess(): void;
  rowData: any;
  selectUser: any;
  recordId: number;
}

export default function AddOrUpdateReport1(props: Readonly<AddOrUpdateReports>) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [_selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [typeOptions, setTypeOptions] = useState<IDropdownOption[]>([]);
  const authManager = new AuthManagerService();
  const isAuthenticated = authManager.isAuthenticated();
  const user = isAuthenticated ? authManager.getUserData() : null;
  const userId: any = user?.id || 0;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      reportname: '',
      pdfId: '',
      description: '',
    },
  });

  useEffect(() => {
    fetchTypeOptions1();
  }, []);

  useEffect(() => {
    if (props?.selectUser) {
      reset({
        reportname: props.selectUser.name || '',
        pdfId: props.selectUser.pdfId,
        description: props.selectUser.description || '',
      });
    }
  }, [props?.selectUser, setValue]);

  const fetchTypeOptions1 = async () => {
    try {
      const response = await apiClient.getAllPdfReports();
      if (!response?.result) throw new Error('No result from API');

      const options = response.result.map((item: any) => ({
        key: item.id.toString(),
        text: item.url,
      }));

      setTypeOptions(options);

      if (props?.rowData?.[0]?.pdfname) {
        const pdfIds = props.rowData[0].pdfname.split(',');
        const selectedOptions = options.filter((option) => pdfIds.includes(option.key));

        setValue('pdfId', selectedOptions.map((option) => option.key).join(','));
        setValue('reportname', props.rowData[0]?.reportname || '');
        setValue('description', props.rowData[0]?.description || '');
      }
    } catch (error) {
      notify.showErrorNotify('Failed to fetch type options.');
    }
  };

  const onSubmit = async (data: FormData) => {
    const isEdit = !!props.recordId;
    try {
      const id = props.recordId;
      const name = data.reportname;
      const pdfname = String(data.pdfId);
      const description = data.description;
      const isActive = isEdit ? true : props.selectUser?.isActive || false;

      const body = new MergeReport();
      body.id = id;
      body.name = name;
      body.pdfId = pdfname;
      body.description = description;
      body.createdBy = userId;
      body.isActive = isActive;

      await apiClient.addPdfReport2(body).then(() => {
        notify.showSuccessNotify(`${t(isEdit ? 'EDITED_SUCCESSFULLY' : 'ADDED_SUCCESSFULLY')}`);
      });

      props.onFormSubmitSuccess();
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify('Failed to create report');
    }
  };

  return (
    <div className="w-100 h-100 overflow-hidden form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="reportname"
            control={control}
            rules={{ required: 'Report Name is required' }}
            render={({ field }) => (
              <TextField
                label={t('REPORT_NAME') || ''}
                {...field}
                value={field.value ? String(field.value) : ''}
                errorMessage={errors.reportname?.message}
              />
            )}
          />
          <Controller
            name="pdfId"
            control={control}
            rules={{ required: 'PDF name is required' }}
            render={({ field }) => (
              <Dropdown
                label={t('PDF_NAME') || ''}
                options={typeOptions}
                selectedKeys={field.value ? field.value.split(',') : []}
                onChange={(_, option) => {
                  const selectedKeys = field.value ? field.value.split(',') : [];
                  const updatedKeys = option?.selected
                    ? [...selectedKeys, option.key]
                    : selectedKeys.filter((key) => key !== option?.key);

                  field.onChange(updatedKeys.join(','));
                  setSelectedType(
                    typeOptions
                      .filter((opt) => updatedKeys.includes(opt.key))
                      .map((opt) => opt.text)
                      .join(', '),
                  );
                }}
                multiSelect
                errorMessage={errors.pdfId?.message}
                onRenderOption={(option) => {
                  if (!option) return null;

                  return (
                    <span
                      title={option.text}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '400px',
                      }}
                    >
                      {option.text}
                    </span>
                  );
                }}
              />
            )}
          />

          <div className="p-1 d-flex align-item-center justify-content-center">
            <PrimaryButton
              className="submitglobal"
              type="submit"
              text={`${t('BTN_SUBMIT')}`}
              disabled={!isValid}
            />
          </div>
        </Stack>
      </form>
    </div>
  );
}
