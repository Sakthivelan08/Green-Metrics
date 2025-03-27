import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import DataTable from 'react-data-table-component';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import {
  ComboBox,
  DefaultButton,
  IComboBox,
  IComboBoxOption,
  IconButton,
  Modal,
  Stack,
} from '@fluentui/react';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import {
  AddFam,
  CancelBtn,
  columnHeader,
  PIMcontentStyles,
  PIMdropdownStyles,
  PIMHearderText,
} from '../PimStyles';
import { iconButtonStyles, cancelIcon } from '@/common/properties';

class MaterialShow extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  stausofRecords = true;
  notify = new NotificationManager();
  url = new URL(window.location.href);

  constructor(props: any) {
    super(props);
    this.state = {
      A_D_Visible: false,
      isVisible: false,
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      copyRecord: [],
      searchKey: '',
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      groupid: this.url.searchParams.get('id'),
      isHierarchy: this.url.searchParams.get('isHierarchy') === 'true',
      dropdownOptions: [],
      selectedDropdownOptions: [],
      divisionSelected: [],
      deleteenable: false,
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true });
      const apiResponse1: any = (await this.apiClient.getMetricAnswerOptionsDetails(this.state.groupid)).result;
      const currentRecord = apiResponse1?.map((item: any, index: any) => ({
        index: index + 1,
        ...item,
      }));
      const copyRecord = [...currentRecord];
      const apiResponse2: any = (await this.apiClient.getMetric()).result;
      const dropdownOptions = [
        { key: 'selectAll', text: 'Select All' },
        ...apiResponse2
          .filter((metric: any) => !currentRecord.some((record: any) => record.metricId === metric.id))
          .map((item: any) => ({
            key: item.id,
            text: item.metricsQuestion,
          })),
      ];

      const filteredArray = [...apiResponse2
        .filter((metric: any) => {
          return !currentRecord.some((record: any) => record.id === metric.id)
        })
        .map((item: any) => ({
          key: item.id,
          text: item.metricsQuestion,
        }))]

      this.setState({
        currentRecord,
        copyRecord,
        dropdownOptions,
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
    this.setState({ selectedRowData: e.selectedRows, deleteenable: true });

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

  handleCreateNewClick = () => {
    this.setState({ showMetricTypeChooser: true });
  };

  handleMetricTypeSelected = (type: string) => {
    this.setState({ showMetricTypeChooser: false, visible: true });
  };

  OnSave = async () => {
    const { divisionSelected, groupid } = this.state;
    const ids = divisionSelected;
    try {
      if (ids && ids.length > 0 && groupid) {
        const response = await this.apiClient.updateMetric(ids, groupid);

        if (response?.hasError) {
          this.notify.showErrorNotify(`${t('METRICID_ALREADY_EXISTS')}`);
        } else {
          this.notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
        }

        this.setState({ divisionSelected: '' });
        await this.refresh();
      } else {
        this.notify.showErrorNotify(`${t('NO_DATA')}`);
      }
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  };


  OnDelete = async () => {
    try {
      const { selectedRowData } = this.state;
      this.setState({ isVisible: false });
      const ids = selectedRowData.map((e: any) => e.id);
      if (!ids) {
        throw new Error(`${t('NO_DIVISION_SELECTED')}`);
      }
      await this.apiClient.deleteMetric(ids);
      this.notify.showSuccessNotify(`${t('DELETED_SUCCESSFULLY')}`);
      this.refresh();
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  };

  handleDropdownChange = (
    e: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => {
    if (!option) return;

    const { dropdownOptions } = this.state;
    let updatedSelection: (string | number)[] = [];

    if (option.key === 'selectAll') {
      if (option.selected) {
        updatedSelection = dropdownOptions
          .filter((opt: IComboBoxOption) => opt.key !== 'selectAll')
          .map((opt: IComboBoxOption) => opt.key);
      } else {
        updatedSelection = [];
      }
    } else {
      const { divisionSelected } = this.state;
      if (option.selected) {
        updatedSelection = [...divisionSelected, option.key];
      } else {
        updatedSelection = divisionSelected.filter((key: string | number) => key !== option.key);
      }

      const allOptionsSelected = dropdownOptions
        .filter((opt: IComboBoxOption) => opt.key !== 'selectAll')
        .every((opt: IComboBoxOption) => updatedSelection.includes(opt.key));

      if (allOptionsSelected) {
        updatedSelection = [...updatedSelection, 'selectAll'];
      } else {
        updatedSelection = updatedSelection.filter((key) => key !== 'selectAll');
      }
    }

    this.setState({ divisionSelected: updatedSelection });
  };

  render() {
    const { currentRecord } = this.state;
    const { t } = this.props;

    const keyValueData = Object.entries(currentRecord[0]?.responseJson || {}).map(([key, value]) => ({
        key,
        value,
      }));
      const columns:any = [
        {
          key: 'Material',
          name: <div className={columnHeader}>Key</div>,
          selector: (row:any) => <span title={row.key}>{row.key}</span>,
          minWidth: '200px',
        },
        {
          key: 'value',
          name: <div className={columnHeader}>Value</div>,
          selector: (row:any) => <span title={row.value}>{row.value}</span>,
          minWidth: '200px',
        },
      ];
        
    return (
      <div className="layout width-100">
        <div className="bg-Color">
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
          <div className="d-flex align-item-center justify-content-end">
            <>
              <DefaultButton
                className="submitglobal"
                disabled={this.state.deleteenable === false}
                onClick={() => {
                  this.setState({ isVisible: true });
                }}
              >
                {t('ADD_BTN_DELETE')}
              </DefaultButton>
            </>
            <div>
              <ComboBox
                selectedKey={this.state.divisionSelected}
                className="dropdown"
                placeholder="Select options"
                multiSelect
                options={this.state.dropdownOptions}
                onChange={this.handleDropdownChange}
                //styles={PIMdropdownStyles}
                styles={{
                  ...PIMdropdownStyles,
                  callout: {
                    maxWidth: '200px',
                    minWidth: '700px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                  },
                }}
              />
            </div>
            <>
              <DefaultButton
                className="submitglobal"
                disabled={this.state.divisionSelected.length === 0}
                onClick={this.OnSave}
              >
                {t('ADD_BTN_SUBMIT')}
              </DefaultButton>
            </>
          </div>
          <div>
            <Card>
              {this.state.currentRecord.length > 0 && (
                <DataTable
                  columns={columns}
                  data={keyValueData}
                  //  pagination={true}
                  // selectableRows={this.state.selectedRowData}
                  // onSelectedRowsChange={this.rowSelection}
                  // clearSelectedRows={this.state.noSelection}
                  // selectableRowsHighlight
                  highlightOnHover
                  responsive
                  fixedHeader
                  striped
                  fixedHeaderScrollHeight="50.03vh"
                  // paginationComponentOptions={{
                  //   rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}`,
                  // }}
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
              )}
            </Card>

            <Modal
              isOpen={this.state.isVisible}
              containerClassName={PIMcontentStyles.confirmContaineruser}
              isBlocking={false}
              onDismiss={() => this.setState({ isVisible: false })}
            >
              <div className={PIMcontentStyles.confirmHeaderUser}>
                <IconButton
                  styles={iconButtonStyles}
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={() => this.setState({ isVisible: false })}
                />
              </div>
              <div className={PIMcontentStyles.confirmbody}>
                <Text variant="xLarge" className="apptext2">{`${t('CONFIRM_DELETE_METRIC')}`}</Text>
              </div>

              <div className={PIMcontentStyles.footer}>
                <Grid lg={12} item container spacing={2}>
                  <Grid item lg={1.5} xs={12} />
                  <Grid item lg={4} xs={12}>
                    <DefaultButton
                      className="button"
                      styles={AddFam}
                      text={`${t('BTN_CONFIRM')}`}
                      onClick={() => this.OnDelete()}
                    />
                  </Grid>
                  <Grid item lg={0.5} xs={12} />
                  <Grid item lg={4} xs={12}>
                    <DefaultButton
                      className="button"
                      styles={CancelBtn}
                      text={`${t('BTN_CANCEL')}`}
                      onClick={() => this.setState({ isVisible: false, selectedRowData: '' })}
                    />
                  </Grid>
                  <Grid item lg={2} xs={12} />
                </Grid>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(MaterialShow);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
