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
import { TemplateStageApprovalEnum } from '../enumCommon';
import { baseUrl } from '@/services/Constants';
import { UploadedFile } from '@/services/ApiClient';
import { BlockBlobClient } from '@azure/storage-blob';
import UploadData from '../Compliance/UploadData';
import AddOrUpdateGoalsetting from './AddorUpdateGoalsetting';

class Period extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      searchKey: '',
      currentRecord: [],
      isRecord: true,
      visible: false,
      isUploadModalVisible: false,
      selectedRowData: [],
      copyRecord: [],
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse = await this.apiClient.getGoalSetting();
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
    } finally {
      this.setState({ isRecord: false });
    }
  }

  onSearch(e: any) {
    var newValue = e?.target.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;
    const results = copyRecord.filter((element: any) => {
      const name = element?.name?.toLowerCase() || '';
      const yearName = element?.yearName?.toLowerCase() || '';
      return name.includes(newValue) || yearName.includes(newValue);
    });

    this.setState({
      currentRecord: results.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  async onUpload(files: any, templateId: any) {
    var tempId = this.state.selectedTemplate.templateId;
    try {
      if (!files) return;
      var f: any = files[0];
      var fileName = f?.name;
      const uri = (await this.apiClient.getAuthorizedUrlForWrite(fileName || ''))?.result;
      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }
      var uploadData = new UploadedFile();
      uploadData.blobUrl = uri;
      uploadData.name = fileName;
      uploadData.goalSettingId = this.state?.name?.id;
      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(f, {
        onProgress: (observer) => {
          var progress = Math.round((observer.loadedBytes / f.size) * 100);
          this.setState({ progressPercent: progress });
        },
        blobHTTPHeaders: {
          blobContentType: f.type,
        },
      });
      const response = await this.apiClient.uploadandValiadGoalSettings(uploadData);
      if (response.hasError) {
        this.notify.showErrorNotify(
          response.message || this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'),
        );
      } else {
        this.notify.showSuccessNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-SUCCESS'));
      }
    } catch (error) {
      this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-COMMON-ERROR'));
    }
  }

  UploadPicture = async (file: any, templateId: any) => {
    try {
      this.setState({ imageProgress: false });
      console.log(this.state.selectedTemplate);
      this.onUpload(file, templateId);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };

  downloadTemplate = async (templateId: number) => {
    try {
      const format = 'xlsx';
      const url = `${baseUrl}/api/Template/DownloadStandardData?format=${format}`;
      await this.apiClient.downloadStandardData(format);
      const fileName = `template_${templateId}.xlsx`;
      this.downloadFileCommonTemplate(url, fileName);
    } catch (error: any) {
      console.error('Error downloading template:', error);
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
        cell: (row: any) => <span title={row.name}>{row.name}</span>,
        sortable: true,
        sortFunction: (a: any, b: any) => (a?.name || '').localeCompare(b?.name || ''),
        width: '15%',
      },
      {
        key: 'yearName',
        name: <div className={columnHeader}>{t('COL_YEAR_NAME')}</div>,
        selector: (row: any) => <span title={row.yearName}>{row.yearName}</span>,
        cell: (row: any) => <span title={row.yearName}>{row.yearName}</span>,
        sortable: true,
        sortFunction: (a: any, b: any) =>
          (a?.yearName || '').toString().localeCompare(b?.yearName || ''),
        width: '12%',
      },
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '28%',
        cell: (row: any) => {
          const isSuccess = row.status === TemplateStageApprovalEnum.Success;
          return (
            this.state.currentRecord.length > 0 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {!isSuccess && (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <DefaultButton
                        iconProps={{ iconName: 'Upload' }}
                        className="uploaddownload-button"
                        text={`${t('Upload Template')}`}
                        onClick={() => {
                          this.setState({
                            selectedTemplateId: row.id,
                            selectedTemplate: row,
                            isUploadModalVisible: true,
                            name: row,
                          });
                        }}
                      />
                      <DefaultButton
                        className="uploaddownload-button"
                        iconProps={{ iconName: 'Download' }}
                        text="Download Template"
                        onClick={() => this.downloadTemplate(row.templateId)}
                      />
                    </div>
                  </>
                )}
              </div>
            )
          );
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/goalsetting`} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_GOAL_SETTING')}
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
                {t('SUBMENU_GOAL_SETTING')}
              </Text>
            </Stack>
            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ADD_SUBMENU_GOAL_SETTING')}`}
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
                      ? `${t('EDIT_SUBMENU_GOAL_SETTING')}`
                      : `${t('ADD_SUBMENU_GOAL_SETTING')}`}
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
              <AddOrUpdateGoalsetting
                SelectedPeriod={this.state.selectedRowData[0]}
                recordId={this.state.selectedRowData[0]?.id}
                ClosePopup={() => {
                  this.setState({ visible: false });
                  this.refresh();
                }}
              />
            </div>
          </Modal>
          <Modal
            isOpen={this.state.isUploadModalVisible}
            containerClassName={PIMcontentStyles.ExcelContainer}
            onDismiss={() => this.setState({ isUploadModalVisible: false })}
          >
            <div className={PIMcontentStyles.header}>
              <span className="modelHeaderText1">{t('UPLOAD')}</span>
            </div>
            <div className={PIMcontentStyles.body}>
              <UploadData
                ClosePopup={() => this.setState({ isUploadModalVisible: false })}
                UploadData={(file: any, templateId: any) => this.UploadPicture(file, templateId)}
                Row={this.state?.name}
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
