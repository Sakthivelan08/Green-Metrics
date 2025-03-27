import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { columnHeader, PIMcontentStyles } from '../PimStyles';
import { t } from 'i18next';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import AuthManagerService from '@/services/AuthManagerService';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Drawer } from '@mui/material';
import { Icon, Modal } from '@fluentui/react';
import MetricSurveyForm from '../SurveyPages/MetricSurveyForms';
import ApproverProcessList from '../ProcessList/ApproverProcessList';
import { TemplateStageApprovalEnum } from '../enumCommon';
import { IconButton } from '@fluentui/react/lib/Button';
import { baseUrl } from '@/services/Constants';
import { BlockBlobClient } from '@azure/storage-blob';
import { ComplianceStageDtoListApiResponse, FileParameter, UploadedFile } from '@/services/ApiClient';
import UploadData from './UploadData';
import NotificationManager from '@/services/NotificationManager';
import Publish from '../ProcessList/Publish';

interface stateInterFace {
  productDetails: any[];
  isDrawerOpen: boolean;
  selectedTemplate: any;
  selectedProcess: any;
  isApprover: boolean | undefined;
  isPublisher: boolean | undefined;
  disabled: boolean | undefined;
  visible: boolean;
  name: string | null | any;
  imageProgress: boolean;
  selectedTemplateId: number;
  selectedassessmentId: number;
  isNew: boolean;
  progressPercent?: number;
  selectedRowUploadFile?: UploadedFile;
  selectedStage: any;
  requestedByPeriod: any;
  requestedByName: any;
  metricgroupid: any,
  auditid: any

}

