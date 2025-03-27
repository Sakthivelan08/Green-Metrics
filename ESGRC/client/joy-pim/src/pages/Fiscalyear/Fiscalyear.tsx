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
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '@/pages/PimStyles';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { Link } from 'react-router-dom';
import AddOrUpdateFiscalYear from './AddorUpdateFiscalyear';
class Period extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();

  constructor(props: any) {
    super(props);
    this.state = {
      searchKey: '',
      currentRecord: [],
      isRecord: true,
      visible: false,
      selectedRowData: [],
      copyRecord: [],
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getAllFiscalYear();
      const result = apiResponse?.result || [];
      this.setState({
        currentRecord: result.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
        copyRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
      });
    } catch (e: any) {
      console.error('Error fetching audit data:', e);
      this.notify.showErrorNotify(e.message);
    } finally {
      this.setState({ isRecord: false });
    }
  }

  onSearch(e: any) {
    var newValue = e?.target.value;
    newValue = newValue == undefined ? '' : newValue;
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;
    const results = copyRecord.filter((element: any) => {
      const year = element?.year?.toString() || '';
      const startMonth = element?.startMonth?.toLowerCase() || '';
      const endMonth = element?.endMonth?.toLowerCase() || '';
      return (
        year.includes(newValue) || startMonth.includes(newValue) || endMonth.includes(newValue)
      );
    });
    this.setState({
      currentRecord: results?.map((item: any, index: any) => ({ index: index + 1, ...item })),
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
        key: 'startMonth',
        name: <div className={columnHeader}>{t('START_MONTH')}</div>,
        selector: (row: any) => <span title={row.startMonth}>{row.startMonth}</span>,
        cell: (row: any) => <span title={row.startMonth}>{row.startMonth}</span>,
        minwidth: '200px',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.startMonth?.localeCompare(b?.startMonth),
        width: '13%',
      },
      {
        key: 'endMonth',
        name: <div className={columnHeader}>{t('END_MONTH')}</div>,
        selector: (row: any) => <span title={row.endMonth}>{row.endMonth}</span>,
        cell: (row: any) => <span title={row.endMonth}>{row.endMonth}</span>,
        minwidth: '200px',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.endMonth?.localeCompare(b?.endMonth),
        width: '12%',
      },
      {
        key: 'year',
        name: <div className={columnHeader}>{t('COL_YEAR_NAME')}</div>,
        selector: (row: any) => <span title={row.year}>{row.year}</span>,
        cell: (row: any) => <span title={row.year}>{row.year}</span>,
        minwidth: '200px',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.year?.toString().localeCompare(b?.year?.toString()),
        width: '12%',
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/fiscalyear`} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_FISCALYEAR')}
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
                {t('SUBMENU_FISCALYEAR')}
              </Text>
            </Stack>
            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ADD_SUBMENU_FISCALYEAR')}`}
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
                      ? `${t('EDIT_SUBMENU_FISCALYEAR')}`
                      : `${t('ADD_SUBMENU_FISCALYEAR')}`}
                  </div>
                </Grid>
                <Grid item xs={1.5}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => this.setState({ visible: false })}
                  />
                </Grid>
              </Grid>
            </div>
            <div className={PIMcontentStyles.body}>
              <AddOrUpdateFiscalYear
                SelectedPeriod={this.state.selectedRowData[0]}
                recordId={this.state.selectedRowData[0]?.id}
                ClosePopup={() => {
                  this.setState({ visible: false });
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

const ComponentTranslated = withTranslation()(Period);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
