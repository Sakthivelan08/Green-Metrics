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
import { AddButton, columnHeader, PIMcontentStyles, PIMHearderText, PIMsearchBoxStyles } from '@/pages/PimStyles';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { Link } from 'react-router-dom';
import AddOrUpdateTimeDimension from './AddorUpdateTimeDimension';


class timedimension extends React.Component<any, any> {
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
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchCreatedByOptions();
    this.refresh();
  }

   async fetchCreatedByOptions() {
    try {
      const response = await this.apiClient.activeUsers();
      if (!response?.result) {
        throw new Error("No result from the API");
      }
      const createdByMap = new Map<number, string>(
        response.result.map((e: any) => [e.id, e.name])
      );
      this.setState({ createdByMap });
    } catch (error) {
      this.notify.showErrorNotify('Error getting users');
    }
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getTimeDimentionalformula();
      console.log('API Response:', apiResponse);
      const result = apiResponse?.result || [];

      this.setState({
        currentRecord: result.map((item: any, index: any) => ({
          index: index + 1,
          metricname: item.metricname, 
          timeDimentional: item.timeDimentional,  
          formulaeField: item.formulaeField,
        })),
      });
    } catch (e: any) {
      console.error('Error fetching data:', e);
      this.notify.showErrorNotify(e.message);
    } finally {
      this.setState({ isRecord: false });
    }
  }


  onSearch(e: any) {
    const newValue = e?.target?.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });
  
    const { currentRecord} = this.state;
  
    if (newValue === '') {
      this.refresh(); 
      return;
    }
  
    const filteredRecord = currentRecord.filter((item: any) => {
      const metricName = item.metricname?.toLowerCase() || '';
      const timeDimension = item.timeDimentional?.toLowerCase() || '';

      return (
        metricName.includes(newValue) || 
        timeDimension.includes(newValue)
      );
    });
    this.setState({ currentRecord: filteredRecord });
  }

  render() {
    const { currentRecord} = this.state;
    const { t } = this.props;
    const columns: any = [
       {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'Metric',
        name: <div className={columnHeader}>{t('COL_METRICS')}</div>,
        selector: (row: any) => <span title={row.metricname}>{row.metricname}</span>, 
        cell: (row: any) => <span title={row.metricname}>{row.metricname}</span>,
        minWidth: '200px',
        width: '20%',
      },
      {
        key: 'TimeDimension',
        name: <div className={columnHeader}>{t('COL_TIMEDIMENSION')}</div>,
        selector: (row: any) => <span title={row.timeDimentional}>{row.timeDimentional}</span>, 
        cell: (row: any) => <span title={row.timeDimentional}>{row.timeDimentional}</span>,
        minWidth: '200px',
        width: '20%',
      }, 
      {
        key: 'formulaeField',
        name: <div className={columnHeader}>{t('COL_FORMULA')}</div>,
        selector: (row: any) => <span title={row.formulaeField}>{row.formulaeField}</span>, 
        cell: (row: any) => <span title={row.formulaeField}>{row.formulaeField}</span>,
        minWidth: '200px',
        width: '20%',
      }, 
    ];    

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_TIMEDIMENSION')}
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
                {t('SUBMENU_TIMEDIMENSION')}
              </Text>
            </Stack>

            <Grid item container spacing={2} justifyContent={'flex-end'}>
              <Grid item lg={2} xs={6}>  
                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'CircleAddition' }}
                  text={`${t('UPDATE_FORMULA')}`}
                  disabled={this.state.enableActiveButton || this.state.inActivePage}
                  onClick={() => this.setState({ visible: true })}
                />
              </Grid>

              <Grid item lg={2} xs={6}> 
                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'CircleAddition' }}
                  text={`${t('ADD_TIMEDIMENSION')}`}
                  disabled={this.state.enableActiveButton || this.state.inActivePage}
                  onClick={() => this.setState({ visible: true })}
                />
              </Grid>
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
                      ? `${t('EDIT_TIMEDIMENSION')}`
                      : `${t('ADD_TIMEDIMENSION')}`}
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
              <AddOrUpdateTimeDimension
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

const ComponentTranslated = withTranslation()(timedimension);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;