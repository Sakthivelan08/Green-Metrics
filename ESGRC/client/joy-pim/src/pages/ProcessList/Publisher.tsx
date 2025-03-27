import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { Dialog, DialogFooter, DialogType, Dropdown, Icon, Modal, Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Card, Drawer, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '@/services/Constants';
import {
  columnHeader,
  PIMButtons112,
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '../PimStyles';
import AddorUpdateProcess from './AddorUpdateProcess';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import MetricSurveyForm from '../SurveyPages/MetricSurveyForms';
import AuthManagerService from '@/services/AuthManagerService';
import { TemplateStageApprovalEnum } from '../enumCommon';
import AddorUpdateQuery from '../Compliance/AddorUpdateQuery';
import { withRouter } from 'react-router-dom';
import { IFiscalYear, IQuatter, UploadedFile } from '@/services/ApiClient';
import { BlockBlobClient } from '@azure/storage-blob';
import UploadData from '../Compliance/UploadData';

interface stateInterFace {
  productDetails: any[];
  isView: boolean | undefined;
  detailedData: any[];
  viewData: any[];
  isDrawerOpen: boolean;
  formData: any;
  searchKey: string;
  selectedTemplate: any;
  selectedassessmentId: any;
  selectedProcess: any;
  responseData: any[];
  disabled: boolean | undefined;
  publishStatus: boolean | undefined;
  isDialogVisible: false;
  processList: any[];
  requestedByName: any;
  quarters: IQuatter[];
  selectedQuarter: number | null;
  fiscalYears: IFiscalYear[];
  selectedFiscalYearId: number;
}

class Publisher extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  isAuthenticated = this.authManager.isAuthenticated();
  user = this.isAuthenticated ? this.authManager.getUserData() : null;
  publisherId: any = this.user?.roleId?.[0] || [];
  token: any = sessionStorage.getItem('token');
  notify = new NotificationManager();
  roleId: any = this.user?.roleId?.[0] || [];
  baseUrl: any;
  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      copyRecord: [],
      searchKey: '',
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      isDrawerOpen: false,
      isView: false,
      productDetails: [],
      selectedTemplate: null,
      selectedassessmentId: null,
      selectedProcess: null,
      viewData: [],
      formData: null,
      responseData: [],
      disabled: false,
      publishStatus: false,
      auditList: [],
      processList: [],
      loading: false,
      queryrow: false,
      A_D_Visible: false,
      selectedStage: null,
      clearRows: false,
      requestedByPeriod: new Map<number, string>(),
      requestedByName: new Map<number, string>(),
      selectedReportType: null,
      selectedYear: '',
      fiscalYear: '',
      quarterYear: '',
      isSubmitEnabled: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchPeriodOptions();
    this.fetchNameOptions();
    await this.fetchQuarters();
    await this.fetchFiscalYears();
    this.refresh();
    await this.updatestatus();
  }

  async refresh() {
    try {
      const self = this.state;
      this.setState({ searchKey: '', isRecord: true, clearRows: false, queryrow: false });
      const apiResponse1: any = (await this.apiClient.listProcess()).result;
      this.setState({
        currentRecord: apiResponse1?.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
        copyRecord: apiResponse1?.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
      });
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
    this.setState({
      noSelection: !this.state.noSelection,
      enableEditButton: false,
      enableActiveButton: false,
      selectedRowData: [],
      isRecord: false,
    });
  }

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

  async fetchQuarters() {
    try {
      const response = await this.apiClient.getQuatter();
      if (response?.result) {
        this.setState({ quarters: response.result });
      } else {
        this.notify.showErrorNotify('Error fetching quarters');
      }
    } catch (error) {
      this.notify.showErrorNotify('Error fetching quarters');
    }
  }

  async fetchFiscalYears() {
    try {
      const response = await this.apiClient.getAllFiscalYear();
      if (response?.result) {
        this.setState({ fiscalYears: response.result });
      } else {
        throw new Error('No fiscal years found');
      }
    } catch (error) {
      this.notify.showErrorNotify('Error getting fiscal years');
    }
  }

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };
  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };
  onSearch(e: any) {
    var newValue = e?.target.value;
    newValue = newValue == undefined ? '' : newValue;
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;
    var result = copyRecord.filter((element: any) => {
      return element?.auditName
        ?.toLowerCase()
        .includes(newValue.trim().split(/ +/).join(' ').toLowerCase());
    });
    this.setState({
      currentRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  async fetchViewData(processId: any, templateId: any, auditId: any) {
    try {
      const response: any = await this.apiClient.listPublishresponse(auditId);
      if (response && Array.isArray(response.result)) {
        const filteredData = response.result.filter((item: any) => item.processId === processId);
        const allSuccess = filteredData.every(
          (item: any) => item.status === TemplateStageApprovalEnum.Success,
        );
        this.setState({
          viewData: filteredData,
          responseData: filteredData,
          formData: filteredData.find((item: any) => item.auditId === auditId)?.responsejson,
          publishStatus: allSuccess,
        });
        console.log('Form Data:', this.state.formData);
      }
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
  }

  handleViewClick = (processId: any, templateId: any, auditId: any) => {
    this.fetchViewData(processId, templateId, auditId);
    this.setState({ isView: true });
  };

  updatestatus = async () => {
    const { responseData } = this.state;
    if (!responseData || !Array.isArray(responseData)) {
      return;
    }

    const templateStageIdList: number[] = [];
    const auditIdList: number[] = [];
    responseData.forEach((item: any) => {
      if (item.status === 1 || item.status === 8) {
        templateStageIdList.push(item.templateStageId);
        auditIdList.push(item.auditId);
      }
    });

    if (templateStageIdList.length > 0 && auditIdList.length > 0) {
      try {
        const apiResponse = await this.apiClient.updateTemplateStatus(
          templateStageIdList,
          auditIdList,
        );
        this.notify.showSuccessNotify('Published successfully');
        console.log('API Response:', apiResponse);
        this.setState({ publishStatus: true });
        await this.fetchViewData(
          this.state.selectedProcess,
          this.state.selectedTemplate,
          auditIdList[0],
        );
        await this.refresh();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  openDialog = () => {
    this.setState({ isDialogVisible: true });
  };

  closeDialog = () => {
    this.setState({ isDialogVisible: false });
  };

  confirmApproval = () => {
    this.closeDialog();
    this.updatestatus();
  };

  openGeneratePDFModal = () => {
    this.setState({ isGeneratePDFModalVisible: true });
  };

  closeGeneratePDFModal = () => {
    this.setState({
      isGeneratePDFModalVisible: false,
      selectedReportType: '',
      selectedYear: '',
      selectedFiscalYear: '',
      selectedQuarter: '',
      isSubmitEnabled: false,
    });
  };

  handleYearChange1 = (newValue: any) => {
    const selectedYear = newValue.key;
    this.setState({
      selectedYear,
      isSubmitEnabled: selectedYear && this.state.selectedReportType === 'Yearly',
    });
  };

  handleSubmit = () => {
    const { selectedReportType, selectedYear, selectedFiscalYear, selectedQuarter } = this.state;
    if (selectedReportType === 'Yearly' && selectedYear) {
      this.generatePDF(selectedYear, 0, 0);
    } else if (selectedReportType === 'Quarterly' && selectedFiscalYear && selectedQuarter) {
      this.generatePDF(0, selectedFiscalYear, selectedQuarter);
    }
    this.closeGeneratePDFModal();
  };

  generatePDF = async (year: any, fiscalYearId: any, quarterId: any) => {
    const apiUrl = `${baseUrl}/api/PdfMerge/PdfMergerByBlob?year=${encodeURIComponent(
      year,
    )}&fiscalyearid=${encodeURIComponent(fiscalYearId)}&quarterid=${encodeURIComponent(quarterId)}`;
    try {
      document.body.classList.add('loading-indicator');
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        responseType: 'blob',
        headers: {},
      });

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'generated-document.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notify.showSuccessNotify('PDF generated successfully.');
        document.body.classList.remove('loading-indicator');
      } else {
        this.notify.showErrorNotify('Failed to generate PDF.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.notify.showErrorNotify('Error generating PDF.');
    }
  };

  handleReportTypeChange = (type: string) => {
    this.setState({
      selectedReportType: type,
      selectedYear: '',
      selectedFiscalYear: '',
      selectedQuarter: '',
      isSubmitEnabled: false,
    });
  };

  handleYearChange = (event: any) => {
    const selectedYear = event.target.value;
    this.setState({
      selectedYear,
      isSubmitEnabled: selectedYear && this.state.selectedReportType === 'Yearly',
    });
  };

  handleFiscalYearChange = (event: any) => {
    const selectedFiscalYear = event.target.value;
    this.setState({
      selectedFiscalYear,
      isSubmitEnabled:
        selectedFiscalYear &&
        this.state.selectedQuarter &&
        this.state.selectedReportType === 'Quarterly',
    });
  };

  handleQuarterChange = (event: any) => {
    const selectedQuarter = event.target.value;
    this.setState({
      selectedQuarter,
      isSubmitEnabled:
        selectedQuarter &&
        this.state.selectedFiscalYear &&
        this.state.selectedReportType === 'Quarterly',
    });
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
      case TemplateStageApprovalEnum.Approved:
        return 'status-approved';
      default:
        return 'status-default';
    }
  };

  handleSelectedRowsChange = (row: any) => {
    this.setState({
      selectedRowData: row.selectedRows,
      queryrow: true,
    });
  };

  navigation1 = (id: any, assessmentGroupId: any) => {
    this.props.history.push(
      `/home/complianceLists/tempalteValueDetails?id=${id}&templateId=${assessmentGroupId}`,
    );
  };

  downloadTemplate = async (assessmentId: number) => {
    try {
      const format = 'xlsx';
      const token = this.token;
      const url = `${baseUrl}/api/Template/FormTemplate?assessmentId=${assessmentId}&format=${format}&token=${token}`;

      await this.apiClient.formTemplate(assessmentId, format);

      const fileName = `template_${assessmentId}.xlsx`;
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

  async onUpload(files: any, templateId: any) {
    var assessId = this.state.selectedassessmentId;
    try {
      if (!files) return;
      var f: any = files[0];
      var fileName = f?.name;
      const uri = (await this.apiClient.getAuthorizedUrlForWrite(fileName || ''))?.result;
      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }
      var uploadData = new UploadedFile();
      uploadData.blobUrl = uri;
      uploadData.name = fileName;
      uploadData.assessmentId = assessId;
      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(f, {
        onProgress: (observer) => {
          var progress = Math.round((observer.loadedBytes / f.size) * 100);
          this.setState({ progressPercent: progress });
        },
        blobHTTPHeaders: {
          blobContentType: f.type,
        },
      });
      const response = await this.apiClient.formUploadAndValidateFile(uploadData);
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

  UploadPicture = async (file: any, templateId: any) => {
    try {
      this.setState({ imageProgress: false });
      console.log(this.state.selectedTemplate);
      this.onUpload(file, templateId);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };

  generateFiscalYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = -5; i <= 5; i++) {
      const year = currentYear + i;
      years.push({
        key: year,
        text: `${year}`,
      });
    }

    return years;
  };

  render() {
    const {
      currentRecord,
      viewData,
      publishStatus,
      isDialogVisible,
      loading,
      requestedByPeriod,
      requestedByName,
      isGeneratePDFModalVisible,
      selectedReportType,
      selectedYear,
      fiscalYear,
      quarterYear,
      isSubmitEnabled,
    } = this.state;
    const { t } = this.props;
    const { isDrawerOpen } = this.state;

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '15%',
      },
      {
        key: 'audit',
        name: <div className={columnHeader}>{t('COL_AUDIT_NAME')}</div>,
        selector: (row: any) => <span title={row.auditName}>{row.auditName}</span>,
        minwidth: '200px',
      },
      {
        key: 'Process',
        name: <div className={columnHeader}>{t('COL_PROCESS_NAME')}</div>,
        selector: (row: any) => <span title={row.processName}>{row.processName}</span>,
        minwidth: '200px',
      },
      {
        key: 'action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        cell: (row: any) =>
          this.state.currentRecord.length > 0 && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                this.handleViewClick(row.processId, row.templateId, row?.auditId);
              }}
              className="view"
            >
              View
            </a>
          ),
        minWidth: '100px',
      },
    ];

    const viewColumns: any = [
      {
        key: 'audit',
        name: <div className={columnHeader}>{t('COL_AUDIT_NAME')}</div>,
        selector: (row: any) => <span title={row.auditName}>{row.auditName}</span>,
        minwidth: '200px',
        width: '12%',
      },
      {
        key: 'roleId',
        name: <div className={columnHeader}>{t('Department')}</div>,
        selector: (row: any) => {
          const name = requestedByName.get(row.roleId);
          return <span title={name}>{name}</span>;
        },
        minwidth: '200px',
        width: '13%',
      },
      {
        key: 'periodId',
        name: <div className={columnHeader}>{t('COL_YEAR_NAME')}</div>,
        selector: (row: any) => {
          const name = requestedByPeriod.get(row.periodId);
          return <span title={name}>{name}</span>;
        },
        minWidth: '200px',
        width: '12%',
      },
      {
        key: 'status',
        name: <div className={columnHeader}>{t('COL_STATUS')}</div>,
        selector: (row: { status: TemplateStageApprovalEnum }) => {
          const statusClass = this.getStatusClass(row.status);
          const statusText = TemplateStageApprovalEnum[row.status] || '-';

          return <div className={`status-label ${statusClass}`}>{statusText}</div>;
        },
        width: '13%',
      },
      {
        key: 'queryStatus',
        name: <div className={columnHeader}>{`${t('QUERY_STATUS')}`}</div>,
        selector: (row: any) => {
          const statusClass = this.getStatusClass(row.querystatus);
          const statusText = TemplateStageApprovalEnum[row.querystatus] || '-';
          return (
            <>
              {this.state.currentRecord.length > 0 ? (
                <div className={`status-label ${statusClass}`}>{statusText}</div>
              ) : null}
            </>
          );
        },
        isVisible: true,
        width: '15%',
      },
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '38%',
        cell: (row: any) => {
          const isSuccess = row.status === TemplateStageApprovalEnum.Success;
          return (
            <div style={{ marginTop: '2px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <DefaultButton
                  styles={PIMButtons112}
                  text={'Audit Data'}
                  onClick={() => {
                    if (row.status === TemplateStageApprovalEnum.Success) {
                      if (row.status === 5) {
                        this.navigation1(row.auditId, row.templateId);
                      }
                    } else {
                      this.setState({
                        selectedTemplate: row.templateId,
                        selectedassessmentId: row.assessmentGroupId,
                        selectedProcess: row.processId,
                        isDrawerOpen: true,
                        selectedStage: { auditId: row?.auditId },
                        disabled:
                          row.status === TemplateStageApprovalEnum.Completed ||
                          row.status === TemplateStageApprovalEnum.Success ||
                          row.status === TemplateStageApprovalEnum.Approved ||
                          row.status === TemplateStageApprovalEnum.Pending,
                      });
                    }
                  }}
                />
                <DefaultButton
                  className="standardbtn"
                  text={'Standard Data'}
                  onClick={() => {
                    this.setState({
                      selectedTemplate: row.templateId,
                      selectedProcess: row.processId,
                      isDrawerOpen: true,
                      selectedStage: { auditId: row?.auditId },
                    });
                  }}
                />
                <DefaultButton
                  styles={PIMButtons112}
                  text="Target Data"
                  onClick={() => {
                    this.setState({
                      selectedTemplate: row.templateId,
                      selectedProcess: row.processId,
                      isDrawerOpen: true,
                      selectedStage: { auditId: row?.auditId },
                    });
                  }}
                />
              </div>
              {!isSuccess && (
                <>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <DefaultButton
                      iconProps={{ iconName: 'Upload' }}
                      className="uploaddownload-button"
                      text={`${t('Upload Template')}`}
                      onClick={() => {
                        this.setState({
                          selectedTemplateId: row.id,
                          selectedTemplate: row,
                          visible: true,
                          name: row,
                        });
                      }}
                    />
                    <DefaultButton
                      className="uploaddownload-button"
                      iconProps={{ iconName: 'Download' }}
                      text="Download Template"
                      onClick={() => this.downloadTemplate(row.assessmentGroupId)}
                    />
                  </div>
                </>
              )}
            </div>
          );
        },
      },
    ];

    const allRowsCompleted = viewData.every(
      (row: any) =>
        row.status === TemplateStageApprovalEnum.Approved ||
        row.status === TemplateStageApprovalEnum.Success ||
        row.status === TemplateStageApprovalEnum.Completed ||
        row.status === TemplateStageApprovalEnum.Expired,
    );

    return (
      <div className="layout width-100">
        {this.state.isView ? (
          <div className="processtemplate">
            <div>
            <Link 
             to={`/metrics/complianceList`} 
             className="headerText"  
             onClick={() => 
              this.setState({ isView: false })
            }
            >
              {t('MENU_METRICS')}/{t('PROCESS_TEMPLATE')}
            </Link>
              <p className='publisherprocess'>{t('PROCESS_TEMPLATE')}</p>
              <div className="publishbutton">
                <div>
                  <DefaultButton
                    className="querybutton"
                    text={`${t('ADDQUERY')}`}
                    onClick={() => this.setState({ A_D_Visible: true })}
                    disabled={this.state.queryrow === false}
                  />
                </div>
                {this.state.viewData?.length > 0 && (
                  <DefaultButton
                    text={publishStatus ? t('GENERATE_PDF') : t('PUBLISH')}
                    disabled={!allRowsCompleted || loading}
                    className="publishButton"
                    // onClick={publishStatus ? this.generatePDF : this.openDialog}
                    onClick={this.state.publishStatus ? this.openGeneratePDFModal : this.openDialog}
                  />
                )}
              </div>
            </div>

            <div>
              <DataTable
                columns={viewColumns}
                data={viewData}
                pagination
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="68.03vh"
                selectableRows
                clearSelectedRows={this.state.clearRows}
                onSelectedRowsChange={this.handleSelectedRowsChange}
                selectableRowDisabled={(row: any): boolean => {
                  return row.status === TemplateStageApprovalEnum.Success;
                }}
              />
            </div>

            <div>
              <Modal
                containerClassName="p-0"
                isOpen={isGeneratePDFModalVisible}
                onDismiss={this.closeGeneratePDFModal}
              >
                <div className="modal-header1">
                  <span>{t('SELECT_REPORT_TYPE')}</span>
                  <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    title="Close"
                    ariaLabel="Close"
                    onClick={this.closeGeneratePDFModal}
                  />
                </div>

                <div className="modal-body1">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <label style={{ marginRight: '20px' }}>
                      <input
                        type="radio"
                        name="reportType"
                        value="Yearly"
                        checked={selectedReportType === 'Yearly'}
                        onChange={() => this.handleReportTypeChange('Yearly')}
                      />
                      {t('YEARLY_REPORT')}
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="reportType"
                        value="Quarterly"
                        checked={selectedReportType === 'Quarterly'}
                        onChange={() => this.handleReportTypeChange('Quarterly')}
                      />
                      {t('QUARTERLY_REPORT')}
                    </label>
                  </div>
                  {selectedReportType === 'Yearly' && (
                    <div>
                      <label>{t('SELECT_YEAR')}:</label>
                      <Dropdown
                        placeholder={t('SELECT_YEAR')}
                        options={this.generateFiscalYearOptions()}
                        selectedKey={this.state.selectedYear}
                        onChange={(_event, option: any) => this.handleYearChange1(option)}
                      />
                    </div>
                  )}
                  {selectedReportType === 'Quarterly' && (
                    <div>
                      <label>{t('SELECT_FISCAL_YEAR')}:</label>
                      <select
                        onChange={this.handleFiscalYearChange}
                        value={this.state.selectedFiscalYear || ''}
                      >
                        <option value="">{t('SELECT_FISCAL_YEAR')}</option>
                        {this.state.fiscalYears.map((fiscalYear: any) => (
                          <option key={fiscalYear.id} value={fiscalYear.id}>
                            {fiscalYear.year}
                          </option>
                        ))}
                      </select>
                      <br />
                      <label>{t('SELECT_QUARTER')}:</label>
                      <select
                        onChange={this.handleQuarterChange}
                        value={this.state.selectedQuarter || ''}
                        className="quarter-dropdown"
                      >
                        <option value="">{t('SELECT_QUARTER')}</option>
                        {this.state.quarters.map((quarter: any) => (
                          <option key={quarter.id} value={quarter.id}>
                            {quarter.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <PrimaryButton
                    text={t('SUBMIT')}
                    className="submitpdf"
                    onClick={() => this.handleSubmit()}
                    disabled={!isSubmitEnabled}
                  />
                </div>
              </Modal>
            </div>
            <div>
              <Modal
                isOpen={this.state.A_D_Visible}
                containerClassName={PIMcontentStyles.container}
                isBlocking={false}
                onDismiss={() => {
                  this.setState({ A_D_Visible: false, clearRows: true }, () => {
                    this.refresh();
                  });
                }}
              >
                <div className={PIMcontentStyles.header}>
                  <Grid container spacing={2}>
                    <Grid item xs={10.5}>
                      <div className="apptext1">
                        <span>{`${t('AddQuery')}`}</span>
                      </div>
                    </Grid>
                    <Grid item xs={1.5}>
                      <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={() => {
                          this.setState({ A_D_Visible: false, clearRows: true }, () => {
                            this.refresh();
                          });
                        }}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className={PIMcontentStyles.body}>
                  <AddorUpdateQuery
                    rowData1={this.state.selectedRowData}
                    kd={viewData}
                    Datakd={this.state.selectedRowData}
                    ClosePopup={() => {
                      this.setState({ A_D_Visible: false, clearRows: true }, () => {
                        this.refresh();
                      });
                    }}
                  />
                </div>
              </Modal>
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
                  templateId={this.state.selectedassessmentId}
                  process={this.state?.selectedProcess}
                  isReadOnly={undefined}
                  roleId={this.publisherId}
                  disabled={this.state.disabled}
                  selectedStage={this.state.selectedStage}
                  onSubmitComplete={() => {}}
                />
              </Drawer>
              <Dialog
                hidden={!isDialogVisible}
                onDismiss={this.closeDialog}
                dialogContentProps={{
                  type: DialogType.normal,
                  title: t('CONFIRM_PUBLISH'),
                  subText: t('Are you sure you want to Publish?'),
                }}
              >
                <DialogFooter>
                  <PrimaryButton onClick={this.confirmApproval} text={t('BTN_CONFIRM')} />
                  <DefaultButton onClick={this.closeDialog} text={t('BTN_CANCEL')} />
                </DialogFooter>
              </Dialog>
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
          </div>
        ) : (
          <div className="bg-Color">
            <Link to={`/activity`} className="headerText">
              {t('MENU_ACTIVITY')}/{t('SUBMENU_PROCESS')}
            </Link>
            <Grid
              item
              container
              spacing={-4}
              direction={'row'}
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack>
                <Text
                  className="color-blue text"
                  key={'xxLarge'}
                  variant={'xxLarge' as ITextProps['variant']}
                  styles={PIMHearderText}
                  nowrap
                  block
                >
                  {t('SUBMENU_PROCESS')}
                </Text>
              </Stack>
              <Grid item lg={2} xs={1}></Grid>
            </Grid>
            <Grid lg={12} item container spacing={1} direction={'row'}>
              <Grid item lg={2} xs={12}>
                <SearchBox
                  className="searchBox"
                  styles={PIMsearchBoxStyles}
                  placeholder={t('SEARCH_PLACEHOLDER')}
                  onChange={(e: any) => this.onSearch(e)}
                  value={this.state.searchKey}
                  onClear={() => this.setState({ searchKey: '' })}
                />
              </Grid>
              <Grid item lg={0.9} xs={6}></Grid>
              <Grid item lg={1.3} xs={6}></Grid>
              <Grid item lg={1.3} xs={6}></Grid>
              <Grid item lg={4.7} />
              <Grid item lg={0.5} xs={1}>
                <Icon
                  iconName="Refresh"
                  title={this.props.t('BTN_REFRESH')}
                  className="iconStyle iconStyle1"
                  onClick={() => {
                    this.refresh();
                    if (this.state.selectedProcess && this.state.selectedTemplate) {
                      this.fetchViewData(
                        this.state.selectedProcess,
                        this.state.selectedTemplate,
                        this.state.selectedassessmentId,
                      );
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Modal
              isOpen={this.state.visible}
              containerClassName={PIMcontentStyles.container}
              isBlocking={false}
              onDismiss={() =>
                this.setState({
                  visible: false,
                })
              }
            >
              <div className={PIMcontentStyles.header}>
                <Grid container spacing={2}>
                  <Grid item xs={10.5}>
                    <p>
                      <span className="apptext1">{`${t('ADD_PROCESS')}`}</span>
                    </p>
                  </Grid>
                  <Grid item xs={1.5}>
                    <IconButton
                      styles={iconButtonStyles}
                      iconProps={cancelIcon}
                      ariaLabel="Close popup modal"
                      onClick={() => {
                        this.setState({
                          visible: false,
                          noSelection: !this.state.noSelection,
                          enableEditButton: false,
                          enableActiveButton: false,
                          selectedRowData: [],
                        });
                      }}
                    />
                  </Grid>
                </Grid>
              </div>
              <div className={PIMcontentStyles.body}>
                <AddorUpdateProcess
                  SelectedUser={this.state.selectedRowData[0]}
                  recordId={this.state.selectedRowData[0]?.id}
                  ClosePopup={() => {
                    this.setState({
                      visible: false,
                      noSelection: !this.state.noSelection,
                      enableEditButton: false,
                      enableActiveButton: false,
                      selectedRowData: [],
                    });
                    this.refresh();
                  }}
                />
              </div>
            </Modal>
            <Card>
              <DataTable
                columns={columns}
                data={currentRecord}
                pagination={true}
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="68.03vh"
                paginationComponentOptions={{ rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}` }}
                paginationPerPage={this.Defaultperpage()}
                paginationRowsPerPageOptions={this.perpage()}
                customStyles={{
                  rows: {
                    style: {
                      minHeight: '40px',
                    },
                  },
                  headCells: {
                    style: {
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                  },
                  cells: {
                    style: {
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                  },
                }}
              />
            </Card>
          </div>
        )}
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(withRouter(Publisher));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
