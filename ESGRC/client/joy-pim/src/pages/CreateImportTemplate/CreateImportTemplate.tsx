import React, { Suspense } from 'react';
import {
  DatePicker,
  DefaultButton,
  Dropdown,
  Icon,
  IDropdownOption,
  Modal,
  Stack,
} from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { columnHeader, PIMcontentStyles, PIMHearderText } from '@/pages/PimStyles';
import { Link } from 'react-router-dom';
import UploadData from '../Compliance/UploadData';
import { baseUrl } from '@/services/Constants';
import { BlockBlobClient } from '@azure/storage-blob';
import { FileParameter } from '@/services/ApiClient';

class CreateImportTemplate extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      isRecord: true,
      dropdownOptions: [],
      dropdownOptions1: [],
      selectedDropdownValue: null,
      selectedDropdownValue1: null,
      selectedTemplateId: null,
      selectedTemplate: null,
      visible: false,
      months: [],
      startDate: null,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
  }
  
  async refresh() {
    try {
      await Promise.all([this.fetchDropdownData(), this.fetchMonths()]);
  
      const metricGroupId = this.state.selectedDropdownValue;
      if (metricGroupId) {
        // await this.fetchData(metricGroupId);
      }
    } catch (error: any) {
      console.error('Error during refresh:', error);
      this.notify.showErrorNotify(error.message);
    }
  }
  
  async fetchDropdownData() {
    try {
      const apiResponse = await this.apiClient.getActiveMetricGroupsWithCount();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.groupId,
          text: item.name,
        })) || [];
      this.setState({ dropdownOptions: options });
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      this.notify.showErrorNotify(e.message);
    }
  }
  
  async fetchMonths() {
    try {
      const apiResponse = await this.apiClient.getMonth();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.name,
          text: item.name,
        })) || [];
      this.setState({ dropdownOptions1: options });
    } catch (e: any) {
      console.error('Error fetching months:', e);
      this.notify.showErrorNotify(e.message);
    }
  }  

  // async componentDidMount(): Promise<void> {
  //   await this.refresh();
  // }

  // async refresh() {
  //   await this.fetchDropdownData();
  //   const metricGroupId = this.state.selectedDropdownValue;
  //   if (metricGroupId) {
  //     // await this.fetchData(metricGroupId);
  //   }
  //   await this.fetchMonths();
  // }

  // async fetchDropdownData() {
  //   try {
  //     const apiResponse = await this.apiClient.getActiveMetricGroupsWithCount();
  //     const options =
  //       apiResponse?.result?.map((item: any) => ({
  //         key: item.groupId,
  //         text: item.name,
  //       })) || [];
  //     this.setState({ dropdownOptions: options });
  //   } catch (e: any) {
  //     console.error('Error fetching dropdown data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }

  // async fetchData(metricGroupId: number) {
  //   try {
  //     const apiResponse = await this.apiClient.listMetricGroupTemplate(metricGroupId);
  //     const data = apiResponse?.result || [];
  //     if (data.length > 0) {
  //       const formattedData = data.map((item: any, index: number) => ({
  //         index: index + 1,
  //         ...item,
  //       }));
  //       this.setState({ currentRecord: formattedData, isRecord: true });
  //     } else {
  //       this.setState({ currentRecord: [], isRecord: false });
  //     }
  //   } catch (e: any) {
  //     console.error('Error fetching data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }

  // handleDropdownChange = async (
  //   event: React.FormEvent<HTMLDivElement>,
  //   option?: IDropdownOption,
  // ) => {
  //   if (option?.key !== undefined) {
  //     this.setState({ selectedDropdownValue: option.key });
  //     await this.fetchData(Number(option.key));
  //     this.fetchMonths();
  //   } else {
  //     console.error('Selected option has no key:', option);
  //   }
  // };

  // async fetchMonths() {
  //   try {
  //     const apiResponse = await this.apiClient.getMonth();
  //     const options =
  //       apiResponse?.result?.map((item: any) => ({
  //         key: item.name,
  //         text: item.name,
  //       })) || [];
  //     this.setState({ dropdownOptions1: options });
  //   } catch (e: any) {
  //     console.error('Error fetching dropdown data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }

  handleMonthChange = async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue1: option.key });
      await this.fetchMonths();
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, index) => currentYear - index);
    return years.map((year) => ({
      key: year,
      text: year.toString(),
    }));
  }

  handleYearChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option?.key !== undefined) {
      this.setState({ startDate: option.key });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  downloadTemplate = async (id: number) => {
    try {
      const { selectedDropdownValue1, startDate } = this.state;
      if (!selectedDropdownValue1 && !startDate) {
        this.notify.showErrorNotify('Please select month and year.');
        return;
      } else if (!selectedDropdownValue1) {
        this.notify.showErrorNotify('Please select a month.');
        return;
      } else if (!startDate) {
        this.notify.showErrorNotify('Please select a year.');
        return;
      }

      const format = 'xlsx';
      const token = this.token;
      const month = this.state.selectedDropdownValue1.toString();
      const year = this.state.startDate.toString();

      const url = `${baseUrl}/api/Template/DownloadMetricGroupTemplate?metricGroupId=${id}&month=${month}&year=${year}&token=${token}`;
      // await this.apiClient.downloadMetricGroupTemplate(id, month, year, format);

      const fileName = `template_${id}.xlsx`;
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

  async onUpload(files: any, id: any) {
    try {
      if (!this.state.selectedDropdownValue1 || !this.state.startDate) {
        this.notify.showErrorNotify(this.props.t('SELECT_MONTH_AND_YEAR_FIRST'));
        return;
      }

      if (!files) return;
      let f: any = files[0];
      let fileName = f?.name;
      const uri = (await this.apiClient.getAuthorizedUrlForWrite(fileName || ''))?.result;

      if (!uri) {
        this.notify.showErrorNotify(this.props.t('MSG-DATA-FILEUPLOAD-URL-NOT-FOUND'));
        return;
      }

      const uploadData: FileParameter = {
        data: f,
        fileName: fileName,
      };

      const blobClient = new BlockBlobClient(uri);
      await blobClient.uploadData(f, {
        onProgress: (observer) => {
          const progress = Math.round((observer.loadedBytes / f.size) * 100);
          this.setState({ progressPercent: progress });
        },
        blobHTTPHeaders: {
          blobContentType: f.type,
        },
      });

      const response = await this.apiClient.uploadMetricGroupTemplatefile(
        this.state.selectedDropdownValue,
        this.state.selectedDropdownValue1,
        this.state.startDate,
        uploadData,
      );

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

  UploadPicture = async (file: any, id: any) => {
    try {
      this.setState({ imageProgress: false });
      this.onUpload(file, id);
    } catch (error: any) {
      this.setState({ imageProgress: false });
    }
  };

  render() {
    const { currentRecord, dropdownOptions, dropdownOptions1 } = this.state;
    const { t } = this.props;

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'Name',
        name: <div className={columnHeader}>{t('COL_NAME')}</div>,
        selector: (row: any) => <span title={row.name}>{row.name}</span>,
        width: '20%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '22%',
        cell: (row: any) => {
          const isDisabled = row.id === 0 || !row.name;
          const cursorStyle = isDisabled ? 'not-allowed' : 'pointer';
          return (
            // this.state.currentRecord.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <DefaultButton
                className="uploaddownload-button"
                iconProps={{ iconName: 'Download' }}
                text="Download Template"
                onClick={() => this.downloadTemplate(row.id)}
                disabled={isDisabled}
                style={{ cursor: cursorStyle }}
              />
              <DefaultButton
                iconProps={{ iconName: 'Upload' }}
                className="uploaddownload-button"
                text={t('Upload Template')}
                onClick={() =>
                  this.setState({
                    selectedTemplateId: row.id,
                    selectedTemplate: row,
                    visible: true,
                    name: row,
                  })
                }
                disabled={isDisabled}
                style={{ cursor: cursorStyle }}
              />
            </div>
          );
          //);
        },
      },
      {
        key: 'month',
        name: <div className={columnHeader}>{t('COL_MONTH')}</div>,
        selector: (row: any, rowIndex: number) => {
          return (
            <Dropdown
              placeholder={t('Select Month')}
              options={dropdownOptions1}
              onChange={this.handleMonthChange}
              selectedKey={this.state.selectedDropdownValue1}
              styles={{ dropdown: { width: 150 } }}
            />
          );
        },
        width: '18%',
      },
      {
        key: 'year',
        name: <div className={columnHeader}>{t('COL_YEAR')}</div>,
        selector: (row: any, rowIndex: number) => (
          <Dropdown
            placeholder={t('Select Year')}
            options={this.generateYearOptions()}
            onChange={this.handleYearChange}
            selectedKey={this.state.startDate}
            styles={{
              dropdown: { width: 150 },
            }}
          />
        ),
        width: '18%',
      },
    ];

    const dummyRecord = [{ index: 1, name: 'Template', id: 0 }];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity/CreateImportTemplate`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_CREATE_IMPORT_TEMPLATE')}
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
                {t('SUBMENU_CREATE_IMPORT_TEMPLATE')}
              </Text>
            </Stack>
            <Grid item lg={2.1} xs={1}></Grid>
          </Grid>

          <Grid lg={12} item container spacing={1} direction={'row'}>
            <Grid item lg={2} xs={12}>
              <Dropdown
                placeholder={t('SELECT_METRIC_GROUP')}
                options={dropdownOptions}
                // onChange={this.handleDropdownChange}
                styles={{ dropdown: { width: 300 } }}
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
                className="iconStyle iconStyle1 icnstyl2"
                onClick={async () => {
                  this.setState({
                    selectedDropdownValue1: null,
                    startDate: null,
                  });
                  await this.fetchDropdownData();
                  const metricGroupId = this.state.selectedDropdownValue;
                  if (metricGroupId) {
                    // await this.fetchData(metricGroupId);
                  }
                  await this.fetchMonths();
                }}
              />
            </Grid>
          </Grid>
        </div>

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

        {/* {selectedDropdownValue !== null && ( */}
        <Card>
          {currentRecord?.length > 0 ? (
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
              paginationComponentOptions={{ rowsPerPageText: `${t('ROWS_PER_PAGE')}` }}
              noDataComponent={
                <div className="noDataWidth">
                  <DataTable columns={columns} data={[{ '': '' }]} />
                  <Stack className="noRecordsWidth">
                    {this.state.isRecord ? `${t('RECORDS')}` : `${t('NO_RECORDS')}`}
                  </Stack>
                </div>
              }
            />
          ) : (
            <div className="noDataWidth">
              <DataTable columns={columns} data={dummyRecord} disabled={true} pagination />
              <Stack className="noRecordsWidth">
                {/* {this.state.isRecord ? `${t('RECORDS')}` : `${t('NO_RECORDS')}`} */}
              </Stack>
            </div>
          )}
        </Card>
        {/* )} */}
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(CreateImportTemplate);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
