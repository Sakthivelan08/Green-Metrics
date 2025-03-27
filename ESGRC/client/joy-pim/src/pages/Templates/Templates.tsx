import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { Icon, Modal, Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { CancelroleStyles, cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
import {
  AddButton,
  columnHeader,
  EditButtons,
  hyperlink,
  PIMcontentStyles,
  PIMfooterButtonCancel,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '../PimStyles';
import AddorUpdateTemplates from './AddorUpdateTemplates';
import { AppUser, GetMetricGroupListApiResponse } from '@/services/ApiClient';

class Templates extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  stausofRecords = true;
  notify = new NotificationManager();
  constructor(props: any) {
    super(props);
    this.state = {
      A_D_Visible: false,
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      inActivePage: false,
      copyRecord: [],
      searchKey: '',
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      editing: false,
      showTemplateMetric: false,
      id: 0,
    };
  }

  // async componentDidMount(): Promise<void> {
  //   await this.fetchMetricGroups();
  //   this.refresh(!this.state.inActivePage);
  // }

  // async fetchMetricGroups() {
  //   try {
  //     const response: GetMetricGroupListApiResponse =
  //       await this.apiClient.getActiveMetricGroupsWithCount();
  //     if (response.result) {
  //       const metricGroups = response.result.reduce((data: any, group: any) => {
  //         data[group.groupId] = group.name;
  //         return data;
  //       }, {});

  //       this.setState({ metricGroups });
  //     } else {
  //       this.setState({ metricGroups: {} });
  //     }
  //   } catch (error: any) {
  //     this.notify.showErrorNotify(error.message);
  //   }
  // }
  // async fetchTemplates() {
  //   try {
  //     const templateResponse = await this.apiClient.getAllActiveTemplate();
  //     return templateResponse.result || [];
  //   } catch (e: any) {
  //     console.error(e.message);
  //     return [];
  //   }
  // }

  // async fetchActiveUsers() {
  //   try {
  //     const userResponse = await this.apiClient.activeUsers();
  //     return userResponse.result || [];
  //   } catch (e: any) {
  //     console.error(e.message);
  //     return [];
  //   }
  // }

  // async refresh(inActivePage: boolean) {
  //   this.setState({ searchKey: '', isRecord: true, currentRecord: [] });

  //   try {
  //     const templates = await this.fetchTemplates();
  //     const activeUsers = await this.fetchActiveUsers();

  //     const userMap = new Map(activeUsers.map((user) => [user.id, user.name]));

  //     const updatedRecords = templates.map((item: any, index: any) => ({
  //       ...item,
  //       index: index + 1,
  //       metricGroupName: this.state.metricGroups[item.id] || '-',
  //       createdBy: userMap.get(item.createdBy) || 'Unknown',
  //     }));

  //     this.setState({
  //       currentRecord: updatedRecords,
  //       copyRecord: updatedRecords,
  //     });
  //   } catch (e: any) {
  //     this.notify.showErrorNotify(e.message);
  //   } finally {
  //     this.setState({
  //       A_D_Visible: false,
  //       noSelection: !this.state.noSelection,
  //       selectedRowData: [],
  //       isRecord: false,
  //     });
  //   }
  // }

  async componentDidMount(): Promise<void> {
    await this.fetchData();
  }
  
  async fetchData() {
    this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
  
    try {
      // Fetch all data in parallel
      const [metricResponse, templateResponse, userResponse] = await Promise.all([
        this.apiClient.getActiveMetricGroupsWithCount(),
        this.apiClient.getAllActiveTemplate(),
        this.apiClient.activeUsers(),
      ]);
  
      // Process metric groups into a dictionary
      const metricGroups = metricResponse.result
        ? metricResponse.result.reduce((data: Record<number, string>, group: any) => {
            data[group.groupId] = group.name;
            return data;
          }, {})
        : {};
  
      // Ensure users is an array
      const users = userResponse.result || [];

// Filter out users with missing `id` or `name`
      const validUsers = users.filter((user: AppUser) => user.id !== undefined && user.name !== undefined);

      const userMap = new Map(validUsers.map((user) => [user.id as number, user.name as string]));
  
      // Ensure templates is an array
      const templates = templateResponse.result || [];
      const updatedRecords = templates.map((item: any, index: number) => ({
        ...item,
        index: index + 1,
        metricGroupName: metricGroups[item.id] || '-',
        createdBy: userMap.get(item.createdBy) || 'Unknown',
      }));
  
      // Update the state in a single call
      this.setState({
        metricGroups,
        currentRecord: updatedRecords,
        copyRecord: updatedRecords,
      });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    } finally {
      this.setState({
        A_D_Visible: false,
        noSelection: !this.state.noSelection,
        selectedRowData: [],
        isRecord: false,
      });
    }
  }  
  
  // Call this method when you need to refresh data
  async refresh(inActivePage: boolean) {
    await this.fetchData();
  }  

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };
  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };
  rowSelection = (e: any) => {
    this.setState({ selectedRowData: e.selectedRows });
    const selectionCount = e.selectedCount;
    switch (selectionCount) {
      case 0:
        this.setState({ enableEditButton: false, enableActiveButton: false });
        break;
      case 1:
        this.setState({ enableEditButton: true, enableActiveButton: true });
        break;
      default:
        this.setState({ enableEditButton: false, enableActiveButton: true });
        break;
    }
  };

  handleRowClick = (row: any) => {
    this.setState({
      visible: true,
      selectedRowData: [row],
      editing: true,
      selectedGroupId: row.id,
    });
  };
  handletemplateClick = (row: any) => {
    this.setState({
      selectedRowData: [row],
      selectedGroupId: row.id,
      showTemplateMetric: true,
      metricGroupId: row.id,
    });
  };

  onSearch(e: any) {
    var newValue = e?.target.value;
    newValue = newValue == undefined ? '' : newValue;
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;
    var result = copyRecord.filter((element: any) => {
      return element?.name
        ?.toLowerCase()
        .includes(newValue.trim().split(/ +/).join(' ').toLowerCase());
    });
    this.setState({
      currentRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }
  toggleShowTemplateMetric = () => {
    this.setState((prevState: { showTemplateMetric: any }) => ({
      showTemplateMetric: !prevState.showTemplateMetric,
    }));
  };

  render() {
    const { currentRecord } = this.state;
    const { t } = this.props;
    const { showTemplateMetric } = this.state;
    const { metricGroupId } = this.state;
    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'actionColumn',
        name: <div className={columnHeader}>{`${this.props.t('COL_ACTION')}`}</div>,
        cell: (row: any) =>
          this.state.currentRecord != 0 && (
            <div>
              <span
                className={hyperlink}
                role="button"
                tabIndex={0}
                aria-label="Edit"
                onClick={() => this.handleRowClick(row)}
              >
                <Icon styles={EditButtons} iconName="Edit" />
              </span>
            </div>
          ),
        isVisible: true,
        width: '10%',
      },
      {
        key: 'template',
        name: <div className={columnHeader}>{t('SUBMENU_TEMPLATE')}</div>,
        cell: (row: any) => (
          <Link className={hyperlink} to={`/home/templates/templatemetric?id=${row.id}`}>
            <span title={row.name}>{row.name}</span>
          </Link>
        ),
        width: '20%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.name?.localeCompare(b?.name),
      },
      {
        key: 'datecreated',
        name: <div className={columnHeader}>{t('COL_DATE_CREATED')}</div>,
        selector: (row: any) => (
          <span
            title={
              row.dateCreated != null && row.dateCreated !== ''
                ? new Date(row.dateCreated).toLocaleDateString('en-GB')
                : ''
            }
          >
            {row.dateCreated != null &&
              row.dateCreated !== '' &&
              new Date(row.dateCreated).toLocaleDateString('en-GB')}
          </span>
        ),
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
          const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
          return dateA - dateB;
        },
        width: '15%',
      },
      {
        key: 'createdby',
        name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
        selector: (row: any) => <span title={row.createdBy}>{row.createdBy}</span>,
        width: '15%',
        sortable: true,
      },
    ];

    return (
      <>
        <div className="layout width-100">
          <div className="bg-Color">
            <Link to={`/metrics/templates`} className="headerText">
              {t('MENU_METRICS')}/{t('SUBMENU_TEMPLATE')}
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
                  {t('SUBMENU_TEMPLATE')}
                </Text>
              </Stack>
              <Grid item lg={1.9} xs={1}>
                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'CircleAddition' }}
                  text={`${t('ADD_TEMPLATE')}`}
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
                  onClick={() => this.refresh(!this.state.inActivePage)}
                />
              </Grid>
            </Grid>
            <Modal
              isOpen={this.state.A_D_Visible}
              containerClassName={PIMcontentStyles.confirmContaineruser}
              isBlocking={false}
              onDismiss={() =>
                this.setState({
                  A_D_Visible: false,
                })
              }
            >
              <div className={PIMcontentStyles.confirmHeaderUser}>
                <IconButton
                  styles={CancelroleStyles}
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={() => {
                    this.setState({
                      A_D_Visible: false,
                      noSelection: !this.state.noSelection,
                      enableEditButton: false,
                      enableActiveButton: false,
                      selectedRowData: [],
                    });
                  }}
                />
              </div>
              <div className={PIMcontentStyles.confirmbody}>
                {this.state.inActivePage == false ? (
                  <Text variant="xLarge" className="apptext2">{`${t('CONFIRM_DEACTIVATE')}`}</Text>
                ) : (
                  <Text variant="xLarge" className="apptext2">{`${t('CONFIRM_ACTIVATE')}`}</Text>
                )}
              </div>
              <div className={PIMcontentStyles.footer}>
                <Grid lg={12} item container spacing={2}>
                  <Grid item lg={1.5} xs={12} />
                  <Grid item lg={4} xs={12}>
                    <DefaultButton
                      className="button"
                      styles={AddButton}
                      text={`${t('BTN_CONFIRM')}`}
                    />
                  </Grid>
                  <Grid item lg={0.5} xs={12} />
                  <Grid item lg={4} xs={12}>
                    <DefaultButton
                      className="button"
                      styles={PIMfooterButtonCancel}
                      text={`${t('BTN_CANCEL')}`}
                      onClick={() => {
                        this.setState({ A_D_Visible: false });
                      }}
                    />
                  </Grid>
                  <Grid item lg={2} xs={12} />
                </Grid>
              </div>
            </Modal>
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
                      {this.state.selectedRowData.length != 0 ? (
                        <span className="apptext1">{`${t('EDIT_TEMPLATE')}`}</span>
                      ) : (
                        <span className="apptext1">{`${t('ADD_TEMPLATE')}`}</span>
                      )}
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
                <AddorUpdateTemplates
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
                    this.refresh(true);
                  }}
                />
              </div>
            </Modal>
            <Card>
              {this.state.currentRecord?.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={currentRecord}
                  pagination={true}
                  selectableRows={this.state.selectedRowData}
                  onSelectedRowsChange={this.rowSelection}
                  clearSelectedRows={this.state.noSelection}
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
                      {<DataTable columns={columns} data={[{ '': '' }]} />}
                      <Stack className="noRecordsWidth">
                        {this.state.isRecord == true
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
                    {this.state.isRecord == true
                      ? `${this.props.t('RECORDS')}`
                      : `${this.props.t('NO_RECORDS')}`}
                  </Stack>
                </div>
              )}
            </Card>
          </div>
        </div>
      </>
    );
  }
}

const ComponentTranslated: any = withTranslation()(Templates);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
