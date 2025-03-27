import React, { Suspense } from 'react';
import { Icon, SearchBox, Stack } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { withTranslation } from 'react-i18next';
import { Grid, Drawer, Card } from '@mui/material';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import {
  AddButton,
  columnHeader,
  hyperlink,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '@/pages/PimStyles';
import { Link } from 'react-router-dom';
import AddOrUpdateReports from './AddorUpdateReports';
import DataTable from 'react-data-table-component';

class Reports extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();

  constructor(props: any) {
    super(props);
    this.state = {
      isDrawerOpen: false,
      searchKey: '',
      copyRecord: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getAllPdfReports();

      const result = apiResponse?.result || [];
      this.setState({
        copyRecord: result,
        currentRecord: result.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
      });
    } catch (e: any) {
      this.notify.showErrorNotify('FETCHING_ERROR');
    } finally {
      this.setState({ isRecord: false });
    }
  }

  handleRowClick = (row: any) => {
    this.setState({
      isDrawerOpen: true,
      selectedRowData: [row],
    });
  };

  onSearch(e: any) {
    var newValue = e?.target.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;

    const results = copyRecord.filter((element: any) => {
      const type = element.type?.toLowerCase() || '';
      return type.includes(newValue);
    });

    this.setState({
      currentRecord: results.map((item: any, index: number) => ({
        index: index + 1,
        ...item,
      })),
    });
  }

  handleFormSubmitSuccess = () => {
    this.refresh();
  };

  render() {
    const { t } = this.props;
    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'pagenumber',
        name: <div className={columnHeader}>{t('PAGE_NO')}</div>,
        selector: (row: any) => row.pageNumber,
        cell: (row: any) => <span title={row.pageNumber}>{row.pageNumber}</span>,
        width: '14%',
        sortable: true,
        sortFunction: (a: any, b: any) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0),
      },
      {
        key: 'type',
        name: <div className={columnHeader}>{t('COL_TYPE')}</div>,
        selector: (row: any) => row.type,
        cell: (row: any) => (
          <span className={hyperlink} onClick={() => this.handleRowClick(row)} title={row.type}>
            {row.type}
          </span>
        ),
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const typeA = a.type?.toLowerCase() || '';
          const typeB = b.type?.toLowerCase() || '';
          return typeA.localeCompare(typeB);
        },
      },
      {
        key: 'url',
        name: <div className={columnHeader}>{t('COL_URL')}</div>,
        selector: (row: any) => row.url,
        cell: (row: any) => <span title={row.url}>{row.url}</span>,
        width: '40%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const urlA = a.url?.toLowerCase() || '';
          const urlB = b.url?.toLowerCase() || '';
          return urlA.localeCompare(urlB);
        },
      },
    ];

    const { isDrawerOpen } = this.state;
    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity/bsrpdf`} className="headerText">
            {t('MENU_ACTIVITY')}/ {t('SUBMENU_PDF_REPORTS')}
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
                {t('SUBMENU_PDF_REPORTS')}
              </Text>
            </Stack>

            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ADD_PDF')}`}
                onClick={() => this.setState({ isDrawerOpen: true, selectedRowData: [] })}
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
                width: '400px',
                maxWidth: '90vw',
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
            <div>
              <Text
                className="color-blue text"
                key={'xxLarge'}
                variant={'xxLarge' as ITextProps['variant']}
                styles={PIMHearderText}
                nowrap
                block
              >
                {this.state.selectedRowData?.length != 0
                  ? t('EDIT_PDF_REPORTS')
                  : t('ADD_PDF_REPORTS')}
              </Text>
            </div>
            <AddOrUpdateReports
              rowData={this.state.selectedRowData}
              ClosePopup={() => {
                this.setState({ isDrawerOpen: false });
              }}
              onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
          </Drawer>
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(Reports);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
