import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { Icon, Modal, Stack } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import NotificationManager from '@/services/NotificationManager';
import {
  AddButton,
  columnHeader,
  hyperlink,
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '../PimStyles';
import AddEditCities from './AddorUpdateCity';

class Cities extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  stausofRecords = true;
  options: IDropdownOption[] = [
    { key: 0, text: 'Yes' },
    { key: 1, text: 'No' },
  ];
  notify = new NotificationManager();
  path = window.location.pathname.substring(1);

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
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }
  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse1: any = (await this.apiClient.getCities()).result;
      this.setState({
        currentRecord: apiResponse1?.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
        copyRecord: apiResponse1?.map((item: any, index: any) => ({ index: index + 1, ...item })),
      });
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
    this.setState({
      A_D_Visible: false,
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
    });
  };

  onSearch(e: any) {
    var newValue = e?.target.value;
    newValue = newValue == undefined ? '' : newValue;
    this.setState({ searchKey: newValue });

    var { copyRecord } = this.state;
    var result = copyRecord.filter((element: any) => {
      return (
        element?.city?.toLowerCase().includes(newValue.trim().toLowerCase()) ||
        element?.district?.toLowerCase().includes(newValue.trim().toLowerCase()) ||
        element?.state?.toLowerCase().includes(newValue.trim().toLowerCase()) ||
        element?.country?.toLowerCase().includes(newValue.trim().toLowerCase()) ||
        element?.zone?.toLowerCase().includes(newValue.trim().toLowerCase())
      );
    });

    this.setState({
      currentRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  render() {
    const { currentRecord } = this.state;
    const { t } = this.props;

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'city',
        name: <div className={columnHeader}>{t('COL_CITY')}</div>,
        selector: (row: any) => row.city,
        cell: (row: any) => (
          <span className={hyperlink} onClick={() => this.handleRowClick(row)} title={row.city}>
            {row.city}
          </span>
        ),
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.city?.localeCompare(b?.city),
      },
      {
        key: 'state',
        name: <div className={columnHeader}>{t('COL_STATE')}</div>,
        selector: (row: any) => <span title={row.state}>{row.state}</span>,
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.state?.localeCompare(b?.state),
      },
      {
        key: 'country',
        name: <div className={columnHeader}>{t('COL_COUNTRY')}</div>,
        selector: (row: any) => <span title={row.country}>{row.country}</span>,
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.country?.localeCompare(b?.country),
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity/geography/city`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('MENU_GEOGRAPHY')}
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
                {t('Cities')}
              </Text>
            </Stack>
            <Grid item lg={1.5} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('Add City')}`}
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
                    {this.state.selectedRowData.length != 0 ? (
                      <span className="apptext1">{`${t('EDIT_CITY')}`}</span>
                    ) : (
                      <span className="apptext1">{`${t('ADD_CITY')}`}</span>
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
              <AddEditCities
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
                paginationComponentOptions={{ rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}` }}
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
    );
  }
}

const ComponentTranslated: any = withTranslation()(Cities);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