class ComplianceList extends Component<any, stateInterFace> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  isAuthenticated = this.authManager.isAuthenticated();
  user = this.isAuthenticated ? this.authManager.getUserData() : null;
  token: any = sessionStorage.getItem('token');
  roleId: any = this.user?.roleId?.[0] || [];
  notify = new NotificationManager();
  constructor(props: any) {
    super(props);
    this.state = {
      productDetails: [],
      isDrawerOpen: false,
      selectedTemplate: null,
      selectedProcess: null,
      isApprover: false,
      isPublisher: false,
      disabled: false,
      visible: false,
      name: null,
      imageProgress: false,
      selectedTemplateId: 0,
      selectedassessmentId: 0,
      isNew: true,
      progressPercent: 0,
      selectedRowUploadFile: undefined,
      selectedStage: null,
      requestedByPeriod: new Map<number, string>(),
      requestedByName: new Map<number, string>(),
      auditid: null,
      metricgroupid: null,
    };
  }

  componentDidMount(): void {
    this.refresh();
  }

  async refresh() {
    this.getDatas();
    this.checkIfApprover();
    this.checkIfPublisher();
    this.fetchPeriodOptions();
    this.fetchNameOptions();
  }

  componentDidUpdate(prevProps: any, prevState: stateInterFace) {
    if (prevState.isApprover !== this.state.isApprover) {
      console.log('isApprover state updated:', this.state.isApprover);
    } else if (prevState.isPublisher !== this.state.isPublisher) {
      console.log('isPublisher state updated:', this.state.isPublisher);
    }
  }

  getDatas(): void {
    this.apiClient
      .getStageList()
      .then((res: ComplianceStageDtoListApiResponse) => {
        if (!res.hasError && res.result) {
          this.setState({ productDetails: res.result });
        }
      })
      .catch((error: any) => {
        console.error('Error fetching data:', error);
      });
  }

  async fetchNameOptions() {
    try {
      const response = await this.apiClient.getRoles(true);
      if (!response?.result) {
        throw new Error('No result from the API');
      }
      const requestedByName = new Map<number, string>(
        response.result.map((e: any) => [e.id, e.name]),
      );
      this.setState({ requestedByName });
    } catch (error) {
      this.notify.showErrorNotify('Error getting name');
    }
  }

  checkIfApprover(): void {
    this.apiClient
      .isApprover()
      .then((res) => {
        console.log('isApprover API response:', res);
        if (!res.hasError) {
          console.log(res.result);
          this.setState({ isApprover: res?.result || undefined });
        }
      })
      .catch((err) => {
        console.error('Error checking if approver:', err);
      });
  }

  checkIfPublisher(): void {
    this.apiClient
      .isPublisher()
      .then((res) => {
        console.log('isApprover API response:', res);
        if (!res.hasError) {
          console.log(res.result);
          this.setState({ isPublisher: res?.result || undefined });
        }
      })
      .catch((err) => {
        console.error('Error checking if approver:', err);
      });
  }

  downloadTemplate = async (templateId: number) => {
    try {
      const format = 'xlsx';
      const token = this.token;
      const url = `${baseUrl}/api/Template/FormTemplate?templateId=${templateId}&format=${format}&token=${token}`;

      await this.apiClient.formTemplate(templateId, format);

      const fileName = `template_${templateId}.xlsx`;
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

  async onUpload(files: File[], _assessmentId: string) {
    try {
      if (!files || files.length === 0) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-NO-FILE-SELECTED'));
        return;
      }

      const file = files[0];
      const fileName = file?.name;
      const templateId = this.state.selectedassessmentId; // Renamed from assessId

      if (!fileName) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-INVALID-FILENAME'));
        return;
      }

      if (templateId === null || templateId === undefined) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-TEMPLATEID-NOT-FOUND'));
        return;
      }
      const auditid = this.state.auditid;
      const metricgroupid = this.state.metricgroupid;

      // Get upload URL
      const uriResponse = await this.apiClient.getAuthorizedUrlForWrite(fileName);
      const uri = uriResponse?.result;

      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }

      // Upload file to Azure Blob Storage
      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(file, {
        onProgress: (progress) => {
          const progressPercent = Math.round((progress.loadedBytes / file.size) * 100);
          this.setState({ progressPercent });
        },
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      // Prepare file for API request
      const fileParameter: FileParameter = {
        data: file,
        fileName: fileName,
      };

      // Call API to save metadata
      const response = await this.apiClient.uploadFormTemplate(templateId, metricgroupid, auditid, fileParameter);
      if (response?.hasError) {
        this.notify.showErrorNotify(response.message || this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
      } else {
        this.notify.showSuccessNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-SUCCESS'));
      }
    } catch (error) {
      console.error('File upload error:', error);
      this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
    }
  }


  navigation = (templateId: any) => {
    this.props.history.push(`/metrics/complianceList/${templateId}`);
  };

  getStatusClass = (status: TemplateStageApprovalEnum): string => {
    switch (status) {
      case TemplateStageApprovalEnum.Completed:
        return 'status-completed';
      case TemplateStageApprovalEnum.Error:
        return 'status-error';
      case TemplateStageApprovalEnum.QueryRaised:
        return 'status-query-raised';
      case TemplateStageApprovalEnum.Rejected:
        return 'status-rejected';
      case TemplateStageApprovalEnum.Success:
        return 'status-success';
      case TemplateStageApprovalEnum.Pending:
        return 'status-pending';
      case TemplateStageApprovalEnum.Yettostart:
        return 'status-yet-to-start';
      default:
        return 'status-default';
    }
  };

  UploadPicture = async (file: any, templateId: any) => {
    try {
      this.setState({ imageProgress: false });
      console.log(this.state.selectedTemplate);
      this.onUpload(file, templateId);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };

  navigation1 = (id: any, templateId: any) => {
    this.props.history.push(
      `/home/complianceLists/tempalteValueDetails?id=${id}&templateId=${templateId}`,
    );
  };

  async fetchPeriodOptions() {
    try {
      const response = await this.apiClient.getAllPeriod();
      if (!response?.result) {
        throw new Error('No result from the API');
      }
      const requestedByPeriod = new Map<number, string>(
        response.result.map((e: any) => [e.id, e.yearName]),
      );
      this.setState({ requestedByPeriod });
    } catch (error) {
      this.notify.showErrorNotify('Error getting years');
    }
  }

  render() {
    const {
      productDetails,
      isDrawerOpen,
      isApprover,
      isPublisher,
      requestedByPeriod,
      requestedByName,
    } = this.state;
    const columns: any[] = [
      {
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        //width: "100px",
        selector: (row: any, index: number) => index + 1,
        width: '6%',
      },
      {
        key: 'audit',
        name: <div className={columnHeader}>{t('COL_AUDIT_NAME')}</div>,
        selector: (row: any) => <span title={row.auditName}>{row.auditName}</span>,
        width: '20%',
      },
      {
        key: 'roleId',
        name: <div className={columnHeader}>{t('Department')}</div>,
        selector: (row: any) => {
          const name = requestedByName.get(row.roleId);
          return <span title={name}>{name}</span>;
        },
        width: '12%',
      },
      {
        key: 'periodId',
        name: <div className={columnHeader}>{t('COL_YEAR_NAME')}</div>,
        selector: (row: any) => {
          const name = requestedByPeriod.get(row.periodId);
          return <span title={name}>{name}</span>;
        },
        sortable: true,
        minWidth: '200px',
        width: '12%',
      },
      {
        key: 'status',
        name: <div className={columnHeader}>{t('COL_STATUS')}</div>,
        width: '13%',
        selector: (row: { status: TemplateStageApprovalEnum }) => {
          const statusClass = this.getStatusClass(row.status);
          const statusText = TemplateStageApprovalEnum[row.status] || '-';
          return <div className={`status-label ${statusClass}`}>{statusText}</div>;
        },
      },
      {
        key: 'reason',
        name: <div className={columnHeader}>{t('COL_REASON')}</div>,
        selector: (row: any) => (
          <span title={row.issueReason || '--'}>{row.issueReason || '--'}</span>
        ),
        width: '9%',
      },
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '36%',
        cell: (row: any) => {
          const isSuccess = row.status === TemplateStageApprovalEnum.Success;
          return (
            <div style={{ display: 'flex', gap: '10px' }}>
              <DefaultButton
                className="audit-data"
                text="Audit Data"
                onClick={() => {
                  if (row.status === TemplateStageApprovalEnum.Success) {
                    this.navigation1(row.auditId, row.templateId);
                  } else {
                    this.setState({
                      selectedTemplate: row.templateId,
                      selectedassessmentId: row.templateId,
                      selectedProcess: row.processId,
                      isDrawerOpen: true,
                      selectedStage: { auditId: row?.auditId },
                      disabled:
                        row.status === TemplateStageApprovalEnum.Completed ||
                        row.status === TemplateStageApprovalEnum.Success ||
                        row.status === TemplateStageApprovalEnum.Approved,
                    });
                  }
                }}
              />
              {!isSuccess && (
                <>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <DefaultButton
                      iconProps={{ iconName: 'Upload' }}
                      className="uploaddownload-button"
                      text={`${t('Upload Template')}`}
                      onClick={() => {
                        this.setState({
                          // selectedTemplateId: row.id,
                          selectedassessmentId: row.templateId,
                          selectedTemplate: row,
                          visible: true,
                          name: row,
                          auditid: row.auditId,
                          metricgroupid: row.metricGroupId
                        });
                      }}
                    />
                    <DefaultButton
                      className="uploaddownload-button"
                      iconProps={{ iconName: 'Download' }}
                      text="Download Template"
                      onClick={() => this.downloadTemplate(row.templateId)}
                    />
                  </div>
                </>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          {isApprover ? (
            <div>
              <ApproverProcessList />
            </div>
          ) : isPublisher ? (
            <div>
              <Publish />
            </div>
          ) : (
            <>
              <div className="processtemp">
                <p>{t('PROCESS_TEMPLATE')}</p>
                <Icon
                  iconName="Refresh"
                  title={this.props.t('BTN_REFRESH')}
                  className="iconStyle iconStyle1"
                  onClick={() => this.refresh()}
                />
              </div>

              <div>
                <DataTable
                  columns={columns}
                  data={productDetails}
                  pagination
                  selectableRowsHighlight
                  highlightOnHover
                  responsive
                  fixedHeader
                  striped
                  fixedHeaderScrollHeight="68.03vh"
                  style={{ marginBottom: '20px' }}
                />
              </div>
              <div>
                <Drawer
                  anchor={'right'}
                  open={isDrawerOpen}
                  onClose={(_, reason) => {
                    if (reason !== 'backdropClick') {
                      this.setState({ isDrawerOpen: false });
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                    <IconButton
                      iconProps={{ iconName: 'Cancel' }}
                      title="Close"
                      ariaLabel="Close"
                      onClick={() => this.setState({ isDrawerOpen: false })}
                    />
                  </div>
                  <MetricSurveyForm
                    // template={this.state?.selectedTemplate}
                    process={this.state?.selectedProcess}
                    selectedStage={this.state?.selectedStage}
                    isReadOnly={undefined}
                    roleId={this.roleId}
                    disabled={this.state.disabled}
                    templateId={this.state.selectedassessmentId}

                    onSubmitComplete={() => {
                      this.setState({ isDrawerOpen: false });
                      this.getDatas();
                    }}
                  />
                </Drawer>
              </div>

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
                    UploadData={(file: any, templateId: any) => this.UploadPicture(file, templateId)}
                    Row={this.state?.name}
                  />
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation()(withRouter(ComplianceList));
