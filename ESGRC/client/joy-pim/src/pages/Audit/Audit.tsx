import React, { Suspense } from 'react';
import { Icon, Modal, Stack } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import {
  AddButton,
  columnHeader,
  hyperlink,
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '@/pages/PimStyles';
import AddorUpdateAudit from './AddorUpdateAudit';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { Link } from 'react-router-dom';

class Audit extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      inActivePage: false,
      copyRecord: [],
      searchKey: '',
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      auditingProcessMap: new Map<number, string>(),
      requestedByMap: new Map<number, string>(),
      requestedByPeriod: new Map<number, string>(),
    };
  }

  // async componentDidMount(): Promise<void> {
  //   await this.fetchAuditingProcesses();
  //   await this.fetchRequestedByOptions();
  //   await this.fetchPeriodOptions();
  //   this.refresh();
  // }

  // async refresh() {
  //   try {
  //     this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
  //     const apiResponse = await this.apiClient.getAllAudit();
  //     console.log('API Response:', apiResponse);
  //     const result = apiResponse?.result || [];
  //     this.setState({
  //       currentRecord: result.map((item: any, index: any) => ({
  //         index: index + 1,
  //         ...item,
  //       })),
  //       copyRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
  //     });
  //   } catch (e: any) {
  //     console.error('Error fetching audit data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   } finally {
  //     this.setState({
  //       isRecord: false,
  //       noSelection: !this.state.noSelection,
  //       enableEditButton: false,
  //       enableActiveButton: false,
  //       selectedRowData: [],
  //     });
  //   }
  // }

  // async fetchAuditingProcesses() {
  //   try {
  //     const response = await this.apiClient.getProcessList();
  //     if (!response?.result) {
  //       throw new Error('No result from API');
  //     }
  //     const auditingProcessMap = new Map<number, string>(
  //       response.result.map((e: any) => [e.id, e.name]),
  //     );
  //     this.setState({ auditingProcessMap });
  //   } catch (error) {
  //     this.notify.showErrorNotify('Error getting processes');
  //   }
  // }

  // async fetchRequestedByOptions() {
  //   try {
  //     const response = await this.apiClient.activeUsers();
  //     if (!response?.result) {
  //       throw new Error('No result from the API');
  //     }
  //     const requestedByMap = new Map<number, string>(
  //       response.result.map((e: any) => [e.id, e.name]),
  //     );
  //     this.setState({ requestedByMap });
  //   } catch (error) {
  //     this.notify.showErrorNotify('Error getting users');
  //   }
  // }

  // async fetchPeriodOptions() {
  //   try {
  //     const response = await this.apiClient.getAllPeriod();
  //     if (!response?.result) {
  //       throw new Error('No result from the API');
  //     }
  //     const requestedByPeriod = new Map<number, string>(
  //       response.result.map((e: any) => [e.id, e.yearName]),
  //     );
  //     this.setState({ requestedByPeriod });
  //   } catch (error) {
  //     this.notify.showErrorNotify('Error getting years');
  //   }
  // }

  async componentDidMount(): Promise<void> {
    await this.refresh(); // This now fetches all data in parallel
  }

