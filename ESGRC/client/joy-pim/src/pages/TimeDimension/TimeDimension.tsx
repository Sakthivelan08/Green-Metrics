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
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { Link } from 'react-router-dom';
import AddOrUpdateTimeDimesion from './AddOrUpdateTimeDimension';

class TimeDimension extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      isRecord: true,
      copyRecord: [],
      isVisible: false,
      selectedRowData: [],
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getTimeDimension();
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
      this.setState({
        selectedRowData: [],
        isRecord: false,
      });
    } finally {
      this.setState({ isRecord: false });
    }
  }

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

  handleRowClick = (row: any) => {
    this.setState({
      isVisible: true,
      selectedRowData: [row],
    });
  };

  handleFormSubmitSuccess = () => {
    this.refresh();
  };

  render() {
    const { currentRecord } = this.state;
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
        name: <div className={columnHeader}>{t('GOAL_NAME')}</div>,
        selector: (row: any) => <span title={row.name}>{row.name}</span>,
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
        key: 'description',
        name: <div className={columnHeader}>{t('COL_DESCRIPTION')}</div>,
        selector: (row: any) => <span title={row.description}>{row.description}</span>,
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const nameA = a.description?.toLowerCase() || '';
          const nameB = b.description?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/timedimenison`} className="headerText">
            {t('MENU_METRICS')}/{t('TIME_DIMENSION')}
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
                {t('TIME_DIMENSION')}
              </Text>
            </Stack>

            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('CREATE_TIME_DIMENSION')}`}
                onClick={() => this.setState({ isVisible: true, selectedRowData: [] })}
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

        <Modal
          isOpen={this.state.isVisible}
          containerClassName={PIMcontentStyles.container}
          isBlocking={false}
          onDismiss={() => this.setState({ isVisible: false })}
        >
          <div className={PIMcontentStyles.header}>
            <Grid container spacing={2}>
              <Grid item xs={10.5}>
                <div className="apptext1">
                  {this.state.selectedRowData?.length > 0
                    ? `${t('EDIT_TIME_DIMENSION')}`
                    : `${t('CREATE_TIME_DIMENSION')}`}
                </div>
              </Grid>
              <Grid item xs={1.5}>
                <IconButton
                  styles={iconButtonStyles}
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={() => this.setState({ isVisible: false })}
                />
              </Grid>
            </Grid>
          </div>
          <div className={PIMcontentStyles.body}>
            <AddOrUpdateTimeDimesion
              SelectedUser={this.state.selectedRowData[0]}
              recordId={this.state.selectedRowData[0]?.id}
              ClosePopup={() => {
                this.setState({ isVisible: false, selectedRowData: [] });
                this.refresh();
              }}
              onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
          </div>
        </Modal>

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
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(TimeDimension);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
