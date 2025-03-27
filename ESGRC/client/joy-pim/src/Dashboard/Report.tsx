import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { Dialog, DialogFooter, DialogType, Icon, Modal, SearchBox, Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Card, Drawer, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '@/services/Constants';
import { TemplateStageApprovalEnum } from '@/pages/enumCommon';
import { columnHeader, PIMButtons112, PIMHearderText, PIMsearchBoxStyles } from '@/pages/PimStyles';
import AuthManagerService from '@/services/AuthManagerService';
import MetricSurveyForm from '@/pages/SurveyPages/MetricSurveyForms';

interface stateInterFace {
  productDetails: any[];
  isView: boolean | undefined;
  detailedData: any[];
  viewData: any[];
  isDrawerOpen: boolean;
  formData: any;
  searchKey: string;
  selectedTemplate: any;
  selectedProcess: any;
  responseData: any[];
  disabled: boolean | undefined;
  publishStatus: boolean | undefined;
  isDialogVisible: false;
  processList: any[];
}

class Report extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  isAuthenticated = this.authManager.isAuthenticated();
  // user = this.isAuthenticated ? this.authManager.getUserData() : null;
  //publisherId: any = this.user?.roleId?.[0] || [];

  notify = new NotificationManager();
  //roleId: any = this.user?.roleId?.[0] || [];
  baseUrl: any;
  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      inActivePage: false,
      rolevisible: false,
      copyRecord: [],
      searchKey: '',
      selectedRoleIds: [],
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      isDrawerOpen: false,
      isView: false,
      productDetails: [],
      selectedTemplate: null,
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
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }
  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true });
      const apiResponse1: any = (await this.apiClient.listAuditResponse()).result;
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
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  generatePDF = async () => {
    const apiUrl = `${baseUrl}/api/PdfMerge/PdfMergerByBlob`;
    // this.setState({ loading: true });
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
    //finally {
    //   this.setState({ loading: false });
    // }
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

  render() {
    const {
      currentRecord,
      viewData,
      formData,
      publishStatus,
      isDialogVisible,
      auditList,
      loading,
    } = this.state;
    const { t, history } = this.props;
    const { productDetails, isDrawerOpen } = this.state;
    const { isView } = this.state;

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'audit',
        name: <div className={columnHeader}>{t('COL_AUDIT_NAME')}</div>,
        selector: (row: any) => <span title={row.auditName}>{row.auditName}</span>,
        width: '15%',
      },
      {
        key: 'Process',
        name: <div className={columnHeader}>{t('COL_PROCESS_NAME')}</div>,
        selector: (row: any) => <span title={row.processName}>{row.processName}</span>,
        width: '20%',
      },
      // {
      //   key: 'complianceName',
      //   name: <div className={columnHeader}>{t('SUBMENU_COMPLIANCE')}</div>,
      //   selector: (row: any) => <span title={row.complianceName}>{row.complianceName}</span>,
      //   minwidth: '200px',
      // },
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
        width: '10%',
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
        key: 'Process',
        name: <div className={columnHeader}>{t('COL_PROCESS_NAME')}</div>,
        selector: (row: any) => <span title={row.processName}>{row.processName}</span>,
        minwidth: '200px',
        width: '16%',
      },
      // {
      //   key: 'complianceName',
      //   name: <div className={columnHeader}>{t('COL_COMPLIANCE_NAME')}</div>,
      //   selector: (row: any) => row.compliancename,
      // },
      {
        key: 'status',
        name: <div className={columnHeader}>{t('COL_STATUS')}</div>,
        selector: (row: { status: TemplateStageApprovalEnum }) => {
          const statusClass = this.getStatusClass(row.status);
          const statusText = TemplateStageApprovalEnum[row.status] || '-';

          return <div className={`status-label ${statusClass}`}>{statusText}</div>;
        },
        width: '12%',
      },
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '33%',
        cell: (row: any) => {
          return (
            <div style={{ display: 'flex', gap: '10px' }}>
              <DefaultButton
                styles={PIMButtons112}
                text={'Audit Data'}
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
          );
        },
      },
    ];

    const allRowsCompleted = viewData.every(
      (row: any) =>
        row.status === TemplateStageApprovalEnum.Approved ||
        row.status === TemplateStageApprovalEnum.Success ||
        row.status === TemplateStageApprovalEnum.Completed,
    );

    return (
      <div className="layout width-100">
        {this.state.isView ? (
          <div className="processtemplate">
            <div>
              <p>{t('PROCESS_TEMPLATE')}</p>
              <div className="publishbutton">
                {this.state.viewData?.length > 0 && (
                  <DefaultButton
                    text={t('GENERATE_PDF')}
                    disabled={!allRowsCompleted || loading}
                    className="publishButton"
                    onClick={this.generatePDF}
                  />
                )}
              </div>
            </div>

            {/* <MetricSurveyForm
              template={this.state?.selectedTemplate}
              process={this.state?.selectedProcess}
              isReadOnly={undefined}
              roleId={this.publisherId}
              disabled={false}
              selectedStage={this.state.selectedStage}
              onSubmitComplete={() => {}}
            /> */}

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
                clearSelectedRows={true}
                onSelectedRowsChange={this.handleSelectedRowsChange}
                // selectableRowDisabled={(row: any): boolean => {
                //   return row.status === TemplateStageApprovalEnum.Success;
                // }}
              />
            </div>
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
                  onClick={() => this.refresh()}
                />
              </Grid>
            </Grid>
            <Card>
              {this.state.currentRecord?.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={this.state.currentRecord}
                  pagination={true}
                  selectableRowsHighlight
                  highlightOnHover
                  responsive
                  fixedHeader
                  striped
                  fixedHeaderScrollHeight="68.03vh"
                  paginationComponentOptions={{
                    rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}`,
                  }}
                  paginationPerPage={this.Defaultperpage()}
                  paginationRowsPerPageOptions={this.perpage()}
                  noDataComponent={
                    <div className="noDataWidth">
                      <DataTable columns={columns} data={[{ '': '' }]} />
                      <Stack className="noRecordsWidth">
                        {this.state.isRecord
                          ? `${this.props.t('RECORDS')}`
                          : `${this.props.t('NO_RECORDS')}`}
                      </Stack>
                    </div>
                  }
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
              ) : (
                <div className="noDataWidth">
                  <DataTable columns={columns} data={[{ '': '' }]} />
                  <Stack className="noRecordsWidth">
                    {this.state.isRecord
                      ? `${this.props.t('RECORDS')}`
                      : `${this.props.t('NO_RECORDS')}`}
                  </Stack>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(Report);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
