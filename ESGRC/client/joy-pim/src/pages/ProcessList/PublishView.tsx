import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogFooter, DialogType, Modal } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Drawer, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '@/services/Constants';
import { columnHeader, PIMcontentStyles } from '../PimStyles';
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

class Publish extends React.Component<any, any> {
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
      reports: [],
      selectedReportId: '',
      getReportId: 0
    };
  }

  getAuditIdFromQuery() {
    const { location } = this.props;
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('auditId');
  }

  getIdFromQuery() {
    const { location } = this.props;
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('id');
  }

  async componentDidMount(): Promise<void> {
    const auditId = this.getAuditIdFromQuery();
    if (auditId) {
      await this.fetchViewData(auditId);
    }
    await this.fetchPeriodOptions();
    this.fetchNameOptions();
    await this.fetchQuarters();
    await this.fetchFiscalYears();
    await this.fetchReports();
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

  fetchReports = async () => {
    try {
      const response = await this.apiClient.getPdfMerge();
      if (response?.result) {
        this.setState({ reports: response.result, getReportId: response.result[1]?.id });
      } else {
        this.setState({ reports: [] });
      }
    } catch (error) {
      this.notify.showErrorNotify('Error getting reports');
    }
  };

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };

  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };

  async fetchViewData(auditId: any) {
    try {
      const response: any = await this.apiClient.listPublishresponse(auditId);
      if (response && Array.isArray(response.result)) {
        const allSuccess = response.result.every(
          (item: any) =>
            item.status === TemplateStageApprovalEnum.Success ||
            item.status === TemplateStageApprovalEnum.Expired,
        );
        this.setState({
          viewData: response.result,
          responseData: response.result,
          formData: response.result[0]?.responsejson,
          publishStatus: allSuccess,
        });

        console.log('Form Data:', this.state.formData);
      }
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
  }

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
        await this.fetchViewData(auditIdList[0]);
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

  generatexml = () => {
    const id = this.getIdFromQuery();
    const auditid = this.getAuditIdFromQuery();
    debugger
    if (id && auditid) {
      this.downloadXmlTemplate(id, auditid);
    } else {
      console.error('Error: ID or AuditID is missing from the URL.');
    }
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

  handleReportChange = (event: any) => {
    const selectedReportId = event.target.value;
    this.setState({
      selectedReportId,
      isSubmitEnabled: this.isSubmitEnabled(selectedReportId),
    });
  };

  isSubmitEnabled = (selectedReportId: any) => {
    const { selectedReportType, selectedYear, selectedFiscalYear, selectedQuarter } = this.state;
    if (selectedReportType === 'Yearly') {
      return selectedReportId && selectedYear;
    } else if (selectedReportType === 'Quarterly') {
      return selectedReportId && selectedFiscalYear && selectedQuarter;
    }
    return false;
  };

  handleSubmit = () => {
    const {
      selectedReportType,
      selectedYear,
      selectedFiscalYear,
      selectedQuarter,
      selectedReportId,
    } = this.state;
    if (selectedReportType === 'Yearly' && selectedYear) {
      // this.generatePDF(selectedYear, 0, 0, selectedReportId);
    } else if (
      selectedReportType === 'Quarterly' &&
      selectedFiscalYear &&
      selectedQuarter &&
      selectedReportId
    ) {
      // this.generatePDF(0, selectedFiscalYear, selectedQuarter, selectedReportId);
    }
    this.closeGeneratePDFModal();
  };

  // generatePDF = async (year: any, fiscalYearId: any, quarterId: any, reportId: any) => {
  //const apiUrl = `${baseUrl}/api/PdfMerge/PdfMergerByBlob?year=${encodeURIComponent(
  //     year,
  //   )}&fiscalyearid=${encodeURIComponent(fiscalYearId)}&quarterid=${encodeURIComponent(
  //     quarterId,
  //   )}&reportid=${encodeURIComponent(reportId)}`;
  //   try {
  //     document.body.classList.add('loading-indicator');
  //     const response = await axios({
  //       method: 'GET',
  //       url: apiUrl,
  //       responseType: 'blob',
  //       headers: {},
  //     });

  //     if (response.status === 200) {
  //       const url = window.URL.createObjectURL(new Blob([response.data]));
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.setAttribute('download', 'generated-document.pdf');
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       this.notify.showSuccessNotify('PDF generated successfully.');
  //       document.body.classList.remove('loading-indicator');
  //     } else {
  //       this.notify.showErrorNotify('Failed to generate PDF.');
  //     }
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     this.notify.showErrorNotify('Error generating PDF.');
  //   }
  // };
  //   generateNewPDF = async (getReportId: any, metricGroupIds: any[]) => {

  //     // Construct the API URL dynamically with all metricGroupIds
  //     const metricGroupParams = metricGroupIds.map(id => `metricGroupId=${id}`).join('&');
  //     //const apiUrl = `/api/PdfMerge/PdfGHIReport?reportid=${getReportId}&${metricGroupParams}`;
  //     const apiUrl = `/api/PdfMerge/PdfGHIReport?reportid=${getReportId}&metricGroupId=146&metricGroupId=147&metricGroupId=148&metricGroupId=149`;


  //     try {
  //         document.body.classList.add('loading-indicator');
  //         const response = await axios({
  //             method: 'GET',
  //             url: apiUrl,
  //             responseType: 'blob',
  //             headers: {},
  //         });

  //         if (response.status === 200) {
  //             const url = window.URL.createObjectURL(new Blob([response.data]));
  //             const link = document.createElement('a');
  //             link.href = url;
  //             link.setAttribute('download', 'generated-document.pdf');
  //             document.body.appendChild(link);
  //             link.click();
  //             document.body.removeChild(link);
  //             this.notify.showSuccessNotify('PDF generated successfully.');
  //         } else {
  //             this.notify.showErrorNotify('Failed to generate PDF.');
  //         }
  //     } catch (error) {
  //         console.error('Error generating PDF:', error);
  //         this.notify.showErrorNotify('Error generating PDF.');
  //     } finally {
  //         document.body.classList.remove('loading-indicator');
  //     }
  // };
  generateNewPDF = async () => {
    const reportId = this.state?.getReportId;
    const apiUrl = `${baseUrl}/api/PdfMerge/PdfGHIReport?reportid=${reportId}`;

    try {
      document.body.classList.add('loading-indicator');

      const response = await axios({
        method: 'GET',
        url: apiUrl,
        responseType: 'blob', // Expect a binary response (PDF)
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (response.status === 200) {
        // Ensure response is a valid PDF
        if (response.headers['content-type'] !== 'application/pdf') {
          console.error("Unexpected response:", await response.data.text());
          this.notify.showErrorNotify('Error: API did not return a valid PDF.');
          return;
        }

        // Process and download the PDF
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'GHI.pdf'); // Use filename from response
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.notify.showSuccessNotify('PDF generated successfully.');
      } else {
        this.notify.showErrorNotify('Failed to generate PDF.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.notify.showErrorNotify('Error generating PDF.');
    } finally {
      document.body.classList.remove('loading-indicator');
    }
  };


  handleReportTypeChange = (type: string) => {
    this.setState({
      selectedReportType: type,
      selectedYear: '',
      selectedFiscalYear: '',
      selectedQuarter: '',
      selectedReportId: '',
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
        this.state.selectedReportType === 'Quarterly' &&
        this.state.selectedReportId,
    });
  };

  handleQuarterChange = (event: any) => {
    const selectedQuarter = event.target.value;
    this.setState({
      selectedQuarter,
      isSubmitEnabled:
        selectedQuarter &&
        this.state.selectedFiscalYear &&
        this.state.selectedReportType === 'Quarterly' &&
        this.state.selectedReportId,
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
      queryrow: row.selectedRows.length > 0,
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

  downloadXmlTemplate = async (id: any, auditid: any) => {
    debugger
    try {
      const format = 'xml';
      const token = this.token;
      const url = `${baseUrl}/api/Process/UpdateXML?templateStageId=${id}&auditId=${auditid}&format=${format}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/xml',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download XML template: ${response.status} ${response.statusText}`,
        );
      }

      const blob = await response.blob();
      const fileName = `XmlData.xml`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Error downloading XML template:', error);
    }
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
      isSubmitEnabled,
    } = this.state;
    const { t } = this.props;
    const { isDrawerOpen } = this.state;

    const viewColumns: any = [
      {
        key: 'audit',
        name: <div className={columnHeader}>{t('COL_AUDIT_NAME')}</div>,
        selector: (row: any) => <span title={row.auditName}>{row.auditName}</span>,
        // minwidth: '200px',
        width: '20%',
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
              {this.state.viewData.length > 0 ? (
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
        width: '30%',
        cell: (row: any) => {
          const isSuccess = row.status === TemplateStageApprovalEnum.Success;
          return (
            <div>
              <div>
                <DefaultButton
                  className="audit-publish"
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
                {/* <DefaultButton
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
                /> */}
              </div>
              {/* {!isSuccess && (
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
              )} */}
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
        <div className="processtemplate">
          <div>
            <Link to={`/metrics`} className="headerText">
              {t('MENU_METRICS')}/{t('PROCESS_TEMPLATE')}
            </Link>
            <p className="publisherprocess">{t('PROCESS_TEMPLATE')}</p>
            <div className="publishbutton">
              <div>
                <DefaultButton
                  className={`querybutton ${this.state.queryrow ? 'querybutton-enabled' : 'querybutton-disabled'
                    }`}
                  text={`${t('ADDQUERY')}`}
                  onClick={() => this.setState({ A_D_Visible: true })}
                  disabled={!this.state.queryrow}
                />
              </div>

              <DefaultButton
                text={publishStatus ? t('GENERATE_PDF') : t('PUBLISH')}
                disabled={!allRowsCompleted || loading}
                className="publishButton"
                // onClick={publishStatus ? this.generatePDF : this.openDialog}
                //onClick={this.state.publishStatus ? this.generateNewPDF(this.state?.reportId,[146, 147, 148, 149]) : this.openDialog}
                onClick={publishStatus ? () => this.generateNewPDF() : this.openDialog}
              />

              {/* <DefaultButton
                // text={ t('GENERATE_XML') }
                disabled={!allRowsCompleted  || loading}
                className="publishButton"
               onClick={this.generatexml}
              /> */}
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
              isOpen={isGeneratePDFModalVisible}
              onDismiss={this.closeGeneratePDFModal}
              containerClassName={PIMcontentStyles.container}
              isBlocking={false}
            >
              <div className={PIMcontentStyles.header}>
                <Grid container spacing={2}>
                  <Grid item xs={10.5}>
                    <div className="apptext1">{`${t('SELECT_REPORT_TYPE')}`}</div>
                  </Grid>
                  <Grid item xs={1.5}>
                    <IconButton
                      styles={iconButtonStyles}
                      iconProps={cancelIcon}
                      ariaLabel="Close popup modal"
                      onClick={this.closeGeneratePDFModal}
                    />
                  </Grid>
                </Grid>
              </div>
              <div className="modal-body1">
                <div className="pdfdiv">
                  <label style={{ marginLeft: '-20px' }}>
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

                    <select
                      placeholder={t('SELECT_YEAR')}
                      value={this.state.selectedYear}
                      onChange={(_event) => this.handleYearChange1({ key: _event.target.value })}
                      className="year-dropdown"
                    >
                      <option value="">{t('SELECT_YEAR')}</option>
                      {this.generateFiscalYearOptions().map((option: any) => (
                        <option key={option.key} value={option.key}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                    <br />
                    <label>{t('SELECT_REPORT')}:</label>
                    <select
                      onChange={this.handleReportChange}
                      value={this.state.selectedReportId || ''}
                    >
                      <option value="">{t('SELECT_REPORT')}</option>
                      {this.state.reports.map((report: any) => (
                        <option key={report.id} value={report.id}>
                          {report.name}
                        </option>
                      ))}
                    </select>
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
                    <br />
                    <label>{t('SELECT_REPORT')}:</label>
                    <select
                      onChange={this.handleReportChange}
                      value={this.state.selectedReportId || ''}
                      className="report-dropdown"
                    >
                      <option value="">{t('SELECT_REPORT')}</option>
                      {this.state.reports.map((report: any) => (
                        <option key={report.id} value={report.id}>
                          {report.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ marginLeft: '-10vh' }}>
                  <PrimaryButton
                    text={t('Submit')}
                    className="submitpdf"
                    onClick={() => this.handleSubmit()}
                    disabled={!isSubmitEnabled}
                  />
                </div>
              </div>
            </Modal>
          </div>
          <div>
            <Modal
              isOpen={this.state.A_D_Visible}
              containerClassName={PIMcontentStyles.container}
              isBlocking={false}
              onDismiss={() => {
                this.setState({ A_D_Visible: false, clearRows: true }, () => { });
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
                        this.setState({ A_D_Visible: false, clearRows: true }, () => { });
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
                    this.setState({ A_D_Visible: false, clearRows: true }, () => { });
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
                templateId={this.state.selectedTemplate}
                process={this.state?.selectedProcess}
                isReadOnly={undefined}
                roleId={this.publisherId}
                disabled={this.state.disabled}
                selectedStage={this.state.selectedStage}
                onSubmitComplete={() => { }}
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
                <PrimaryButton
                  onClick={() => {
                    // const id = this.getIdFromQuery();
                    // const auditid = this.getAuditIdFromQuery();

                    // if (id && auditid) {
                    //   this.confirmApproval();
                    //   // this.downloadXmlTemplate(id, auditid);
                    // } else {
                    //   console.error('Error: ID or AuditID is missing from the URL.');
                    // }
                    this.confirmApproval();
                  }}
                  text={t('BTN_CONFIRM')}
                />
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
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(withRouter(Publish));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
