import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import DataTable from 'react-data-table-component';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { Icon, Stack } from '@fluentui/react';
import { Link } from 'react-router-dom';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { withTranslation } from 'react-i18next';
import { Card, Grid, Tooltip } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import ChooseMetricType from '../Metrics/ChooseType';
import {
  AddButton,
  columnHeader,
  hyperlink,
  PIMdropdownStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '../PimStyles';
import AuthManagerService from '@/services/AuthManagerService';
import EnterMetricNameLabel from './AddorUpdateMetricts';
import { Metric } from '@/services/ApiClient';
import { t } from 'i18next';

class Metrics extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  isAuthenticated = this.authManager.isAuthenticated();
  user = this.isAuthenticated ? this.authManager.getUserData() : null;
  userId: any = this.user?.id || 0;
  stausofRecords = true;
  options: IDropdownOption[] = [
    { key: 0, text: 'Yes' },
    { key: 1, text: 'No' },
  ];
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
      showMetricTypeChooser: false,
      showNameLabelModal: false,
      selectedType: '',
      name: '',
      label: '',
      metricsQuestion: '',
      selectedMetric: 0,
      selectedValidationid: 0,
      selectedEsgrcType: 0,
      selectedUom: 0,
      selectedCategory: 0,
      selectedStandard: 0,
      selectedDepartment: 0,
      selectedregulationtype: 0,
      selectedServices: 0,
      isKeyIndicator: true,
      filterValue: '',
      showFilterDropdown: false,
      selectedregulationtype3:''
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, filterValue: '', currentRecord: [] });
      const apiResponse1: any = (await this.apiClient.getMetric()).result;
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
      return element?.metricsQuestion?.toLowerCase().includes(newValue.trim().toLowerCase());
    });

    this.setState({
      currentRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  handleCreateNewClick = () => {
    this.setState({ showMetricTypeChooser: true });
  };

  handleMetricTypeSelected = (type: Number) => {
    this.setState({ selectedType: type });
  };

  handleLookupSave(data: { lookupTable: string; lookupTableColumn: string }): void {
    this.setState({ data: data });
    this.handleNextClick();
  }

  handleTypePreviousClick = () => {
    this.setState({ showMetricTypeChooser: false });
  };

  handleCreatePreviousClick = () => {
    this.setState({ showMetricTypeChooser: true, showNameLabelModal: false });
  };

  handleNextClick = () => {
    this.setState({ showMetricTypeChooser: true, showNameLabelModal: true });
  };

  handleSaveNameLabel = async (
    name: string,
    metricsQuestion: string,
    selectedMetric: number,
    selectedValidationid: any,
    selectedEsgrcType: number,
    selectedUom: number,
    selectedCategory: number,
    selectedStandard: number,
    selectedDepartment: number,
    selectedregulationtype: number,
    selectedServices: number,
  ) => {
    this.setState({
      name: name,
      metricsQuestion: metricsQuestion,
      showNameLabelModal: false,
      selectedMetric,
      selectedValidationid,
      selectedEsgrcType,
      selectedUom,
      selectedCategory,
      selectedStandard,
      selectedDepartment,
      selectedregulationtype,
      selectedServices,
    });
    const validationIds: any = selectedValidationid.join(',');
    const data: any = new Metric({
      name: name,
      metricsQuestion: metricsQuestion,
      typeId: this.state?.selectedType,
      groupId: selectedMetric,
      validationId: validationIds,
      esgrcType: selectedEsgrcType,
      uom: selectedUom,
      category: selectedCategory,
      standard: selectedStandard,
      department: selectedDepartment,
      isKeyIndicator: this.state.isKeyIndicator,
      serviceid: selectedServices,
      regulationtypeid: selectedregulationtype,
    });
    try {
      await this.apiClient.createMetric(data);
      this.notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
      this.props.history.push('/metrics/metric');
    } catch (error: any) {
      this.notify.showErrorNotify(error);
    }
  };

  handleCloseNameLabelModal = () => {
    this.setState({ showNameLabelModal: false });
  };

  handleFilter = (value: string) => {
    this.setState({ filterValue: value, showFilterDropdown: false });
  };

  render() {
    const {
      currentRecord,
      showMetricTypeChooser,
      showNameLabelModal,
      showFilterDropdown,
      filterValue,
    } = this.state;
    const { t } = this.props;
    const filteredData = currentRecord.filter((item: { esgrcName: any }) => {
      return filterValue ? item.esgrcName === filterValue : true;
    });

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{`${t('S_NO')}`}</div>,
        selector: (row: any) => row.index,
        isVisible: true,
        maxWidth: '200px',
        width: '7%',
      },
      {
        key: 'metricsQuestion',
        name: <div className={columnHeader}>{t('COL_METRICQUESTIONS')}</div>,
        selector: (row: any) => row.metricsQuestion,
        width: '22%',
        cell: (row: any) => (
          <Link
            className={hyperlink}
            to={{
              pathname: `/metrics/metric/editmetric`,
              search: `?id=${row.id}`,
              state: { name: row.metricsQuestion },
            }}
          >
           <span title={row.metricsQuestion}>{row.metricsQuestion}</span>
          </Link>
        ),
        sortable: true,
        sortFunction: (a: any, b: any) => a?.metricsQuestion?.localeCompare(b?.metricsQuestion),
      },
      {
        key: 'typeName',
        name: <div className={columnHeader}>{t('METRIC_TYPE')}</div>,
        selector: (row: any) => <span title={row.typeName}>{row.typeName}</span>,
        width: '12%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.typeName?.localeCompare(b?.typeName),
      },
      {
        key: 'validationName',
        name: <div className={columnHeader}>{t('VALIDATION_LIST')}</div>,
        selector: (row: any) => <span title={row.validationName}>{row.validationName}</span>,
        width: '18%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.validationName?.localeCompare(b?.validationName),
      },
      {
        key: 'esgrc',
        name: (
          <div className={columnHeader}>
            {t('ESG')}
            <Icon
              iconName="Filter"
              onClick={() => this.setState({ showFilterDropdown: !showFilterDropdown })}
              style={{ marginLeft: '5px', cursor: 'pointer' }}
            />
            {showFilterDropdown && (
              <Dropdown
                placeholder="Select"
                options={[
                  { key: 'E', text: 'E' },
                  { key: 'S', text: 'S' },
                  { key: 'G', text: 'G' },
                ]}
                onChange={(e, option) => {
                  if (option) {
                    this.handleFilter(option.key as string);
                  }
                }}
                styles={PIMdropdownStyles}
              />
            )}
          </div>
        ),
        selector: (row: any) => <span title={row.esgrcName}>{row.esgrcName}</span>,
        width: '10%',
      },
      {
        key: 'uomName',
        name: <div className={columnHeader}>{t('UOM')}</div>,
        selector: (row: any) => <span title={row.uomName}>{row.uomName}</span>,
        width: '12%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.uomName?.localeCompare(b?.uomName),
      },
      {
        key: 'categoryName',
        name: <div className={columnHeader}>{t('CATEGORY')}</div>,
        selector: (row: any) => <span title={row.categoryName}>{row.categoryName}</span>,
        width: '12%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.categoryName?.localeCompare(b?.categoryName),
      },
      {
        key: 'standardName',
        name: <div className={columnHeader}>{t('STANDARD')}</div>,
        selector: (row: any) => <span title={row.standardName}>{row.standardName}</span>,
        width: '18%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.standardName?.localeCompare(b?.standardName),
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics`} className="headerText">
            {t('MENU_METRICS')}/{t('MENU_METRICS')}
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
                {t('MENU_METRICS')}
              </Text>
            </Stack>

            {!showMetricTypeChooser && !showNameLabelModal && (
              <Grid item lg={1.9} xs={1}>
                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'CircleAddition' }}
                  text={`${t('CREATE_MENU_METRICS')}`}
                  disabled={this.state.enableActiveButton || this.state.inActivePage}
                  onClick={() => this.setState({ showMetricTypeChooser: true })}
                />
              </Grid>
            )}
          </Grid>

          {showMetricTypeChooser && !showNameLabelModal ? (
            <ChooseMetricType
              onMetricTypeSelected={this.handleMetricTypeSelected}
              onPrevious={this.handleTypePreviousClick}
              onNext={this.handleNextClick}
              onLookUpSave={(data) => this.handleLookupSave(data)}
            />
          ) : showNameLabelModal ? (
            <EnterMetricNameLabel
              onSave={this.handleSaveNameLabel}
              onPrevious={this.handleCreatePreviousClick}
              selectedRegulationType={this.state.selectedregulationtype3}
            />
          ) : (
            <div>
              <Grid
                lg={12}
                item
                container
                spacing={1}
                direction={'row'}
                justifyContent="space-between"
              >
                <Grid item lg={2} xs={1}>
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

                <Grid item lg={0.5} xs={1} container justifyContent="flex-end">
                  <Icon
                    iconName="Refresh"
                    title={this.props.t('BTN_REFRESH')}
                    className="iconStyle iconStyle1"
                    onClick={() => this.refresh()}
                    style={{ marginRight: '8px' }}
                  />
                </Grid>
              </Grid>

              <Card>
                {this.state.currentRecord?.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination={true}
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
                          {this.state.isRecord === true
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
                      {this.state.isRecord === true
                        ? `${this.props.t('RECORDS')}`
                        : `${this.props.t('NO_RECORDS')}`}
                    </Stack>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(Metrics);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
