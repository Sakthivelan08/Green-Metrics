import React, { Component } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Icon, Modal,Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { withTranslation } from 'react-i18next';
import NotificationManager from '@/services/NotificationManager';
import { columnHeader, PIMcontentStyles, PIMHearderText } from '../PimStyles';
import AuthManagerService from '@/services/AuthManagerService';
import { baseUrl } from '@/services/Constants';
import { BlockBlobClient } from '@azure/storage-blob';
import { FileParameter } from '@/services/ApiClient';
import UploadData from '../Compliance/UploadData';
import { Link } from 'react-router-dom';
import { Card, Grid } from '@mui/material';
import { ITextProps, Text } from '@fluentui/react/lib/Text';

class SFTPUpload extends Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  isAuthenticated = this.authManager.isAuthenticated();
  token: any = sessionStorage.getItem('token');
  notify = new NotificationManager();

  constructor(props: any) {
    super(props);
    this.state = {
      visible: false,
      selectedTemplateId: null,
      selectedTemplate: null,
      name: null,
      productDetails: [],
      isRecord: true,
    };
  }

  async componentDidMount() {
    this.refresh();
  }

  async refresh() {
    this.setState({
      isRecord: true,
      productDetails: [],
    })
    try {
      const templates = await this.fetchTemplates();
      const indexedTemplates = templates.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
      }))
      this.setState({ 
        productDetails: indexedTemplates,
      });
    } catch (e: any) {
      console.error("Error refreshing templates:", e);
      this.notify.showErrorNotify(e.message);
    } finally {
      this.setState({ isRecord: false });
    }
  }

  async fetchTemplates() {
    try {
      const templateResponse = await this.apiClient.getAllSFTPTemplate();
      return templateResponse.result || [];
    } catch (e: any) {
      console.error(e.message);
      return [];
    }
  }

  downloadTemplate = async (id: number) => {
    try {
      const format = 'xlsx';
      const token = this.token;
      const url = `${baseUrl}/api/Template/DownloadSFTPTemplate?templateId=${id}&format=${format}&token=${token}`;
      await this.apiClient.downloadTemplate(id, format);

      const fileName = `template_${id}.xlsx`;
      this.downloadFileCommonTemplate(url, fileName);
    } catch (error: any) {
      console.error('Error downloading template:', error);
    }
  };

  downloadFileCommonTemplate(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async onUpload(files: any, id: any) {
    try {
      if (!files) return;
      let f: any = files[0];
      let fileName = f?.name;
      const uri = (await this.apiClient.getAuthorizedUrlForWrite(fileName || ''))?.result;

      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }

      const uploadData: FileParameter = {
        data: f,
        fileName: fileName,
      };

      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(f, {
        onProgress: (observer) => {
          const progress = Math.round((observer.loadedBytes / f.size) * 100);
          this.setState({ progressPercent: progress });
        },
        blobHTTPHeaders: {
          blobContentType: f.type,
        },
      });

      const response = await this.apiClient.uploadSFTPfile(uploadData);

      if (response.hasError) {
        this.notify.showErrorNotify(
          response.message || this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'),
        );
      } else {
        this.notify.showSuccessNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-SUCCESS'));
      }
    } catch (error) {
      this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
    }
  }

  UploadPicture = async (file: any, id: any) => {
    try {
      this.setState({ imageProgress: false });
      console.log(this.state.selectedTemplate);
      this.onUpload(file, id);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };
  
  render() {
    const { t } = this.props;
    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'Name',
        name: <div className={columnHeader}>{t('COL_NAME')}</div>,
        selector: (row: any) => <span title={row.name}>{row.name}</span>,
        width: '20%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        },
      },      
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '37%',
        cell: (row: any) => {
          return (
            this.state.productDetails.length > 0 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <DefaultButton
                  className="uploaddownload-button"
                  iconProps={{ iconName: 'Download' }}
                  text="Download Template"
                  onClick={() => this.downloadTemplate(row.id)}
                />
                <DefaultButton
                  iconProps={{ iconName: 'Upload' }}
                  className="uploaddownload-button"
                  text={t('Upload Template')}
                  onClick={() =>
                    this.setState({
                      selectedTemplateId: row.id,
                      selectedTemplate: row,
                      visible: true,
                      name: row,
                    })
                  }
                />
              </div>
            )
          );
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_SFTP_UPLOAD')}
          </Link>
          <Grid lg={12} item container spacing={1} direction={'row'}>
            <Grid item lg={2} xs={12}>
            <Stack>
              <Text
                className="color-blue text"
                key={'xxLarge'}
                variant={'xxLarge' as ITextProps['variant']}
                styles={PIMHearderText}
                nowrap
                block
              >
                {t('SUBMENU_SFTP_UPLOAD')}
              </Text>
            </Stack>
            </Grid>

            <Grid item lg={0.9} xs={6}></Grid>
            <Grid item lg={1.3} xs={6}></Grid>
            <Grid item lg={1.3} xs={6}></Grid>
            
            <Grid item lg={4.7} />
            <Grid item lg={0.8} xs={1}>
              <Icon
                iconName="Refresh"
                title={this.props.t('BTN_REFRESH')}
                className="iconStyle iconStyle1"
                onClick={() => this.refresh()}
              />
            </Grid>
          </Grid>
          
          <Modal
            isOpen={this.state.visible}
            containerClassName={PIMcontentStyles.ExcelContainer}
            onDismiss={() => this.setState({ visible: false })}
          >
            <div className={PIMcontentStyles.header}>
              <span className="modelHeaderText1">{t('UPLOAD')}</span>
            </div>
            <div className={PIMcontentStyles.body}>
              <UploadData
                ClosePopup={() => this.setState({ visible: false })}
                UploadData={(file: any, id: any) => this.UploadPicture(file, id)}
                Row={this.state.name}
              />
            </div>
          </Modal>

          <Card>
            {this.state.productDetails?.length > 0 ? (
              <DataTable
                columns={columns}
                data={this.state.productDetails}
                pagination
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="68.03vh"
                paginationComponentOptions={{ rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}` }}
                noDataComponent={
                  <div className="noDataWidth">
                    {<DataTable columns={columns} data={[{ '': '' }]} />}
                    <Stack className="noRecordsWidth">
                      {this.state.isRecord
                        ? `${this.props.t('RECORDS')}`
                        : `${this.props.t('NO_RECORDS')}`}
                    </Stack>
                  </div>
                }
              />
            ) : (
              <div className="noDataWidth">
                {<DataTable columns={columns} data={[{ '': '' }]} />}
                <Stack className="noRecordsWidth">
                  {this.state.isRecord
                    ? `${this.props.t('RECORDS')}`
                    : `${this.props.t('NO_RECORDS')}`}
                </Stack>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }
}

export default withTranslation()(SFTPUpload);
