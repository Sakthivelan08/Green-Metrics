import React, { useEffect, useState } from 'react';
import {
  PrimaryButton,
  Stack,
  Dropdown,
  IDropdownOption,
  TextField,
  DefaultButton,
  Modal,
} from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import { BlockBlobClient } from '@azure/storage-blob';
import { PIMcontentStyles } from '@/pages/PimStyles';
import UploadData1 from './UploadData1';
import { PdfReports } from '@/services/ApiClient';

const stackTokens = { childrenGap: 15 };

interface FormData {
  pagenumber: number;
  type: string;
}

interface AddOrUpdateReports {
  ClosePopup: () => void;
  onFormSubmitSuccess() : void;
  rowData: any;
}

export default function AddOrUpdateReports(props: AddOrUpdateReports) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [monthsOptions, setMonthsOptions] = useState<IDropdownOption[]>([]);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [_progressPercent, setProgressPercent] = useState(0);
  const [selectedTemplateId, _setSelectedTemplateId] = useState<number | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [url, seturl] = useState<string | undefined>(undefined);
  //const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined);
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>( undefined);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      pagenumber: 0,
    },
  });

  useEffect(() => {
    fetchTypeOptions();
  }, []);

  const fetchTypeOptions = async () => {
    try {
      const response = await apiClient.getAppConfig();
      if (!response?.result) throw new Error('No result from API');
      const reportTypeItem = response.result.find((f: any) => f.name === 'Report Type');
      if (!reportTypeItem || !reportTypeItem.jsonValue) {
        throw new Error('Report Type or jsonValue not found');
      }
      const options = JSON.parse(reportTypeItem.jsonValue).map((item: any) => ({
        key: item.key,
        text: item.value,
        type: item.type,
      }));
      setMonthsOptions(options);
      setValue('type', props?.rowData[0]?.type);
      setValue('pagenumber', props?.rowData[0]?.pageNumber);
    } catch (error) {
      notify.showErrorNotify('FETCHING_ERROR');
    }
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileName = file.name;
    try {
      const uri = (await apiClient.getAuthorizedUrlForWrite(fileName))?.result;
      if (!uri) {
        notify.showErrorNotify(t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }
      seturl(uri);
      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(file, {
        onProgress: (event) => {
          const progress = Math.round((event.loadedBytes / file.size) * 100);
          setProgressPercent(progress);
        },
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      const uploadData = {
        data: file,
        fileName,
      };
      const response = await apiClient.uploadPdffile(uploadData);
      if (response.hasError) {
        notify.showErrorNotify(response.message || t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
      } else {
        notify.showSuccessNotify(t('MSG-DATA-FILEUPLOAD-COMMON-SUCCESS'));
      }
    } catch (error) {
      notify.showErrorNotify(t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
    }
  };

  // const UploadPicture = async (files: FileList | null) => {
  //   await onUpload(files);
  // };
  const UploadPicture = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFileName(file.name); 
      await onUpload(files); 
    }
  };


  const onSubmit = async (data: FormData) => {
    try {
      const rowdata = props.rowData[0]?.id ?? 0;
      const URL = url;
      const type = selectedType;
      const page = data.pagenumber;
      if (!URL || !type) {
        throw new Error('URL or Type is missing');
      }
      const body = new PdfReports();
      body.id = rowdata;
      body.type = type;
      body.url = URL;
      body.pageNumber = page;

      await apiClient.addPdfReport(body).then(() => {
        notify.showSuccessNotify(rowdata ? 'EDITED_SUCCESSFULLY' : 'ADDED_SUCCESSFULLY');
      });
      props.onFormSubmitSuccess();
      props.ClosePopup();
    } catch (error) {
      notify.showErrorNotify('Failed to create report');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack tokens={stackTokens}>
          <Controller
            name="pagenumber"
            control={control}
            render={({ field }) => (
              <TextField
                label={t('PAGE_NO') || ''}
                {...field}
                value={field.value ? String(field.value) : ''}
                errorMessage={errors.pagenumber && errors.pagenumber.message}
                className="custom-textarea"
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="type"
                options={monthsOptions}
                selectedKey={monthsOptions.find((option) => option.text === field.value)?.key}
                onChange={(_, option) => {
                  field.onChange(option?.text);
                  setSelectedType(option?.text);
                }}
                errorMessage={errors.type?.message}
                className="custom-dropdown"
              />
            )}
          />
  
          {selectedFileName && (
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#555', marginBottom: '10px' }}>
              {selectedFileName}
            </div>
          )}
  
         
          <div style={{ display: 'flex', gap: '30px',marginLeft:'20px', marginTop:'30px' }}>  
            
            <DefaultButton
              iconProps={{ iconName: 'Upload' }}
              className="submitglobal"
              text={t('Upload Template') || ''}
              onClick={() => setIsUploadModalVisible(true)}
              style={{ marginTop: '5px' }}  
            />
  
            <PrimaryButton
              className="submitglobal"
              type="submit"
              text="Submit"
              disabled={!isValid}
              style={{ marginTop: '5px' }}  
            />
          </div>
        </Stack>
  
        <div className="p-1 d-flex align-items-center justify-content-center">
        </div>
  
      
        <Modal
          isOpen={isUploadModalVisible}
          containerClassName={PIMcontentStyles.ExcelContainer}
          onDismiss={() => setIsUploadModalVisible(false)}
        >
          <div className={PIMcontentStyles.header}>
            <span className="modelHeaderText1">{t('UPLOAD')}</span>
          </div>
          {selectedFileName && (
            <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>
              <strong>Selected File:</strong> {selectedFileName}
            </div>
          )}
          <div className={PIMcontentStyles.body}>
            <UploadData1
              pdftype={selectedType}
              ClosePopup={() => setIsUploadModalVisible(false)}
              UploadData={UploadPicture}
            />
          </div>
        </Modal>
      </form>
    </div>
  );
  
}
