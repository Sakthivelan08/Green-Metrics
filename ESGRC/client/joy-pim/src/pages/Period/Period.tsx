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
import AddorUpdatePeriod from './AddorUpdatePeriod';

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
      quatterMap: new Map<number, string>(),
      fiscalMap: new Map<number, string>(),
      createdByMap: new Map<number, string>(),
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchQuatterOptions();
    await this.fetchFiscalOptions();
    await this.fetchCreatedByOptions();
    this.refresh();
  }

  async fetchQuatterOptions() {
    try {
      const response = await this.apiClient.getQuatter();
      if (!response?.result) {
        throw new Error('No result from the API');
      }
      const quatterMap = new Map<number, string>(response.result.map((e: any) => [e.id, e.name]));
      this.setState({ quatterMap });
    } catch (error) {
      this.notify.showErrorNotify('Error getting years');
    }
  }

  async fetchFiscalOptions() {
    try {
      const response = await this.apiClient.getAllFiscalYear();
      if (!response?.result) {
        throw new Error('No result from the API');
      }
      const fiscalMap = new Map<number, string>(response.result.map((e: any) => [e.id, e.year]));
      this.setState({ fiscalMap });
    } catch (error) {
      this.notify.showErrorNotify('Error getting years');
    }
  }

  async fetchCreatedByOptions() {
    try {
      const response = await this.apiClient.activeUsers();
      if (!response?.result) {
        throw new Error('No result from the API');
      }
      const createdByMap = new Map<number, string>(response.result.map((e: any) => [e.id, e.name]));
      this.setState({ createdByMap });
    } catch (error) {
      this.notify.showErrorNotify('Error getting users');
    }
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getAllPeriod();
      console.log('API Response:', apiResponse);
      const result = apiResponse?.result || [];
      this.setState({
        currentRecord: result.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
      });
    } catch (e: any) {
      console.error('Error fetching audit data:', e);
      this.notify.showErrorNotify(e.message);
    } finally {
      this.setState({ isRecord: false });
    }
  }

  onSearch(e: any) {
    const newValue = e?.target?.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });

    const { currentRecord, quatterMap, fiscalMap, createdByMap } = this.state;

    if (newValue === '') {
      this.refresh();
      return;
    }

    const filteredRecord = currentRecord.filter((item: any) => {
      const Quatter = quatterMap.get(item.quatter)?.toLowerCase() || '';
      const Created = createdByMap.get(item.createdBy)?.toLowerCase() || '';
      const Month = item.month?.toLowerCase() || '';
      const YearName = item.yearName?.toLowerCase() || '';
      return (
        Month.includes(newValue) ||
        YearName.includes(newValue) ||
        Quatter.includes(newValue) ||
        Created.includes(newValue)
      );
    });

    this.setState({ currentRecord: filteredRecord });
  }

  render() {
    const { currentRecord, quatterMap, fiscalMap, createdByMap } = this.state;
    const { t } = this.props;
    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'month',
        name: <div className={columnHeader}>{t('COL_MONTH')}</div>,
        selector: (row: any) => <span title={row.month}>{row.month}</span>,
        cell: (row: any) => <span title={row.month}>{row.month}</span>,
        minWidth: '200px',
        sortable: true,
        sortFunction: (a: any, b: any) => a.month?.localeCompare(b.month),
        width: '10%',
      },
      {
        key: 'periodId',
        name: <div className={columnHeader}>{t('COL_PERIOD')}</div>,
        selector: (row: any) => <span title={row.yearName}>{row.yearName}</span>,
        cell: (row: any) => <span title={row.yearName}>{row.yearName}</span>,
        minWidth: '200px',
        sortable: true,
        sortFunction: (a: any, b: any) => a.yearName?.localeCompare(b.yearName),
        width: '10%',
      },
      {
        key: 'quatter',
        name: <div className={columnHeader}>{t('COL_QUATTER')}</div>,
        selector: (row: any) => {
          const name = quatterMap.get(row.quatter) || row.quatter;
          return <span title={name}>{name}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const quatterA = quatterMap.get(a.quatter) || a.quatter;
          const quatterB = quatterMap.get(b.quatter) || b.quatter;
          return quatterA?.localeCompare(quatterB);
        },
        minWidth: '200px',
        width: '10%',
      },
      {
        key: 'fiscalYearId',
        name: <div className={columnHeader}>{t('COL_FISCALYEAR')}</div>,
        selector: (row: any) => {
          const name = fiscalMap.get(row.fiscalYearId) || row.fiscalYearId;
          return <span title={name}>{name}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const yearA = fiscalMap.get(a.fiscalYearId) || a.fiscalYearId;
          const yearB = fiscalMap.get(b.fiscalYearId) || b.fiscalYearId;
          const numericYearA = Number(yearA);
          const numericYearB = Number(yearB);
          return numericYearA - numericYearB;
        },
        minWidth: '200px',
        width: '12%',
      },
      {
        key: 'createdby',
        name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
        selector: (row: any) => {
          const name = createdByMap.get(row.createdBy) || row.createdBy;
          return <span title={name}>{name}</span>;
        },
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const createdByA = createdByMap.get(a.createdBy) || a.createdBy;
          const createdByB = createdByMap.get(b.createdBy) || b.createdBy;
          return createdByA?.localeCompare(createdByB);
        },
        minWidth: '200px',
        width: '13%',
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/period`} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_PERIOD')}
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
                {t('SUBMENU_PERIOD')}
              </Text>
            </Stack>

            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ADD_PERIOD')}`}
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
                      ? `${t('EDIT_PERIOD')}`
                      : `${t('ADD_PERIOD')}`}
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
              <AddorUpdatePeriod
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