async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
  
      // Fetch all required data in parallel
      const [auditResponse, processResponse, usersResponse, periodResponse] = await Promise.all([
        this.apiClient.getAllAudit(),
        this.apiClient.getProcessList(),
        this.apiClient.activeUsers(),
        this.apiClient.getAllPeriod(),
      ]);
  
      console.log('API Response:', auditResponse);
  
      // Ensure all responses have a valid result
      const auditData = auditResponse?.result || [];
      const processData = processResponse?.result || [];
      const usersData = usersResponse?.result || [];
      const periodData = periodResponse?.result || [];
  
      // Process maps
      const auditingProcessMap = new Map<number, string>(
        processData.map((e: any) => [e.id, e.name])
      );
  
      const requestedByMap = new Map<number, string>(
        usersData.map((e: any) => [e.id, e.name])
      );
  
      const requestedByPeriod = new Map<number, string>(
        periodData.map((e: any) => [e.id, e.yearName])
      );
  
      // Process audit records
      const updatedRecords = auditData.map((item: any, index: number) => ({
        index: index + 1,
        ...item,
      }));
  
      // Update state in a single batch to reduce re-renders
      this.setState({
        currentRecord: updatedRecords,
        copyRecord: updatedRecords,
        auditingProcessMap,
        requestedByMap,
        requestedByPeriod,
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      this.notify.showErrorNotify(error.message);
    } finally {
      this.setState({
        isRecord: false,
        noSelection: !this.state.noSelection,
        enableEditButton: false,
        enableActiveButton: false,
        selectedRowData: [],
      });
    }
  }  


  onSearch(e: any) {
    var newValue = e?.target.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;
    console.log(copyRecord, 'aaa');
    const results = copyRecord.filter((element: any) => {
      const name = element?.name?.toLowerCase() || '';
      return name.includes(newValue);
    });

    this.setState({
      currentRecord: results.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  handleRowClick = (row: any) => {
    this.setState({
      visible: true,
      selectedRowData: [row],
    });
  };

  render() {
    const { currentRecord, auditingProcessMap, requestedByMap, requestedByPeriod } = this.state;
    const { t } = this.props;

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '7%',
      },
      {
        key: 'name',
        name: <div className={columnHeader}>{t('COL_NAME')}</div>,
        selector: (row: any) => <span title={row.name}>{row.name}</span>,
        cell: (row: any) => (
          <span className={hyperlink} onClick={() => this.handleRowClick(row)} title={row.name}>
            {row.name}
          </span>
        ),
        sortable: true,
        sortFunction: (a: any, b: any) => a?.name?.localeCompare(b?.name),
        width: '14%',
      },
      {
        key: 'startdate',
        name: <div className={columnHeader}>{t('COL_START_DATE')}</div>,
        selector: (row: any) => {
          const formattedDate =
            row.startdate && row.startdate !== '0001-01-01T00:00:00+00:00'
              ? new Date(row.startdate).toLocaleDateString('en-GB')
              : '';
          return <span title={formattedDate}>{formattedDate}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) =>
          new Date(a.startdate).getTime() - new Date(b.startdate).getTime(),
        width: '12%',
      },
      {
        key: 'enddate',
        name: <div className={columnHeader}>{t('COL_END_DATE')}</div>,
        selector: (row: any) => {
          const formattedDate =
            row.enddate && row.enddate !== '0001-01-01T00:00:00+00:00'
              ? new Date(row.enddate).toLocaleDateString('en-GB')
              : '';
          return <span title={formattedDate}>{formattedDate}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) =>
          new Date(a.enddate).getTime() - new Date(b.enddate).getTime(),
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
        sortFunction: (a: any, b: any) => {
          const periodA = (requestedByPeriod.get(a.periodId) || a.periodId)?.toLowerCase() || '';
          const periodB = (requestedByPeriod.get(b.periodId) || b.periodId)?.toLowerCase() || '';
          return periodA.localeCompare(periodB);
        },
        width: '12%',
      },
      {
        key: 'requestedby',
        name: <div className={columnHeader}>{t('COL_REQUESTED_BY')}</div>,
        selector: (row: any) => {
          const name = requestedByMap.get(row.requestedby) || row.requestedby;
          return <span title={name}>{name}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const nameA = (requestedByMap.get(a.requestedby) || a.requestedby)?.toLowerCase() || '';
          const nameB = (requestedByMap.get(b.requestedby) || b.requestedby)?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        },
        width: '15%',
      },
      {
        key: 'auditingProcess',
        name: <div className={columnHeader}>{t('COL_PROCESS')}</div>,
        selector: (row: any) => {
          const name = auditingProcessMap.get(row.auditingProcess) || row.auditingProcess;
          return <span title={name}>{name}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const processA =
            (auditingProcessMap.get(a.auditingProcess) || a.auditingProcess)?.toLowerCase() || '';
          const processB =
            (auditingProcessMap.get(b.auditingProcess) || b.auditingProcess)?.toLowerCase() || '';
          return processA.localeCompare(processB);
        },
        width: '18%',
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/assessmentgroup`} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_ASSESSMENT_GROUPS')}
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
                {t('SUBMENU_ASSESSMENT_GROUPS')}
              </Text>
            </Stack>

            <Grid item lg={1.7} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('CREATE_ASSESSMENT_GROUP')}`}
                disabled={this.state.enableActiveButton || this.state.inActivePage}
                onClick={() => this.setState({ visible: true })}
              />
            </Grid>
          </Grid>

          <Grid lg={12} item container spacing={1} direction={'row'}>
            <Grid item lg={2} xs={12}>
              <SearchBox
                className="searchBox"
                styles={PIMsearchBoxStyles}
                placeholder={t('SEARCH_PLACEHOLDER')}
                onChange={(e: any) => this.onSearch(e)}
                value={this.state.searchKey}
                onClear={() => {
                  this.setState({ searchKey: '' });
                  this.refresh();
                }}
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
                data={currentRecord}
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

          <Modal
            isOpen={this.state.visible}
            containerClassName={PIMcontentStyles.container}
            isBlocking={false}
            onDismiss={() => this.setState({ visible: false })}
          >
            <div className={PIMcontentStyles.header}>
              <Grid container spacing={2}>
                <Grid item xs={10.5}>
                  <div className="apptext1">
                    {this.state.selectedRowData.length !== 0
                      ? `${t('EDIT_AUDIT')}`
                      : `${t('ADD_AUDIT')}`}
                  </div>
                </Grid>
                <Grid item xs={1.5}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() =>
                      this.setState({
                        visible: false,
                        noSelection: !this.state.noSelection,
                        enableEditButton: false,
                        enableActiveButton: false,
                        selectedRowData: [],
                      })
                    }
                  />
                </Grid>
              </Grid>
            </div>
            <div className={PIMcontentStyles.body}>
              <AddorUpdateAudit
                SelectedAudit={this.state.selectedRowData[0]}
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
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(Audit);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
