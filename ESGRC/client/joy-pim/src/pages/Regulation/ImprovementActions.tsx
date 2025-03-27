import React, { Suspense } from 'react';
import { Grid, Drawer, IconButton as MuiIconButton, Card } from '@mui/material';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { AddButton, columnHeader, hyperlink, PIMsearchBoxStyles } from '../PimStyles';
import DataTable from 'react-data-table-component';
import AddOrUpdateActions from './AddOrUpdateActions';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Icon, Stack } from '@fluentui/react';
import { withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { TemplateStageApprovalEnum } from '../enumCommon';

class ImprovementActions extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  constructor(props: any) {
    super(props);
    this.state = {
      searchKey: '',
      copyRecord: [],
      currentRecord: [],
      isDrawerOpen: false,
      noSelection: false,
      isRecord: true,
      selectedRowData: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  async refresh() {
    try {
      this.setState({
        currentRecord: [],
        searchKey: '',
        isRecord: true,
      });
      const response = await this.apiClient.getTaskActions();
      const data = response.result;
      if (data && data.length > 0) {
        this.setState({ currentRecord: data, copyRecord: data });
      } else {
        this.setState({ currentRecord: [], isRecord: false });
      }
    } catch (error) {
      this.setState({
        selectedRowData: [],
      });
      console.error('Error fetching metric details:', error);
    }
  }

  onSearch(e: any) {
    var newValue = e?.target.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;

    const results = copyRecord.filter((element: any) => {
      const name = element?.description?.toLowerCase() || '';
      return name.includes(newValue);
    });

    this.setState({
      currentRecord: results.map((item: any, index: any) => ({ index: index + 1, ...item })),
      isRecord: results.length > 0,
    });
  }

  toggleDrawer = (isOpen: boolean) => {
    this.setState({ isDrawerOpen: isOpen });
  };

  handleSubmitComplete = () => {
    this.setState({ isDrawerOpen: false });
    this.refresh();
  };

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };

  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };

  formatDate = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }
  };
  Updatestatus(row: any) {
    return (
      <span title={row.status}>
        {row.status === TemplateStageApprovalEnum.Pending ? 'Pending' : ''}
      </span>
    );
  }

  handleRowClick = (row: any) => {
    this.setState({
      isDrawerOpen: true,
      selectedRowData: [row],
    });
  };

  render() {
    const { t } = this.props;
    const { isDrawerOpen } = this.state;
    const columns: any = [
      {
        key: 'description',
        name: <div className={columnHeader}>{t('COL_DESCRIPTION')}</div>,
        selector: (row: any) => <span title={row.description}>{row.description}</span>,
        width: '16%',
        sortable: true,
        cell: (row: any) => (
          <span
            className={hyperlink}
            onClick={() => this.handleRowClick(row)}
            title={row.description}
          >
            {row.description}
          </span>
        ),
        sortFunction: (a: any, b: any) => {
          const descriptionA = a.description?.toLowerCase() || '';
          const descriptionB = b.description?.toLowerCase() || '';
          return descriptionA.localeCompare(descriptionB);
        },
      },
      {
        key: 'plannedStartDate',
        name: <div className={columnHeader}>{t('COL_PLANNED_START_DATE')}</div>,
        selector: (row: any) => (
          <span title={this.formatDate(row.plannedStartDate)}>
            {this.formatDate(row.plannedStartDate)}
          </span>
        ),
        width: '18%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const dateA = new Date(a.plannedStartDate).getTime();
          const dateB = new Date(b.plannedStartDate).getTime();
          return dateA - dateB;
        },
      },
      {
        key: 'plannedEndDate',
        name: <div className={columnHeader}>{t('COL_PLANNED_END_DATE')}</div>,
        selector: (row: any) => (
          <span title={this.formatDate(row.plannedEndDate)}>
            {this.formatDate(row.plannedEndDate)}
          </span>
        ),
        width: '18%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const dateA = new Date(a.plannedEndDate).getTime();
          const dateB = new Date(b.plannedEndDate).getTime();
          return dateA - dateB;
        },
      },
      {
        key: 'actualStartDate',
        name: <div className={columnHeader}>{t('COL_ACTUAL_START_DATE')}</div>,
        selector: (row: any) => (
          <span title={this.formatDate(row.actualStartDate)}>
            {this.formatDate(row.actualStartDate)}
          </span>
        ),
        width: '16%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const dateA = new Date(a.actualStartDate).getTime();
          const dateB = new Date(b.actualStartDate).getTime();
          return dateA - dateB;
        },
      },
      {
        key: 'actualEndDate',
        name: <div className={columnHeader}>{t('COL_ACTUAL_END_DATE')}</div>,
        selector: (row: any) => (
          <span title={this.formatDate(row.actualEndDate)}>
            {this.formatDate(row.actualEndDate)}
          </span>
        ),
        width: '16%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const dateA = new Date(a.actualEndDate).getTime();
          const dateB = new Date(b.actualEndDate).getTime();
          return dateA - dateB;
        },
      },
      {
        key: 'status',
        name: <div className={columnHeader}>{t('COL_STATUS')}</div>,
        selector: (row: any) => this.Updatestatus(row),
        width: '12%',
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Grid
            item
            container
            spacing={-4}
            direction={'row'}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack></Stack>

            <Grid item lg={2.5} xs={1}>
              {/* <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('CREATE_ACTIONS')}`}
                onClick={() => this.setState({ isDrawerOpen: true, selectedRowData: [] })}
              /> */}
            </Grid>
          </Grid>

          <Grid lg={12} item container spacing={1} direction={'row'} justifyContent="space-between">
            <Grid item lg={2.8} xs={1}>
              <SearchBox
                className="searchBox"
                underlined
                styles={PIMsearchBoxStyles}
                placeholder={t('SEARCH_PLACEHOLDER')}
                onChange={(e: any) => this.onSearch(e)}
                value={this.state.searchKey}
                onClear={() => this.setState({ searchKey: '' })}
              />
            </Grid>

            <Grid item lg={0} xs={1} container justifyContent="flex-end">
              <Icon
                iconName="Refresh"
                title={this.props.t('BTN_REFRESH')}
                className="iconStyle iconStyle1"
                onClick={() => this.refresh()}
                style={{ marginRight: '8px' }}
              />
            </Grid>
          </Grid>

          <div>
            <Drawer
              anchor={'right'}
              open={isDrawerOpen}
              onClose={(_, reason) => {
                if (reason !== 'backdropClick') {
                  this.setState({ isDrawerOpen: false });
                }
              }}
              PaperProps={{
                sx: {
                  width: '550px',
                },
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
              <AddOrUpdateActions
                rowData={this.state.selectedRowData}
                recordId1={this.state.selectedRowData[0]?.id || null}
                ClosePopup={() => {
                  this.setState({ isDrawerOpen: false, selectedRowData: [] });
                }}
                onSubmitComplete={this.handleSubmitComplete}
              />
            </Drawer>
          </div>

          <Card>
            {this.state.currentRecord?.length > 0 ? (
              <DataTable
                columns={columns}
                data={this.state.currentRecord}
                pagination
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="45.03vh"
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

const ComponentTranslated = withTranslation()(withRouter(ImprovementActions));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
