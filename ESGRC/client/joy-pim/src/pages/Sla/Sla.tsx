import { DefaultButton, Icon, Modal, SearchBox, Stack } from '@fluentui/react';
import React, { Suspense } from 'react';
import { Text } from '@fluentui/react/lib/Text';
import Grid from '@mui/material/Grid';
import { withTranslation } from 'react-i18next';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import {
  AddFam,
  columnHeader,
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBox,
  customStyles,
  AddButton2,
} from '../PimStyles';
import AddOrUpdateSla from './AddOrUpdateSla';
import { t } from 'i18next';

class Sla extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  constructor(props: any) {
    super(props);
    this.apiClient = new ApiManager().CreateApiClient();
    this.notify = new NotificationManager();
    this.state = {
      rowData: [],
      isRecord: false,
      noSelection: false,
      enableEditButton: false,
      enableActiveButton: false,
      inActivePage: false,
      selectedRowData: [],
      selectionCount: 0,
      searchKey: '',
      columns: [],
      statusOption: [],
      Visible: false,
      refreshKey: 0,
      copyRecord: [],
    };
  }

  async componentDidMount() {
    this.setState({
      isRecord: true,
    });
    this.refresh(!this.state.inActivePage);
  }

  async refresh(inActivePage: boolean | null) {
    try {
      this.setState({ isRecord: true });
      if (inActivePage == null) {
        this.setState((prevState: any) => ({
          refreshKey: prevState.refreshKey + 1,
          selectedDropdownKey: 2,
          inActivePage: null,
        }));
      }
      const apiResponse = (await this.apiClient.getAllSla()) || {};
      let slas = apiResponse.result || [];
      // var slas: any[] = [];
      this.setState({
        rowData: slas?.map((item: any, index: number) => ({ index: index + 1, ...item })),
        searchData: slas?.map((item: any, index: number) => ({ index: index + 1, ...item })),
        copyRecord: slas?.map((item: any, index: number) => ({ index: index + 1, ...item })),
      });
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
    this.setState({
      isRecord: false,
      Visible: false,
      selectedRowData: [],
      deletevisible: false
    });
  }

  onSearch(e: any) {
    const newValue = e?.target.value || '';
    this.setState({ searchKey: newValue });
    const { copyRecord } = this.state;
    const searchResult = copyRecord.filter((item: any) =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(newValue.toLowerCase())
      )
    );

    this.setState({ rowData: searchResult });
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
      Visible: true,
      selectedRowData: [row],
    });
  };

  toggleAddOrEditPopup(): void {
    this.setState((prevState: any) => ({ Visible: !prevState.Visible }));
  }

  resetStates(): void {
    this.setState((prevState: any) => ({
      Visible: false,
      noSelection: !prevState.noSelection,
      enableEditButton: false,
      enableActiveButton: false,
      selectedRowData: [],
    }));
  }

  async handleDelete(row: any) {
    try {
      await this.apiClient.deleteSla(row.id);
      this.setState((prevState: { rowData: any[] }) => ({
        rowData: prevState.rowData.filter(
          (item: { itemCode: any }) => item.itemCode !== row.itemcode,
        ),
        selectedRowData: [],
        selectionCount: 0,
      }));
      this.notify.showSuccessNotify(`${t('MSG_DELETED')}`);
    } catch (error) {
      this.notify.showErrorNotify(`${t('MSG_FAILED')}`);
    }
    this.refresh(true);
  }

  tableNameColumn(row: any) {
    return (<span title={row.tableName}>{row.tableName}</span>);
  }

  triggerColumn(row: any) {
    return (<span title={row.triggerType}>{row.triggerType}</span>);
  }

  actionNameColumn(row: any) {
    return (<span title={row.action}>{row.actionName}</span>)
  }

  actionTimeColumn(row: any) {
    return (<span title={row.actionTime}>{row.actionTime}</span>);
  }

  esclationNameColumn(row: any) {
    return (<span title={row.escalationName}>{row.escalationName}</span>);
  }

  esclationTimeColumn(row: any) {
    return (<span title={row.escalationTime}>{row.escalationTime}</span>);
  }

  realTimeCellColumn(row: any) {
    return (
      <span title={String(row.realTime)}>
        {row.realTime ? this.props.t('COL_YES') : this.props.t('COL_NO')}
      </span>
    );
  }

  realTimeColumn(row: any) {
    return (<span title={row.realTime}>{row.realTime}</span>);
  }

  actionColumn(row: any) {
    if (row.index) {
      return (
        <>
          <Icon
            iconName="Edit"
            className="iconStyle"
            title={this.props.t('BTN_EDIT')}
            onClick={() => this.handleRowClick(row)}
          />
          <Icon
            iconName="Delete"
            className="iconStyle"
            title={this.props.t('BTN_DELETE')}
            onClick={() => this.setState({ row, deletevisible: true })}
          />
        </>
      );
    }
    return null;
  }

  render() {
    const { t } = this.props;
    let _column: any = [
      {
        key: 'tableName',
        name: <div className={columnHeader}>{t('COL_TABLE')}</div>,
        selector: this.tableNameColumn,
        width: '176px',
      },
      {
        key: 'trigger',
        name: <div className={columnHeader}>{t('COL_TRIGGER')}</div>,
        selector: this.triggerColumn,
        width: '150px',
      },
      {
        key: 'action',
        name: <div className={columnHeader}>{t('COL_ACTIONS')}</div>,
        selector: this.actionNameColumn,
        width: '150px',
      },
      {
        key: 'actionTime',
        name: <div className={columnHeader}>{t('COL_ACTIONTIME')}</div>,
        selector: this.actionTimeColumn,
        width: '105px',
      },
      {
        key: 'esclationName',
        name: <div className={columnHeader}>{t('COL_ESL')}</div>,
        selector: this.esclationNameColumn,
        width: '150px',
      },
      {
        key: 'escalationTime',
        name: <div className={columnHeader}>{t('COL_ESL_TIME')}</div>,
        selector: this.esclationTimeColumn,
        width: '105px',
      },

      {
        key: 'realTime ',
        name: <div className={columnHeader}>{t('COL_REALTIME')}</div>,
        selector: this.realTimeColumn,
        cell: this.realTimeCellColumn.bind(this),
        isVisible: true,
        width: '150px',
      },
      {
        key: 'action',
        name: <div className={columnHeader}>{`${this.props.t('COL_ACTION')}`}</div>,
        selector: this.actionColumn.bind(this),
        isVisible: false,
        width: '150px',
      },
    ];
    const handleColumnReorder1 = (newColumns: any) => {
      var _columnss: any = [..._column];
      if (newColumns == this.state.currentColumns) {
        this.setState({ currentColumns: _columnss });
      } else {
        this.setState({ currentColumns: newColumns });
      }
    };
    return (
      <div className="layout width-100">
        <Stack>
          <Grid container spacing={2} direction="row" alignItems="center" className="grid">
            <Grid item lg={3.5} xs={12}>
              <Text variant="xxLarge" styles={PIMHearderText} className="color-blue text">{`${t(
                'MENU_SLA',
              )}`}</Text>
            </Grid>
            <Grid item lg={7} xs={12} />
            <Grid item lg={1.5} xs={12}>
              <DefaultButton
                className="button"
                // iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('BTN_ADD')}`}
                styles={AddFam} //this.state.enableActiveButton ||
                // disabled={this.state.selectedRowData.length != 0}
                onClick={() => this.setState({ Visible: true, selectedRowData: [] })}
              />
            </Grid>
          </Grid>
        </Stack>
        <Grid lg={12} item container spacing={2} direction={'row'}>
          <Grid item lg={1.4} xs={12}>
            <Grid item lg={1.4} xs={12} />
          </Grid>
          <Grid item lg={0.7} xs={6}>
            {/* <Text className={activeText}>{t('ACTIVE')}</Text> */}
          </Grid>
          <Grid item lg={1.7} xs={6}></Grid>
          <Grid item lg={3.2} xs={2} />
          <Grid item lg={0.5} xs={1}>
            {/* <Icon
                            iconName="Clear"
                            title={t('BTN_CLEAR')}
                            className="iconStyle"
                            onClick={() => {
                                this.setState({ searchKey: '' });
                                this.refresh(null);
                            }}
                        /> */}
          </Grid>
          <Grid item lg={0.5} xs={2}>
            <Icon
              iconName="Refresh"
              title={t('BTN_REFRESH')}
              className="iconStyle"
              onClick={() => {
                this.setState({ searchKey: '', studiostatus: 2 }, () => {
                  this.refresh(null);
                });
              }}
            />
          </Grid>
          <Grid item lg={4} xs={12}>
            <SearchBox
              name="search"
              className="searchBox"
              styles={PIMsearchBox}
              placeholder={`${t('COL_SLA_NAME')}`}
              onChange={(e: any) => this.onSearch(e)}
              value={this.state.searchKey}
              onClear={() => this.setState({ searchKey: '' })}
            />
          </Grid>
        </Grid>
        <div>
          <Modal
            isOpen={this.state.deletevisible}
            containerClassName={PIMcontentStyles.confirmContaineruser}
            isBlocking={false}
            onDismiss={() => this.setState({ ActiveView: false })}

          >
            <div className={PIMcontentStyles.confirmbody}>
              <Grid container>
                <Grid item lg={10} xs={12}>
                  <Stack>
                    <Text variant="xLarge" className="modelHeaderText">

                      {t('BTN_DELETE')}   {this.state.row?.tableName}  {t('?')}
                    </Text>
                  </Stack>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item lg={12} xs={12}>
                  <Text variant="xLarge" className="apptext2">
                    {t('MSG_DELETE')}
                  </Text>
                </Grid>
              </Grid>
            </div>
            <hr />
            <div className={PIMcontentStyles.footer}>
              <Grid container spacing={2}>
                <Grid item lg={5} xs={12} />
                <Grid item lg={1.5} xs={12}>
                  <DefaultButton
                    className="button"
                    styles={AddButton2}
                    text={t('BTN_CANCEL')}
                    onClick={() => this.setState({ deletevisible: false })}
                  />
                </Grid>
                <Grid item lg={2} xs={12} />
                <Grid item lg={1.5} xs={12}>
                  <DefaultButton
                    className="button"
                    styles={AddFam}
                    text={t('BTN_CONFIRM')}
                    onClick={() => this.handleDelete(this.state.row)}
                  />
                </Grid>
                <Grid item lg={0.5} xs={12} />
              </Grid>
            </div>
          </Modal>
          <DataTable
            columns={_column}
            data={this.state.rowData}
            pagination={true}
            customStyles={customStyles}
            //selectableRows={this.state.selectedRowData}
            onSelectedRowsChange={this.rowSelection}
            onColumnOrderChange={handleColumnReorder1}
            clearSelectedRows={this.state.noSelection}
            responsive
            striped
            highlightOnHover
            selectableRowsHighlight
            fixedHeader
            fixedHeaderScrollHeight="386px"
            paginationComponentOptions={{ rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}` }}
            paginationPerPage={this.Defaultperpage()}
            paginationRowsPerPageOptions={this.perpage()}
            noDataComponent={
              <div className="noDataWidth">
                {<DataTable columns={_column} data={[{ '': '' }]} customStyles={customStyles} />}
                <Stack className="d-flex align-item-center justify-content-center w-100">
                  {this.state.isRecord
                    ? `${this.props.t('RECORDS')}`
                    : `${this.props.t('NO_RECORDS')}`}
                </Stack>
              </div>
            }
          />
        </div>
        {this.state.Visible && (
          <AddOrUpdateSla
            visible={this.state.Visible}
            fields={this.state.selectedRowData}
            refresh={() => this.refresh(null)}
            clearMemory={() => {
              this.resetStates();
            }}
            togglePopUp={() => this.toggleAddOrEditPopup()}
          />
        )}
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(Sla);
function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
