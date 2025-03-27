import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { IconButton} from '@fluentui/react/lib/Button';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { Icon, Modal, Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
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
import { withRouter } from 'react-router-dom';
import { IFiscalYear, IQuatter, UploadedFile } from '@/services/ApiClient';


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
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
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

  render() {
    const {currentRecord } = this.state;
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
        cell: (row: any) => (
          <Link
            to={`/home/complianceLists/Publish?id=${row.templateStageId}&auditId=${row.auditId}`} 
          >
            View
          </Link>
        ),
        minWidth: '100px',
      },
    ];

    return (
      <div className="layout width-100">
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
