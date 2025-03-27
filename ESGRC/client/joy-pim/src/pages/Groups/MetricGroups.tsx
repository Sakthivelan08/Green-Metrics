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

class MetricGroups extends React.Component<any, any> {
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
  
      if (this.state.isHierarchy) {
        const apiResponse1: any = (
          await this.apiClient.listMetricGroupWithParent(this.state.groupid)
        ).result;
  
        this.setState({
          currentRecord: apiResponse1?.map((item: any, index: any) => ({
            index: index + 1,
            ...item,
          })),
          copyRecord: apiResponse1?.map((item: any, index: any) => ({
            index: index + 1,
            ...item,
          })),
        });
  
        await this.fetchDropdownData();
      }
  
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
  
  async fetchDropdownData() {
    try {
      const currentRecord = this.state.currentRecord;

      const apiResponse = await this.apiClient.getActiveMetricGroupsWithCount();
      const options = apiResponse?.result
        ?.filter((item: any) => !currentRecord.some((record: any) => record.id === item.groupId))
        .map((item: any) => ({
          key: item.groupId,
          text: item.name,
        })) || [];
  
      this.setState({ dropdownOptions: options });
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      this.notify.showErrorNotify(e.message);
    }
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
    const { divisionSelected, groupid, isHierarchy } = this.state;
    const ids = divisionSelected;
    try {
      if (ids && ids.length > 0 && groupid) {
        if (isHierarchy) {
          const dropdownData = await this.apiClient.getActiveMetricGroupsWithCount();
          const selectedGroupIds = dropdownData.result
            ?.filter((item: any) => ids.includes(item.groupId))
            .map((item: any) => item.groupId);
  
          if (!selectedGroupIds || selectedGroupIds.length === 0) {
            throw new Error(`${t('UNABLE_TO_FETCH_GROUPID')}`);
            return;
          }
          const response = await this.apiClient.updateParentId(groupid, selectedGroupIds);
          if (response?.hasError) {
            this.notify.showErrorNotify('response?.message');
          } else {
            this.notify.showSuccessNotify(`${t('UPDATED_SUCCESSFULLY')}`);
            this.setState({ divisionSelected: '' });
          }
        } else {
          this.notify.showErrorNotify(`${t('NOT_HIERARCHY,UNABLE_TO_SAVE')}`);
        }
      } else {
        this.notify.showErrorNotify(`${t('NO_DATA')}`);
      }
       await this.refresh();
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
      
      await this.apiClient.deleteParentMetricGroup(ids);
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
    const { currentRecord, isHierarchy } = this.state;
    const { t } = this.props;

    const columns: any = isHierarchy
      ? [
          {
            key: 'indexColumn',
            name: <div className={columnHeader}>{t('S_NO')}</div>,
            selector: (row: any) => row.index,
            width: '15%',
          },
          {
            key: 'nameColumn',
            name: <div className={columnHeader}>{t('NAME')}</div>,
            selector: (row: any) => <span title={row.name}>{row.name}</span>,
            minWidth: '200px',
          },
        ]
      : [
          {
            key: 'indexColumn',
            name: <div className={columnHeader}>{t('S_NO')}</div>,
            selector: (row: any) => row.index,
            width: '15%',
          },
          {
            key: 'metricsQuestion',
            name: <div className={columnHeader}>{t('COL_METRICQUESTIONS')}</div>,
            selector: (row: any) => <span title={row.metricsquestion}>{row.metricsquestion}</span>,
            minWidth: '200px',
          },
          {
            key: 'label',
            name: <div className={columnHeader}>{t('COL_TYPE')}</div>,
            selector: (row: any) => <span title={row.typeName}>{row.typeName}</span>,
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
                  fixedHeaderScrollHeight="50.03vh"
                  paginationComponentOptions={{
                    rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}`,
                  }}
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
                      onClick={() => this.setState({ isVisible: false })}
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

const ComponentTranslated: any = withTranslation()(MetricGroups);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
