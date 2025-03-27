import React, { Suspense } from 'react';
import { Icon, Modal, SearchBox, Stack } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { withTranslation } from 'react-i18next';
import { Grid, Card } from '@mui/material';
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
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import AddOrUpdateReport1 from './AddOrUpdateReport1';
import { cancelIcon, iconButtonStyles } from '@/common/properties';

class NewReport extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();

  constructor(props: any) {
    super(props);
    this.state = {
      isDrawerOpen: false,
      searchKey: '',
      copyRecord: [],
      selectedRowData: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getPdfMerge();

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
      this.setState({
        selectedRowData: [],
        isRecord: false,
      });
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
    const { copyRecord } = this.state;

    const results = copyRecord.filter((element: any) => {
      const type = element.name?.toLowerCase() || '';
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
        key: 'name',
        name: <div className={columnHeader}>{t('REPORT_NAME')}</div>,
        selector: (row: any) => row.name,
        cell: (row: any) => (
          <span className={hyperlink} onClick={() => this.handleRowClick(row)} title={row.name}>
            {row.name}
          </span>
        ),
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        key: 'pdfname',
        name: <div className={columnHeader}>{t('PDF_NAME')}</div>,
        selector: (row: any) => row.pdfName,
        cell: (row: any) => <span title={row.pdfName}>{row.pdfName}</span>,
        width: '60%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const urlA = a.pdfName?.toLowerCase() || '';
          const urlB = b.pdfName?.toLowerCase() || '';
          return urlA.localeCompare(urlB);
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity/SelectedReports`} className="headerText">
            {t('MENU_ACTIVITY')}/ {t('SUBMENU_REPORTS')}
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
                {t('SUBMENU_REPORTS')}
              </Text>
            </Stack>

            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('CREATE_REPORT')}`}
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
                  <DataTable columns={columns} data={[{ '': '' }]} />
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
              <DataTable columns={columns} data={[{ '': '' }]} />
              <Stack className="noRecordsWidth">
                {this.state.isRecord
                  ? `${this.props.t('RECORDS')}`
                  : `${this.props.t('NO_RECORDS')}`}
              </Stack>
            </div>
          )}
        </Card>

        <Modal
          isOpen={this.state.isDrawerOpen}
          containerClassName={PIMcontentStyles.container}
          isBlocking={false}
          onDismiss={() => this.setState({ isDrawerOpen: false })}
        >
          <div className={PIMcontentStyles.header}>
            <Grid container spacing={2}>
              <Grid item xs={10.5}>
                <div className="apptext1">
                  {this.state.selectedRowData?.length > 0
                    ? `${t('EDIT_REPORT')}`
                    : `${t('CREATE_REPORT')}`}
                </div>
              </Grid>
              <Grid item xs={1.5}>
                <IconButton
                  styles={iconButtonStyles}
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={() => this.setState({ isDrawerOpen: false })}
                />
              </Grid>
            </Grid>
          </div>
          <div className={PIMcontentStyles.body}>
            <AddOrUpdateReport1
              rowData={this.state.selectedRowData}
              selectUser={this.state.selectedRowData[0]}
              recordId={this.state.selectedRowData[0]?.id}
              ClosePopup={() => {
                this.setState({ isDrawerOpen: false, selectedRowData: [] });
                this.refresh();
              }}
              onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(NewReport);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
