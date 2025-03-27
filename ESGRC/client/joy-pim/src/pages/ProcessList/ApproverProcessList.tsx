import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogFooter, DialogType, Icon, Modal, Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Drawer, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '@/services/Constants';
import { columnHeader, PIMButtons112, PIMcontentStyles } from '../PimStyles';
import MetricSurveyForm from '../SurveyPages/MetricSurveyForms';
import AuthManagerService from '@/services/AuthManagerService';
import { TemplateStageApprovalEnum } from '../enumCommon';
import { ITemplateStagesDto, TemplateStagesDtoListApiResponse } from '@/services/ApiClient';
import AddorUpdateQuery from '../Compliance/AddorUpdateQuery';
import RaiseIssuse from '../Compliance/RaiseIssuse';

interface stateInterFace {
  productDetails: any[];
  isView: boolean | undefined;
  detailedData: any[];
  viewData: any[];
  isDrawerOpen: boolean;
  formData: any;
  searchKey: string;
  selectedTemplate: any;
  selectedAssessmentId: any;
  selectedProcess: any;
  responseData: any[];
  disabled: boolean | undefined;
  publishStatus: boolean | undefined;
  isDialogVisible: false;
  requestedByName: any;
  raiseissuse: false;
  noSelection: false;
}

class ApproverProcessList extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  isAuthenticated = this.authManager.isAuthenticated();
  user = this.isAuthenticated ? this.authManager.getUserData() : null;
  approverId: any = this.user?.roleId?.[0] || [];
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
      selectedAssessmentId: null,
      selectedProcess: null,
      viewData: [],
      formData: null,
      responseData: [],
      disabled: false,
      publishStatus: false,
      queryrow: false,
      A_D_Visible: false,
      isDialogVisible: false,
      selectedStage: null,
      requestedByPeriod: new Map<number, string>(),
      requestedByName: new Map<number, string>(),
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
    await this.fetchPeriodOptions();
    await this.fetchNameOptions();
  }

  async refresh(): Promise<void> {
    try {
      this.setState({ searchKey: '', isRecord: true, noSelection: false });
      const response: TemplateStagesDtoListApiResponse = await this.apiClient.auditApprove();
      if (response && Array.isArray(response.result)) {
        const allSuccess = response.result.every(
          (item: ITemplateStagesDto) => item.status === TemplateStageApprovalEnum.Success,
        );
        this.setState({
          viewData: response.result.map((e) => {
            delete e.id;
            return e;
          }),
          responseData: response.result,
          formData: response.result.find(
            (item: ITemplateStagesDto) => item.processId === this.state.selectedProcess,
          )?.responseJson,
          publishStatus: allSuccess,
          currentRecord: response.result.map((item: ITemplateStagesDto, index: number) => ({
            index: index + 1,
            ...item,
          })),
          copyRecord: response.result.map((item: ITemplateStagesDto, index: number) => ({
            index: index + 1,
            ...item,
          })),
          noSelection: !this.state.noSelection,
          enableEditButton: false,
          enableActiveButton: false,
          selectedRowData: [],
          isRecord: false,
        });

        console.log('Form Data:', this.state.formData);
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
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
      return element?.processName
        ?.toLowerCase()
        .includes(newValue.trim().split(/ +/).join(' ').toLowerCase());
    });
    this.setState({
      currentRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  updatestatus = async () => {
    const { responseData } = this.state;
    if (!responseData || !Array.isArray(responseData)) {
      return;
    }
    const templateStageIdList: number[] = [];
    const auditIdList: number[] = [];
    responseData.forEach((item: any) => {
      if (item.status === 1) {
        templateStageIdList.push(item.templateStageId);
        auditIdList.push(item.auditId);
      }
    });

    if (templateStageIdList.length > 0 && auditIdList.length > 0) {
      try {
        const apiResponse = await this.apiClient.updateApprovalStatus(
          templateStageIdList,
          auditIdList,
        );
        this.notify.showSuccessNotify('Approved successfully');
        console.log('API Response:', apiResponse);
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
  raiseopenDialog = () => {
    this.setState({ raiseissuse: true });
  };

  generatePDF = async () => {
    const apiUrl = `${baseUrl}/api/PdfMerge/PdfMergerByBlob`;
    try {
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
        this.notify.showSuccessNotify(' success.');
      } else {
        this.notify.showErrorNotify('Failed.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.notify.showErrorNotify('Error generating PDF.');
    }
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
    const rowSelected = row.selectedRows && row.selectedRows.length > 0;
    this.setState({
      selectedRowData: row.selectedRows,
      queryrow: rowSelected,
    });
  };

  navigation1 = (id: any, selectedAssessmentId: any) => {
    this.props.history.push(
      `/home/complianceLists/tempalteValueDetails?id=${id}&templateId=${selectedAssessmentId}`,
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

  render() {
    const { viewData, isDialogVisible, requestedByPeriod, requestedByName } = this.state;
    const { t } = this.props;
    const { isDrawerOpen } = this.state;

    const viewColumns: any = [
      {
        key: 'audit',
        name: <div className={columnHeader}>{t('COL_AUDIT_NAME')}</div>,
        selector: (row: any) => {
          const isEndDateToday =
            new Date(row.endDate).toDateString() === new Date().toDateString();
          const style = isEndDateToday ? { color: 'red' } : {};
          const hoverMessage = isEndDateToday
            ? 'Issue end date will expire today'
            : row.auditName;
          return (
            <span title={hoverMessage} style={style}>
              {row.auditName}
            </span>
          );
        },
        minwidth: '200px',
      },
      {
        key: 'roleId',
        name: <div className={columnHeader}>{t('Department')}</div>,
        selector: (row: any) => {
          const name = requestedByName.get(row.roleId);
          return <span title={name}>{name}</span>;
        },
      },
      {
        key: 'periodId',
        name: <div className={columnHeader}>{t('COL_YEAR_NAME')}</div>,
        selector: (row: any) => {
          const name = requestedByPeriod.get(row.periodId);
          return <span title={name}>{name}</span>;
        },
        minWidth: '200px',
        width: '19%',
      },
      {
        key: 'status',
        name: <div className={columnHeader}>{t('COL_STATUS')}</div>,
        selector: (row: { status: TemplateStageApprovalEnum }) => {
          const statusClass = this.getStatusClass(row.status);
          const statusText = TemplateStageApprovalEnum[row.status] || '-';

          return <div className={`status-label ${statusClass}`}>{statusText}</div>;
        },
      },
      {
        key: 'IssueStatus',
        name: <div className={columnHeader}>{t('COL_ISSUE_STATUS')}</div>,
        selector: (row: any) => {
          const statusClass = this.getStatusClass(row.issueStatus);
          const displayValue = row.issueStatus?.trim() ? row.issueStatus : '--';
          return <div className={`status-label ${statusClass}`}>{displayValue}</div>;
        },
        width: '12%',
      },      
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        cell: (row: any) => {
          return (
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
                    selectedAssessmentId: row.assessmentGroupId,
                    selectedProcess: row.processId,
                    isDrawerOpen: true,
                    selectedStage: row,
                    disabled:
                      row.status === TemplateStageApprovalEnum.Completed ||
                      row.status === TemplateStageApprovalEnum.Success ||
                      row.status === TemplateStageApprovalEnum.Approved ||
                      row.status === TemplateStageApprovalEnum.Pending,
                  });
                }
              }}
            />
          );
        },
      },
    ];

    const allRowsCompleted = viewData.some(
      (row: any) => row.status === TemplateStageApprovalEnum.Completed,
    );

    return (
      <div className="layout width-100">
        <div className="processtemplate">
          <div>
            <p>{t('PROCESS_TEMPLATE')}</p>
            <div className="publishbutton">
              <>
                <DefaultButton
                  text={t('RAISE_ISSUSE')}
                  disabled={!this.state.queryrow}
                  className="publishButton"
                  onClick={this.raiseopenDialog}
                />
              </>
              <>
                {this.state.viewData?.length > 0 && (
                  <DefaultButton
                    text={t('APPROVE')}
                    disabled={!allRowsCompleted}
                    className="publishButton"
                    onClick={this.openDialog}
                  />
                )}
              </>
            </div>
          </div>

          <div>
            <DataTable
              columns={viewColumns}
              data={viewData}
              pagination
              selectableRowsHighlight
              selectableRows
              clearSelectedRows={this.state.noSelection}
              onSelectedRowsChange={this.handleSelectedRowsChange}
              selectableRowDisabled={(row: any): boolean => {
                return row.status !== TemplateStageApprovalEnum.Completed;
              }}
              highlightOnHover
              responsive
              fixedHeader
              striped
              fixedHeaderScrollHeight="68.03vh"
            />
          </div>
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
              templateId={this.state?.selectedTemplate}
              process={this.state?.selectedProcess}
              isReadOnly={undefined}
              roleId={this.approverId}
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
              title: t('CONFIRM_APPROVAL'),
              subText: t('Are you sure you want to Approve?'),
            }}
          >
            <DialogFooter>
              <PrimaryButton onClick={this.confirmApproval} text={t('BTN_CONFIRM')} />
              <DefaultButton onClick={this.closeDialog} text={t('BTN_CANCEL')} />
            </DialogFooter>
          </Dialog>
        </div>
        <Modal
          isOpen={this.state.A_D_Visible}
          containerClassName={PIMcontentStyles.container}
          isBlocking={false}
          onDismiss={() => {
            this.setState({ A_D_Visible: false }, () => {
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
                    this.setState({ A_D_Visible: false }, () => {
                      this.refresh();
                    });
                  }}
                />
              </Grid>
            </Grid>
          </div>
          <div className={PIMcontentStyles.body}>
            <AddorUpdateQuery
              kd={viewData}
              Datakd={viewData}
              ClosePopup={() => {
                this.setState({ A_D_Visible: false }, () => {
                  this.refresh();
                });
              }}
              rowData1={[]}
            />
          </div>
        </Modal>

        <Modal
          isOpen={this.state.raiseissuse}
          containerClassName={PIMcontentStyles.container}
          isBlocking={false}
          onDismiss={() => {
            this.setState({ raiseissuse: false }, () => {
              this.refresh();
            });
          }}
        >
          <div className={PIMcontentStyles.header}>
            <Grid container spacing={2}>
              <Grid item xs={10.5}>
                <div className="apptext1">
                  <span>{`${t('RAISE_ISSUSE')}`}</span>
                </div>
              </Grid>
              <Grid item xs={1.5}>
                <IconButton
                  styles={iconButtonStyles}
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={() => {
                    this.setState({ 
                      raiseissuse: false,
                      selectedRowData: [],
                      queryrow: false, 
                    }, () => {
                      this.refresh();
                    });
                  }}
                />
              </Grid>
            </Grid>
          </div>
          <div className={PIMcontentStyles.body}>
            <RaiseIssuse
              ApproveslectedData={this.state.selectedRowData}
              ClosePopup={() => {
                this.setState({ raiseissuse: false }, () => {
                  this.refresh();
                });
              }}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(withRouter(ApproverProcessList));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
