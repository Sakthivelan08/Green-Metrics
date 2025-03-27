import React, { Suspense } from 'react';
import { Dropdown, Icon, Stack } from '@fluentui/react';
import { Text } from '@fluentui/react/lib/Text';
import { withTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { columnHeader, PIMHearderText } from '@/pages/PimStyles';
import { Link } from 'react-router-dom';

class TableDataview extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      isRecord: true,
      dropdownOptions: [],
      dropdownOptions1: [],
      dropdownOptions2: [],
      selectedDropdownValue: null,
      selectedDropdownValue1: null,
      selectedDropdownValue2: null,
      visible: false,
      jsonData1: [],
      jsonData2: [],
      arrayfinaldata: [],
      mergedDatavalue: [],
    };
  }

  // async componentDidMount() {
  //   await this.refresh();
  // }

  // async refresh() {
  //   await this.fetchDropdownData();
  //   await this.fetchDropdownData1();
  //   await this.fetchDropdownData2();
  //   const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2 } = this.state;
  //   if (selectedDropdownValue && selectedDropdownValue1 && selectedDropdownValue2) {
  //     await this.fetchData(selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2);
  //   }
  // }

  // async fetchDropdownData() {
  //   try {
  //     const apiResponse = await this.apiClient.getActiveMetricGroupsWithCount();
  //     const options =
  //       apiResponse?.result?.map((item) => ({
  //         key: item.groupId,
  //         text: item.name,
  //       })) || [];
  //     this.setState({ dropdownOptions: options });
  //   } catch (e: any) {
  //     console.error('Error fetching dropdown data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }

  // async fetchDropdownData1() {
  //   try {
  //     const apiResponse = await this.apiClient.getYear();
  //     const options =
  //       apiResponse?.result?.map((item) => ({
  //         key: item.year,
  //         text: item.year,
  //       })) || [];
  //     this.setState({ dropdownOptions1: options });
  //   } catch (e: any) {
  //     console.error('Error fetching dropdown data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }
  // async fetchDropdownData2() {
  //   try {
  //     const apiResponse = await this.apiClient.getMonths();
  //     const options =
  //       apiResponse?.result?.map((item) => ({
  //         key: item.id,
  //         text: item.name,
  //       })) || [];
  //     this.setState({ dropdownOptions2: options });
  //   } catch (e: any) {
  //     console.error('Error fetching dropdown data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }

  // async fetchData(groupId: any, month: any, year: any) {
  //   try {
  //     const apiResponse = await this.apiClient.excelDataView(groupId, month, year);
  //     const data = apiResponse?.result || [];

  //     if (data.length > 0) {
  //       const rawData1 = JSON.parse(data[0].calculatedjson);
  //       const structuredData1: { stack: string; [key: string]: any }[] = [];
  //       for (let i = 0; i < rawData1.length; i += 2) {
  //         structuredData1.push({
  //           stack: rawData1[i],
  //           ...rawData1[i + 1],
  //         });
  //       }

  //       const mergedData1: { [key: string]: { [key: string]: any } } = {};
  //       structuredData1.forEach((entry) => {
  //         const stackName = entry.stack;
  //         mergedData1[stackName] = { ...mergedData1[stackName], ...entry };
  //       });

  //       const rawData2 = JSON.parse(data[0].data);
  //       const structuredData2: { stack: string; [key: string]: any }[] = [];
  //       for (let i = 0; i < rawData2.length; i += 2) {
  //         structuredData2.push({
  //           stack: rawData2[i],
  //           ...rawData2[i + 1],
  //         });
  //       }
  //       const mergedResult = structuredData2.map((item) => {
  //         const stackName = item.stack;
  //         const matchingData = mergedData1[stackName];

  //         if (matchingData) {
  //           return {
  //             ...item,
  //             ...matchingData,
  //           };
  //         }
  //         return item;
  //       });
  //       const cleanedResult = mergedResult.map((obj) => {
  //         const transformed: any = {};
  //         Object.keys(obj).forEach((key) => {
  //           const newKey = key.replace(/\s+/g, '');
  //           transformed[newKey] = obj[key];
  //         });
  //         return transformed;
  //       });

  //       this.setState({ currentRecord: cleanedResult });
  //     } else {
  //       this.setState({ currentRecord: [], isRecord: false });
  //     }
  //   } catch (e: any) {
  //     // this.notify.showErrorNotify(e.message);
  //   }
  // }

  async componentDidMount() {
    await this.refresh();
  }
  
  async refresh() {
    try {
      // Fetch all dropdown data in parallel
      const [dropdownData, dropdownData1, dropdownData2] = await Promise.all([
        this.apiClient.getActiveMetricGroupsWithCount(),
        this.apiClient.getYear(),
        this.apiClient.getMonths(),
      ]);
  
      this.setState({
        dropdownOptions:
          dropdownData?.result?.map((item: any) => ({
            key: item.groupId,
            text: item.name,
          })) || [],
        dropdownOptions1:
          dropdownData1?.result?.map((item: any) => ({
            key: item.year,
            text: item.year,
          })) || [],
        dropdownOptions2:
          dropdownData2?.result?.map((item: any) => ({
            key: item.id,
            text: item.name,
          })) || [],
      });
  
      const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2 } = this.state;
      if (selectedDropdownValue && selectedDropdownValue1 && selectedDropdownValue2) {
        await this.fetchData(selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2);
      }
    } catch (e: any) {
      console.error('Error during refresh:', e);
      this.notify.showErrorNotify(e.message);
    }
  }
  
  async fetchData(groupId: any, month: any, year: any) {
    try {
      const apiResponse = await this.apiClient.excelDataView(groupId, month, year);
      const data = apiResponse?.result || [];
  
      if (data.length > 0) {
        const [rawData1, rawData2] = [JSON.parse(data[0].calculatedjson), JSON.parse(data[0].data)];
  
        const processData = (rawData: any[]) =>
          rawData.reduce<{ stack: string; [key: string]: any }[]>((acc, _, i) => {
            if (i % 2 === 0) acc.push({ stack: rawData[i], ...rawData[i + 1] });
            return acc;
          }, []);
  
        const structuredData1 = processData(rawData1);
        const structuredData2 = processData(rawData2);
  
        const mergedData1: { [key: string]: { [key: string]: any } } = {};
        structuredData1.forEach((entry) => {
          mergedData1[entry.stack] = { ...mergedData1[entry.stack], ...entry };
        });
  
        const mergedResult = structuredData2.map((item) => ({
          ...item,
          ...(mergedData1[item.stack] || {}),
        }));
  
        const cleanedResult = mergedResult.map((obj) =>
          Object.fromEntries(Object.entries(obj).map(([key, value]) => [key.replace(/\s+/g, ''), value]))
        );
  
        this.setState({ currentRecord: cleanedResult });
      } else {
        this.setState({ currentRecord: [], isRecord: false });
      }
    } catch (e: any) {
      console.error('Error fetching data:', e);
      this.notify.showErrorNotify(e.message);
    }
  }
  

  handleDropdownChange = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue: option.key }, async () => {
        const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2 } =
          this.state;
        await this.fetchData(selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2);
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  handleDropdownChange1 = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue1: option.key }, async () => {
        const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2 } =
          this.state;
        await this.fetchData(selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2);
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  handleDropdownChange2 = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue2: option.key }, async () => {
        const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2 } =
          this.state;
        await this.fetchData(selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2);
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  render() {
    const { currentRecord, dropdownOptions, dropdownOptions1, dropdownOptions2 } = this.state;
    const { t } = this.props;

    const columns: any = [
      {
        key: 'stack',
        name: <div className={columnHeader}>{t('Stacks')}</div>,
        selector: (row: any) => <span title={row['stack']}>{row['stack']}</span>,
        width: '13%',
      },
      {
        key: 'flow',
        name: (
          <div className={columnHeader} style={{ background: '#D3D3D3' }}>
            {t('Flow in Nm3/hr')}
          </div>
        ),

        selector: (row: any) => <span title={row['FlowinNm3/hr']}>{row['FlowinNm3/hr']}</span>,
        width: '7%',
      },
      {
        key: 'PMmgNm3',
        name: (
          <div className={columnHeader} style={{ background: '#D3D3D3' }}>
            {t('PM, mg/Nm3')}
          </div>
        ),
        selector: (row: any) => <span title={row['PMmg/Nm3']}>{row['PMmg/Nm3']}</span>,
        width: '8%',
      },
      {
        key: 'SO2mgNm3',
        name: (
          <div className={columnHeader} style={{ background: '#D3D3D3' }}>
            {t('SO2 mg/Nm3')}
          </div>
        ),
        selector: (row: any) => <span title={row['SO2mg/Nm3']}>{row['SO2mg/Nm3']}</span>,
        width: '8%',
      },
      {
        key: 'NOXmgNm3',
        name: (
          <div className={columnHeader} style={{ background: '#D3D3D3' }}>
            {t('NOX mg/Nm3')}
          </div>
        ),
        selector: (row: any) => <span title={row['NOxmg/Nm3']}>{row['NOxmg/Nm3']}</span>,
        width: '8%',
      },
      {
        key: 'SPMKgHr',
        name: <div className={columnHeader}>{t('SPM (Kg/hr)')}</div>,
        selector: (row: any) => <span title={row['SPM(Kg/hr)']}>{row['SPM(Kg/hr)']}</span>,
        width: '6%',
      },
      {
        key: 'SO2KgHr',
        name: <div className={columnHeader}>{t('SO2 (kg/hr)')}</div>,
        selector: (row: any) => <span title={row['SO2(kg/hr)']}>{row['SO2(kg/hr)']}</span>,
        width: '6%',
      },
      {
        key: 'NoxKgHr',
        name: <div className={columnHeader}>{t('Nox (kg/hr)')}</div>,
        selector: (row: any) => <span title={row['Nox(kg/hr)']}>{row['Nox(kg/hr)']}</span>,
        width: '6%',
      },
      {
        key: 'TotalHours',
        name: <div className={columnHeader}>{t('Total no. of hours')}</div>,
        selector: (row: any) => (
          <span title={row['Totalno.ofhours']}>{row['Totalno.ofhours']}</span>
        ),
        width: '6%',
      },
      {
        key: 'ShutDownHours',
        name: <div className={columnHeader}>{t('Shut down hours')}</div>,
        selector: (row: any) => <span title={row['shutdownhours']}>{row['shutdownhours']}</span>,
        width: '6%',
      },
      {
        key: 'WorkingHours',
        name: <div className={columnHeader}>{t('Working hrs')}</div>,
        selector: (row: any) => <span title={row['Workinghrs']}>{row['Workinghrs']}</span>,
        width: '7%',
      },
      {
        key: 'PMkg',
        name: <div className={columnHeader}>{t('PM (kg)')}</div>,
        selector: (row: any) => <span title={row['PM(kg)']}>{row['PM(kg)']}</span>,
        width: '6%',
      },
      {
        key: 'SO2kg',
        name: <div className={columnHeader}>{t('SO2 (kg)')}</div>,
        selector: (row: any) => <span title={row['SO2(kg)']}>{row['SO2(kg)']}</span>,
        width: '6%',
      },
      {
        key: 'Noxkg',
        name: <div className={columnHeader}>{t('Nox (kg)')}</div>,
        selector: (row: any) => <span title={row['Nox(kg)']}>{row['Nox(kg)']}</span>,
        width: '6%',
      },
    ];

    return (
      <div className="QClayout">
        <div className="bg-Color">
          <Link to={`/activity/TimeDimensionDataview`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_EXCEL_VIEW')}
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
                variant="xxLarge"
                styles={PIMHearderText}
                nowrap
                block
              >
                {t('SUBMENU_EXCEL_VIEW')}
              </Text>
            </Stack>
          </Grid>

          <Grid lg={12} item container spacing={1} direction="row" style={{ marginBottom: '10px' }}>
            <Grid item lg={2.7} xs={6}>
              <Dropdown
                placeholder={t('SELECT_METRIC_GROUP')}
                options={dropdownOptions}
                onChange={this.handleDropdownChange}
                styles={{ dropdown: { width: 250 } }}
              />
            </Grid>
            <Grid item lg={2.7} xs={6}>
              <Dropdown
                placeholder={t('SELECT_YEAR')}
                options={dropdownOptions1}
                onChange={this.handleDropdownChange1}
                styles={{ dropdown: { width: 250 } }}
              />
            </Grid>
            <Grid item lg={2.7} xs={6}>
              <Dropdown
                placeholder={t('SELECT_MONTH')}
                options={dropdownOptions2}
                onChange={this.handleDropdownChange2}
                styles={{ dropdown: { width: 250 } }}
              />
            </Grid>
            <Grid item lg={1.0} xs={6}>
              <Icon
                iconName="Refresh"
                title={this.props.t('BTN_REFRESH')}
                className="iconStyle3"
                onClick={() => this.refresh()}
              />
            </Grid>
          </Grid>
        </div>
        <div style={{ width: '98%' }}>
          {' '}
          {this.state.selectedDropdownValue &&
            this.state.selectedDropdownValue1 &&
            this.state.selectedDropdownValue2 && (
              <DataTable
                columns={columns}
                data={currentRecord}
                pagination
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="65vh"
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
            )}
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(TableDataview);

function App() {
  return (
    <Suspense fallback="Loading...">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
