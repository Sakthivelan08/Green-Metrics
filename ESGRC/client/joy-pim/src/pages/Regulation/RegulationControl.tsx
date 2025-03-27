import React, { Suspense } from 'react';
import { Icon, Modal, Stack } from '@fluentui/react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import { IconButton } from '@fluentui/react/lib/Button';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { AddButton, columnHeader, PIMcontentStyles, PIMsearchBoxStyles } from '@/pages/PimStyles';
import { FileParameter, IGetMetricGroup, Metric } from '@/services/ApiClient';
import EnterMetricNameLabel from '../Metrics/AddorUpdateMetricts';
import ChooseMetricType from '../Metrics/ChooseType';
import { withRouter } from 'react-router-dom';
import { RegulationTypeEnum } from '../enumCommon';
import UpdateFormula from './UpdateFormula';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { BlockBlobClient } from '@azure/storage-blob';
import UploadData from '../Compliance/UploadData';

class RegControls extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  url = new URL(window.location.href);

  constructor(props: any) {
    super(props);
    this.state = {
      searchKey: '',
      currentRecord: [],
      currentRecord1: [],
      isRecord: true,
      expandedRows: [],
      regulationData: {},
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
      selectedregulationtype2: '',
      selectedMetrics: [],
      showUpdateFormulaModal: false,
      selectedRecordId: null,
      timeDimensions: [],
      selectedTimeDimension: '',
      selectedFormula: '',
      disableUpdateButton: true,
      visibleExcel: false,
      groupid: this.url.searchParams.get('id'),
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
    this.fetchRegulationsByGroupId;
    await this.fetchTimeDimensions();
  }

  async refresh() {
    const { groupId } = this.props.location.state;
    try {
      this.setState({
        currentRecord: [],
        searchKey: '',
        regulationData: {},
      });
      const regulationtypeid = RegulationTypeEnum.Control;
      const response = await this.apiClient.getActiveRegulationWithCount(regulationtypeid);
      if (response && response.result) {
        const regulationData = response.result.map((item: IGetMetricGroup) => ({
          regulation: item.name,
          metricCount: item.metricCount,
          groupId: item.groupId,
          regulationtypeid: item.regulationtypeid,
        }));

        const filteredRegulationData = regulationData.filter((item: any) => item.groupId === groupId);

        this.setState({
          currentRecord: filteredRegulationData,
          copyRecord: filteredRegulationData,
          isRecord: filteredRegulationData.length > 0,
        });


        const firstGroup = filteredRegulationData[0];
        if (firstGroup) {
          const firstGroupId = firstGroup.groupId;
          const firstRegulationTypeId = firstGroup.regulationtypeid;

          if (firstGroupId !== undefined && firstRegulationTypeId !== undefined) {
            const regulations = await this.fetchRegulationsByGroupId(
              firstGroupId,
              firstRegulationTypeId,
            );
            this.setState({ regulationData: regulations });
          } else {
            console.warn('Group ID or Regulation Type ID is undefined.');
          }
        }
      } else {
        this.setState({ currentRecord: [], isRecord: false });
      }
    } catch (error) {
      console.error(error);
    }
    this.getdata()
  }
  async getdata() {
    try {
      const groupid = this.state.groupid;
      const apiResponseto: any = await (await this.apiClient.getUploadedFileLink(groupid));
      // Ensure the API response has the expected structure
      if (!apiResponseto || !Array.isArray(apiResponseto.result)) {
        console.error('Unexpected API response format:', apiResponseto);
        this.setState({ isRecord: false, currentRecord1: [] });
        return;
      }

      const result = apiResponseto.result;

      this.setState(
        {
          currentRecord1: result?.map((item: any, index: number) => ({
            index: index + 1,
            ...item,
          })),
          isRecord: result.length > 0,
        },
        () => {
          console.log('Updated currentRecord1:', this.state.currentRecord1);
        }
      );
    } catch (e: any) {
      console.error('Error fetching audit data:', e);
      this.notify.showErrorNotify(e.message);
      this.setState({ isRecord: false });
    }
  }


  fetchRegulationsByGroupId = async (groupId: number, regulationtypeid: number) => {
    const { parentid } = this.props.location.state;

    try {
      if (regulationtypeid === RegulationTypeEnum.Control) {
        const response = await this.apiClient.getRegulationsWithId(groupId, regulationtypeid);

        if (response && response.result) {
          const filteredRegulationData = response.result.filter((item: any) => item.parentid === parentid);

          return filteredRegulationData.map((regulation: any) => ({
            id: regulation.id,
            name: regulation.name,
            typeName: regulation.typeName || '-',
            metricsQuestion: regulation.metricsQuestion || 'No question available',
            timeDimension: regulation.timeDimension || '-',
            formulaeField: regulation.formulaeField || '-',
            value: regulation.value || '-',
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching regulation data:', error);
    }
    return [];
  };

  async fetchTimeDimensions() {
    try {
      const response = await this.apiClient.getTimeDimension();
      if (response && response.result) {
        this.setState({ timeDimensions: response.result });
      }
    } catch (error) {
      console.error('Error fetching time dimensions:', error);
    }
  }

  getTimeDimensionName(timeDimensionId: number): string {
    const { timeDimensions } = this.state;
    const timeDimension = timeDimensions.find((item: any) => item.id === timeDimensionId);
    return timeDimension ? timeDimension.name || '-' : '-';
  }

  onSearch(e: any) {
    const newValue = e?.target?.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });

    const { copyRecord } = this.state;

    if (newValue === '') {
      this.setState({
        currentRecord: copyRecord,
        isRecord: copyRecord.length > 0,
      });
      return;
    }

    const filteredRecord = copyRecord.filter((item: any) => {
      const regulation = item.regulation?.toLowerCase() || '';
      return regulation.includes(newValue);
    });

    this.setState({
      currentRecord: filteredRecord,
      isRecord: filteredRecord.length > 0,
    });
  }

  toggleRow = async (isExpanded: boolean, row: any) => {
    const { groupId, regulationtypeid } = row;

    if (isExpanded) {
      const data = await this.fetchRegulationsByGroupId(groupId, regulationtypeid);
      this.setState((prevState: any) => ({
        regulationData: {
          ...prevState.regulationData,
          [groupId]: data,
        },
        expandedRows: [...prevState.expandedRows, groupId],
      }));
    } else {
      this.setState((prevState: any) => ({
        expandedRows: prevState.expandedRows.filter((id: any) => id !== groupId),
      }));
    }
  };

  handleCheckboxChange = (metricId: number, isChecked: boolean, timeDimension: string, formula: string) => {

    const { selectedMetrics } = this.state;
    if (isChecked) {
      this.setState({
        selectedMetrics: [...selectedMetrics, metricId],
        selectedTimeDimension: timeDimension,
        selectedFormula: formula,
        disableUpdateButton: false,
      });
    } else {
      this.setState({
        selectedMetrics: selectedMetrics.filter((id: number) => id !== metricId),
        selectedTimeDimension: '',
        selectedFormula: '',
        disableUpdateButton: true,
      });
    }
  };

  openUpdateFormulaModal = (metricId: number) => {
    const { selectedMetrics } = this.state;
    const selectedMetricIndex = selectedMetrics.indexOf(metricId);
    const selectedFormula = selectedMetricIndex >= 0 ? this.state.selectedFormula : '';
    const selectedTimeDimension = selectedMetricIndex >= 0 ? this.state.selectedTimeDimension : '';

    this.setState({
      showUpdateFormulaModal: true,
      selectedRecordId: metricId,
      selectedTimeDimension,
      selectedFormula,
    });
  };

  handleCloseUpdateFormulaModal = () => {
    this.setState({
      showUpdateFormulaModal: false,
      selectedRecordId: null,
      selectedMetrics: [],
      selectedTimeDimension: '',
      selectedFormula: '',
      disableUpdateButton: true,
    });
  };

  expandableRowsComponent = ({ data }: { data: any }) => {
    const { expandedRows, regulationData, selectedRows } = this.state;
    const { groupId } = data;

    const nestedColumns: any = [
      {
        selector: (row: any) => (
          <input
            type="checkbox"
            onChange={(e) =>
              this.handleCheckboxChange(row.id, e.target.checked, row.timeDimension, row.formulaeField)
            }
          />
        ),
        sortable: true,
        width: '6%',
      },
      {
        selector: (row: any) => <span title={row.metricsQuestion}>{row.metricsQuestion}</span>,
        sortable: true,
        width: '25%',
      },
      {
        selector: (row: any) => <span title={row.typeName}>{row.typeName}</span>,
        sortable: true,
        width: '15%',
      },
      {
        selector: (row: any) => {
          const timeDimensionName = this.getTimeDimensionName(row.timeDimension);
          return <span title={timeDimensionName}>{timeDimensionName}</span>;
        },
        sortable: true,
        width: '17%',
      },
      {
        selector: (row: any) => <span title={row.formulaeField}>{row.formulaeField}</span>,
        sortable: true,
        width: '17%',
      },

    ];

    return expandedRows.includes(groupId) && regulationData[groupId] ? (
      <DataTable
        columns={nestedColumns}
        data={regulationData[groupId]}
        noHeader
        striped
        highlightOnHover
        responsive
        fixedHeader
        fixedHeaderScrollHeight="30.03vh"
        pagination={false}
        className="nestedDataTable"
        style={{ margin: 0, padding: 0 }}
      />
    ) : null;
  };

  handleCreateNewClick = () => {
    this.setState({ showMetricTypeChooser: true });
  };

  handleMetricTypeSelected = (type: number) => {
    this.setState({ selectedType: type });
  };

  handleNextClick = () => {
    this.setState({ showMetricTypeChooser: true, showNameLabelModal: true });
  };

  handleCreatePreviousClick = () => {
    this.setState({ showMetricTypeChooser: true, showNameLabelModal: false });
  };

  handleLookupSave(data: { lookupTable: string; lookupTableColumn: string }): void {
    this.setState({ data: data });
    this.handleNextClick();
  }

  handleTypePreviousClick = () => {
    this.setState({ showMetricTypeChooser: false });
    this.refresh();
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
    const validationIds = selectedValidationid.join(',');
    const { parentid } = this.props.location.state;
    const data: any = new Metric({
      name,
      metricsQuestion,
      typeId: this.state.selectedType,
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
      parentid,
    });
    try {
      const { id, name, groupId } = this.props.location.state;
      await this.apiClient.createMetric(data);
      this.notify.showSuccessNotify(this.props.t('ADDED_SUCCESSFULLY'));
      this.props.history.push({
        pathname: `/metrics/regulation/Controls`,
        search: `?id=${id}&parentid=${parentid}&groupid=${groupId}`,
        state: { id: id, name: name, parentid, groupId: groupId },
      });
    } catch (error: any) {
      this.notify.showErrorNotify(error);
    }
  };

  handleCloseNameLabelModal = () => {
    this.setState({ showNameLabelModal: false });
  };
  async onUpload(files: File[], _assessmentId: string) {
    try {
      if (!files || files.length === 0) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-NO-FILE-SELECTED'));
        return;
      }

      const file = files[0];
      const fileName = file?.name;
      const groupid = this.state.groupid; // Renamed from assessId

      if (!fileName) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-INVALID-FILENAME'));
        return;
      }

      if (groupid === null || groupid === undefined) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-TEMPLATEID-NOT-FOUND'));
        return;
      }

      // Get upload URL
      const uriResponse = await this.apiClient.getAuthorizedUrlForWrite(fileName);
      const uri = uriResponse?.result;

      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }

      // Upload file to Azure Blob Storage
      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(file, {
        onProgress: (progress) => {
          const progressPercent = Math.round((progress.loadedBytes / file.size) * 100);
          this.setState({ progressPercent });
        },
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      // Prepare file for API request
      const fileParameter: FileParameter = {
        data: file,
        fileName: fileName,
      };

      // Call API to save metadata
      const response = await this.apiClient.uploadPdfFile(groupid, fileParameter);
      if (response?.hasError) {
        this.notify.showErrorNotify(response.message || this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
      } else {
        this.notify.showSuccessNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-SUCCESS'));
      }
      this.setState({})
    } catch (error) {
      console.error('File upload error:', error);
      this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
    }
  }


  UploadPicture = async (file: any, id: any) => {
    try {
      this.setState({ imageProgress: false });
      console.log(this.state.selectedTemplate);
      this.onUpload(file, id);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };


  render() {
    const { showNameLabelModal, selectedRecordId } = this.state;
    const { selectedMetrics, showUpdateFormulaModal, disableUpdateButton } = this.state;
    const isUpdateButtonEnabled = selectedMetrics.length > 0;
    const { t } = this.props;



    const columns: any = [
      {
        key: 'url',
        name: <div className={columnHeader}>{t('COL_CONTROL')}</div>,
        selector: (row: any) => {
          const a = this;
          return (
            <a href={row?.blobUrl} target="_blank" rel="noopener noreferrer" title={row?.blobUrl}>
              {row?.blobUrl}
            </a>
          )
        },
        sortable: true,
        width: '25%',
      },
    ];



    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Grid
            item
            container
            spacing={-4}
            direction={'row'}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack></Stack>

            <Grid item container spacing={2} justifyContent={'flex-end'} >
              {!this.state.showMetricTypeChooser && !this.state.showNameLabelModal && (
                <Grid item lg={2.7} xs={1}>
                  <DefaultButton
                    iconProps={{ iconName: 'Upload' }}
                    className="uploaddownload-button"
                    text={t('Evidence')}
                    onClick={() =>
                      this.setState({
                        visibleExcel: true
                      })
                    }
                  />
                </Grid>
              )}


            </Grid>
          </Grid>

          <Modal
            isOpen={this.state.visibleExcel}
            containerClassName={PIMcontentStyles.ExcelContainer}
            onDismiss={() => this.setState({ visibleExcel: false })}
          >
            <div className={PIMcontentStyles.header}>
              <span className="modelHeaderText1">{t('UPLOAD')}</span>
            </div>
            <div className={PIMcontentStyles.body}>

              <UploadData
                ClosePopup={() => this.setState({ visibleExcel: false })}
                UploadData={(file: any, templateId: any) => this.UploadPicture(file, this.state.groupid)}
                Row={this.state?.name}
              />
            </div>
          </Modal>

          {this.state.showMetricTypeChooser && !this.state.showNameLabelModal ? (
            <div className='scrollableContent1'>
              <ChooseMetricType
                onMetricTypeSelected={this.handleMetricTypeSelected}
                onPrevious={this.handleTypePreviousClick}
                onNext={this.handleNextClick}
                onLookUpSave={(data) => this.handleLookupSave(data)}
              />
            </div>
          ) : showNameLabelModal ? (
            <div className='scrollableContent1'>
              <EnterMetricNameLabel
                onSave={this.handleSaveNameLabel}
                onPrevious={this.handleCreatePreviousClick}
                selectedRegulationType={this.state.selectedregulationtype2}
              />
            </div>
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
                <Grid item lg={2.8} xs={1}>
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

                <Grid item lg={0} xs={1} container justifyContent="flex-end">
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
                {this.state.currentRecord1 && this.state.currentRecord1.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={this.state.currentRecord1}
                    keyField="groupId"
                    highlightOnHover
                    responsive
                    fixedHeader
                    striped
                    fixedHeaderScrollHeight="68.03vh"
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

            </div>
          )}
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(withRouter(RegControls));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;