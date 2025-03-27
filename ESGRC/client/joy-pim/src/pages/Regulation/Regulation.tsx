import React, { Suspense } from 'react';
import { Icon, Modal, Stack } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { BlockBlobClient } from '@azure/storage-blob';
import { baseUrl } from '@/services/Constants';
import {
  AddButton,
  columnHeader,
  hyperlink,
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '@/pages/PimStyles';
import { Link, withRouter } from 'react-router-dom';
import { FileParameter, IGetMetricGroup, Metric } from '@/services/ApiClient';
import { RegulationTypeEnum } from '../enumCommon';
import { t } from 'i18next';
import ChooseMetricType from '../Metrics/ChooseType';
import EnterMetricNameLabel from '../Metrics/AddorUpdateMetricts';
import UploadData from '../Compliance/UploadData';
import { Display } from '@fluentui/react-components';

class Regulation extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      searchKey: '',
      currentRecord: [],
      currentRecord1: [],
      isRecord: true,
      regulationData: {},
      expandedRows: [],
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
      selectedPrefix: 0,
      selectedCategory: 0,
      selectedStandard: 0,
      selectedDepartment: 0,
      selectedregulationtype: 0,
      selectedServices: 0,
      isKeyIndicator: true,
      id: 0,
      parentid: null,
      groupId: null,
      selectedregulationtype1: '',
      visible: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
    this.fetchRegulationsByGroupId;
  }

  // async refresh() {
  //   try {
  //     this.setState({
  //       currentRecord: [],
  //       searchKey: '',
  //     });
  //     const regulationtypeid = RegulationTypeEnum.Regulation;
  //     const response = await this.apiClient.getActiveRegulationWithCount(regulationtypeid);
  //     if (response && response.result) {
  //       const regulationData = response.result.map((item: IGetMetricGroup) => ({
  //         regulation: item.name,
  //         metricCount: item.metricCount,
  //         groupId: item.groupId,
  //         regulationtypeid: item.regulationtypeid,
  //       }));

  //       this.setState({
  //         currentRecord: regulationData,
  //         copyRecord: regulationData,
  //         isRecord: regulationData.length > 0,
  //       });

  //       const firstGroup = regulationData[0];
  //       if (firstGroup) {
  //         const firstGroupId = firstGroup.groupId;
  //         const firstRegulationTypeId = firstGroup.regulationtypeid;
  //         if (firstGroupId !== undefined && firstRegulationTypeId !== undefined) {
  //           const regulations = await this.fetchRegulationsByGroupId(
  //             firstGroupId,
  //             firstRegulationTypeId,
  //           );
  //           this.setState({ regulationData: regulations });
  //         } else {
  //           console.warn('Group ID or Regulation Type ID is undefined.');
  //         }
  //       }
  //     } else {
  //       this.setState({ currentRecord: [], isRecord: false });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });

      const apiResponse1: any = (await this.apiClient.getMetricDetails()).result;
      this.setState(
        {
          currentRecord1: apiResponse1?.map((item: any, index: any) => ({
            index: index + 1,
            ...item,
          })),
          copyRecord: apiResponse1?.map((item: any, index: any) => ({
            index: index + 1,
            ...item,
          })),
        },
        () => {
        }
      );
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
  }

  fetchActiveUsers = async () => {
    try {
      const userResponse = await this.apiClient.activeUsers();
      const activeUsersMap = new Map<number, string>();
      userResponse.result?.forEach((user: any) => {
        activeUsersMap.set(user.id, user.name);
      });
      this.setState({ activeUsersMap });
      return userResponse.result || [];
    } catch (e: any) {
      console.error(e.message);
      return [];
    }
  };

  fetchRegulationsByGroupId = async (groupId: number, regulationtypeid: number) => {
    try {
      if (regulationtypeid === RegulationTypeEnum.Regulation) {
        const response = await this.apiClient.getRegulationsWithId(groupId, regulationtypeid);

        if (response && response.result) {
          await this.fetchActiveUsers();
          const regulations = response.result.map((regulation: any) => {
            const createdByName = this.state.activeUsersMap.get(regulation.createdBy) || '';

            return {
              id: regulation.id,
              parentid: regulation.parentid,
              groupId: regulation.groupId,
              name: regulation.name,
              typeName: regulation.typeName || '-',
              metricsQuestion: regulation.metricsQuestion || 'No question available',
              serviceName: regulation.serviceName,
              createdByName,
            };
          });

          if (regulations.length > 0) {
            this.setState({
              id: regulations[0].id,
              parentid: regulations[0].parentid,
              groupId: regulations[0].groupId,
            });
          }

          return regulations;
        }
      }
    } catch (error) {
      console.error('Error fetching regulation data:', error);
    }
    return [];
  };

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

  handleMetricTypeSelected = (type: number) => {
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
    selectedPrefix: number | undefined,
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
      selectedPrefix,
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
      prefix: selectedPrefix,
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
      this.props.history.push('/metrics/regulation');
    } catch (error: any) {
      this.notify.showErrorNotify(error);
    }
  };


  downloadMetricTemplate = async () => {
    try {
      const format = 'xml';
      const url = `${baseUrl}/api/Metric/DownloadMetricTemplate`;
      await this.apiClient.downloadMetricTemplate();

      const fileName = `metric_template.${format}`;
      this.downloadFileCommonTemplate(url, fileName);
    } catch (error: any) {
      console.error('Error downloading metric template:', error);
    }
  };

  downloadFileCommonTemplate(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  uploadMetricTemplate = async (files: any) => {
    try {
      if (!files) return;
      const file = files[0];
      if (!file) return;

      const fileName = file.name;
      const uri = (await this.apiClient.getAuthorizedUrlForWrite(fileName || ''))?.result;

      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }

      const uploadData: FileParameter = {
        data: file,
        fileName: fileName,
      };

      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(file, {
        onProgress: (observer) => {
          const progress = Math.round((observer.loadedBytes / file.size) * 100);
          this.setState({ progressPercent: progress });
        },
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      const response = await this.apiClient.uploadMetricTemplate(uploadData);

      if (response.hasError) {
        this.notify.showErrorNotify(
          response.message || this.props.t('MSG-METRIC-UPLOAD-COMMON-ERROR'),
        );
      } else {
        this.notify.showSuccessNotify(this.props.t('MSG-METRIC-UPLOAD-COMMON-SUCCESS'));
      }
    } catch (error: any) {
      this.notify.showErrorNotify(this.props.t('MSG-METRIC-UPLOAD-COMMON-ERROR'));
    }
  };

  UploadPicture = async (file: any, id: any) => {
    try {
      this.setState({ imageProgress: false });
      console.log(this.state.selectedTemplate);
      this.uploadMetricTemplate(file);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };


  expandableRowsComponent = ({ data }: { data: any }) => {
    const { expandedRows, regulationData } = this.state;
    const { groupId } = data;

    // const nestedColumns = [
    //   {
    //     selector: (row: any) => row.metric,
    //     sortable: true,
    //     width: '4%',
    //   },
    //   // {
    //   //   selector: (row: any) => row.metricsQuestion,
    //   //   sortable: true,
    //   //   cell: (row: any) => (
    //   //     <Link
    //   //       className={hyperlink}
    //   //       to={{
    //   //         pathname: `/metrics/regulation/Controls`,
    //   //         search: `?id=${row.id}&parentid=${row.parentid}&groupId=${row.groupId}`,
    //   //         state: {
    //   //           id: row.id,
    //   //           name: row.metricsQuestion,
    //   //           parentid: row.parentid,
    //   //           groupId: row.groupId,
    //   //         },
    //   //       }}
    //   //       onClick={() =>
    //   //         this.setState({ id: row.id, parentid: row.parentid, groupId: row.groupId })
    //   //       }
    //   //     >
    //   //       <span title={row.metricsQuestion}>{row.metricsQuestion}</span>
    //   //     </Link>
    //   //   ),
    //   //   width: '40%',
    //   // },
    //   // {
    //   //   selector: (row: any) => <span title={row.serviceName}>{row.serviceName}</span>,
    //   //   sortable: true,
    //   //   width: '20%',
    //   // },
    //   {
    //     selector: (row: any) => <span title={row.createdby}>{row.createdby}</span>,
    //     sortable: true,
    //     width: '20%',
    //   },
    //   {
    //     selector: (row: any) => <span title={row.datatype}>{row.datatype}</span>,
    //     sortable: true,
    //     width: '10%',
    //   },
    // ];   

  };

  render() {
    const { showNameLabelModal } = this.state;
    const { t } = this.props;

    // const columns: any = [
    //   {
    //     key: 'regulation',
    //     name: <div className={columnHeader}>{t('COL_REGULATION')}</div>,
    //     selector: (row: any) => {
    //       const regulation = row.regulation || '';
    //       const metricCount = row.metricCount || 0;

    //       if (!regulation && !metricCount) {
    //         return '';
    //       }
    //       return `${regulation} (${metricCount})`;
    //     },
    //     width: '40%',
    //   },
    //   // {
    //   //   key: 'serviceName',
    //   //   name: <div className={columnHeader}>{t('COL_SERVICE_NAME')}</div>,
    //   //   width: '20%',
    //   // },
    //   {
    //     key: 'createdBy',
    //     name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
    //     width: '20%',
    //   },
    //   {
    //     key: 'typeName',
    //     name: <div className={columnHeader}>{t('METRIC_TYPE')}</div>,
    //     width: '12%',
    //   },
    // ];
    const nestedColumns = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        name: <div className={columnHeader}>{t('COL_ATTRIBUTES')}</div>,
        selector: (row: any) => row.metric,
        sortable: true,
        width: '20%',
      },
      {
        name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
        selector: (row: any) => row.createdby,
        sortable: true,
        width: '20%',
        cell: (row: any) => <span title={row.createdby}>{row.createdby}</span>,
      },
      {
        name: <div className={columnHeader}>{t('METRIC_TYPE')}</div>,
        selector: (row: any) => row.datatype, // Returns primitive value
        sortable: true,
        width: '10%',
        cell: (row: any) => <span title={row.datatype}>{row.datatype}</span>,
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/regulation`} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_REGULATIONS')}
          </Link>

          <Grid
            item
            container
            spacing={-4}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack>
              <Text
                className="color-blue text"
                key="xxLarge"
                variant={'xxLarge' as ITextProps['variant']}
                styles={PIMHearderText}
                nowrap
                block
              >
                {t('SUBMENU_REGULATIONS')}
              </Text>
            </Stack>

            {!this.state.showMetricTypeChooser && !this.state.showNameLabelModal && (
              <Grid item lg={12} xs={12} className="button-containers ">

                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'Download' }}
                  text="Download Template"
                  onClick={() => this.downloadMetricTemplate()}
                />

                <DefaultButton
                  iconProps={{ iconName: 'Upload' }}
                  className="button"
                  styles={AddButton}
                  text={t('Upload Template')}
                  onClick={() =>
                    this.setState({
                      visible: true,
                    })
                  }
                />

                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'CircleAddition' }}
                  text={`${t('ADD_REGULATION')}`}
                  onClick={() =>
                    this.setState({
                      showMetricTypeChooser: true,
                      selectedregulationtype1: RegulationTypeEnum.Regulation,
                    })
                  }
                />
              </Grid>
            )}
          </Grid>

          {this.state.showMetricTypeChooser && !this.state.showNameLabelModal ? (
            // <div className='scrollableContent1'>
            <ChooseMetricType
              onMetricTypeSelected={this.handleMetricTypeSelected}
              onPrevious={this.handleTypePreviousClick}
              onNext={this.handleNextClick}
              onLookUpSave={(data) => this.handleLookupSave(data)}
            />
          ) : // </div>
            showNameLabelModal ? (
              <div className="scrollableContent2">
                <EnterMetricNameLabel
                  onSave={this.handleSaveNameLabel}
                  onPrevious={this.handleCreatePreviousClick}
                  selectedRegulationType={this.state.selectedregulationtype2}
                />
              </div>
            ) : (
              <div>
                <Grid lg={12} item container spacing={1} direction="row">
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
                      title={t('BTN_REFRESH')}
                      className="iconStyle iconStyle1"
                      onClick={() => this.refresh()}
                    />
                  </Grid>
                </Grid>

                <Modal
                  isOpen={this.state.visible}
                  containerClassName={PIMcontentStyles.ExcelContainer}
                  onDismiss={() => this.setState({ visible: false })}
                >
                  <div className={PIMcontentStyles.header}>
                    <span className="modelHeaderText1">{t('UPLOAD')}</span>
                  </div>
                  <div className={PIMcontentStyles.body}>
                    <UploadData
                      ClosePopup={() => this.setState({ visible: false })}
                      UploadData={(file: any, id: any) => this.UploadPicture(file, id)}
                      Row={this.state.name}
                    />
                  </div>
                </Modal>

                <Card>
                  {this.state.currentRecord1 && this.state.currentRecord1.length > 0 ? (
                    <DataTable
                      columns={nestedColumns}
                      data={this.state.currentRecord1}
                      pagination
                      selectableRowsHighlight
                      highlightOnHover
                      responsive
                      fixedHeader
                      striped
                      fixedHeaderScrollHeight="68.03vh"
                    // selectableRows
                    // clearSelectedRows={true}
                    // striped
                    // highlightOnHover
                    // responsive
                    // pagination={false}
                    // style={{ margin: 0, padding: 0 }}
                    />
                  ) : (
                    <div className="noDataWidth">
                      <DataTable columns={nestedColumns} data={[{ '': '' }]} />
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

const ComponentTranslated = withTranslation()(withRouter(Regulation));
function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
