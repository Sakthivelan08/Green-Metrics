import React, { Suspense } from 'react';
import { DefaultButton, Dropdown, Icon, Stack } from '@fluentui/react';
import { Text } from '@fluentui/react/lib/Text';
import { withTranslation } from 'react-i18next';
import {
  Card,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { PIMHearderText } from '@/pages/PimStyles';
import { Link } from 'react-router-dom';
import { baseUrl } from '@/services/Constants';
import axios from 'axios';

class TimeDimensionDataview extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      isRecord: null,
      dropdownOptions: [],
      dropdownOptions1: [],
      dropdownOptions2: [],
      dropdownOptions3: [],
      selectedDropdownValue: null,
      selectedDropdownValue1: null,
      selectedDropdownValue2: null,
      selectedDropdownValue3: null,
      visible: false,
    };
  }

  // async componentDidMount() {
  //   await this.refresh();
  // }

  // async refresh() {
  //   await this.fetchDropdownData();
  //   await this.fetchDropdownData1();
  //   await this.fetchDropdownData2();
  //   await this.fetchDropdownData3();
  //   const {
  //     selectedDropdownValue,
  //     selectedDropdownValue1,
  //     selectedDropdownValue2,
  //     selectedDropdownValue3,
  //   } = this.state;
  //   if (
  //     selectedDropdownValue &&
  //     selectedDropdownValue1 &&
  //     selectedDropdownValue2 &&
  //     selectedDropdownValue3
  //   ) {
  //     await this.fetchData(
  //       selectedDropdownValue,
  //       selectedDropdownValue1,
  //       selectedDropdownValue2,
  //       selectedDropdownValue3,
  //     );
  //   } else {
  //     await this.fetchData(
  //       selectedDropdownValue,
  //       selectedDropdownValue1,
  //       selectedDropdownValue2,
  //       '',
  //     );
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
  //     const apiResponse = await this.apiClient.getDataviewDimensions();
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

  // async fetchDropdownData3() {
  //   try {
  //     const apiResponse = await this.apiClient.getQuatter();
  //     const options =
  //       apiResponse?.result?.map((item) => ({
  //         key: item.id,
  //         text: item.name,
  //       })) || [];
  //     this.setState({ dropdownOptions3: options });
  //   } catch (e: any) {
  //     console.error('Error fetching dropdown data:', e);
  //     this.notify.showErrorNotify(e.message);
  //   }
  // }

  async componentDidMount() {
    await this.refresh();
  }
  
  async refresh() {
    try {
      // Fetch all dropdown data in parallel
      const [dropdownData, dropdownData1, dropdownData2, dropdownData3] = await Promise.all([
        this.apiClient.getActiveMetricGroupsWithCount(),
        this.apiClient.getYear(),
        this.apiClient.getDataviewDimensions(),
        this.apiClient.getQuatter(),
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
        dropdownOptions3:
          dropdownData3?.result?.map((item: any) => ({
            key: item.id,
            text: item.name,
          })) || [],
      });
  
      const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2, selectedDropdownValue3 } =
        this.state;
  
      // Fetch data conditionally
      await this.fetchData(
        selectedDropdownValue,
        selectedDropdownValue1,
        selectedDropdownValue2,
        selectedDropdownValue3 || ''
      );
    } catch (e: any) {
      console.error('Error during refresh:', e);
      this.notify.showErrorNotify(e.message);
    }
  }
  

  handleDropdownChange = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue: option.key }, async () => {
        const {
          selectedDropdownValue,
          selectedDropdownValue1,
          selectedDropdownValue2,
          selectedDropdownValue3,
        } = this.state;
        await this.fetchData(
          selectedDropdownValue,
          selectedDropdownValue1,
          selectedDropdownValue2,
          selectedDropdownValue3,
        );
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  handleDropdownChange1 = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue1: option.key }, async () => {
        const {
          selectedDropdownValue,
          selectedDropdownValue1,
          selectedDropdownValue2,
          selectedDropdownValue3,
        } = this.state;
        await this.fetchData(
          selectedDropdownValue,
          selectedDropdownValue1,
          selectedDropdownValue2,
          selectedDropdownValue3,
        );
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  handleDropdownChange2 = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      const dimensionId = option.key;

      this.setState(
        {
          selectedDropdownValue2: dimensionId,
          isQuarterDropdownEnabled: dimensionId === 2,
          selectedDropdownValue3: dimensionId === 2 ? this.state.selectedDropdownValue3 : '',
        },
        async () => {
          const { selectedDropdownValue, selectedDropdownValue1, selectedDropdownValue2 } =
            this.state;

          if (dimensionId !== 2) {
            await this.fetchData(
              selectedDropdownValue,
              selectedDropdownValue1,
              selectedDropdownValue2,
              '',
            );
          }
        },
      );
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  handleDropdownChange3 = async (event: any, option: any) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue3: option.key }, async () => {
        const {
          selectedDropdownValue,
          selectedDropdownValue1,
          selectedDropdownValue2,
          selectedDropdownValue3,
        } = this.state;
        await this.fetchData(
          selectedDropdownValue,
          selectedDropdownValue1,
          selectedDropdownValue2,
          selectedDropdownValue3,
        );
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  async fetchData(groupId: any, year: any, timedimension: any, quarterId: any) {
    if (!groupId || !year || !timedimension) {
      console.warn('Required parameters are missing, skipping fetchData.');
      return;
    }
    try {
      this.setState({ isRecord: null });
      const apiResponse = await this.apiClient.getTotalJson(
        groupId,
        year,
        timedimension,
        quarterId,
      );
      const data: any = apiResponse?.result || [];

      let averageRow: any = null;

      if (data && data.length > 0) {
        averageRow = data.find(
          (item: any) =>
            item.AverageSpecificKgNO !== undefined &&
            item.AverageSpecificKgPM !== undefined &&
            item.AverageSpecificKgSO !== undefined,
        );

        const formattedData = data
          .filter((record: any) => !record.AverageSpecificKgNO)
          .map((record: any) => ({
            monthName: record.MonthName,
            pollutantData: [
              { name: 'PM', specific: record.SpecificKgPM, total: record.TotalPMKg },
              { name: 'Nox', specific: record.SpecificKgNO, total: record.TotalNoxKg },
              { name: 'SO2', specific: record.SpecificKgSO, total: record.TotalSo2Kg },
            ],
          }));

        this.setState({
          currentRecord: formattedData,
          isRecord: true,
          monthName: data[0]?.MonthName || '',
          averageRow,
        });
      } else {
        this.setState({ currentRecord: [], isRecord: false, averageRow: null });
      }
    } catch (e: any) {
      console.error('Error fetching data:', e);
      this.notify.showErrorNotify(e.message);
      this.setState({ currentRecord: [], isRecord: false, averageRow: null });
    }
  }

  generatePDF = async (
    metricgroupId: any,
    year: any,
    timeDimension: any,
    quarterId: any | null,
  ) => {
    const apiUrl = quarterId
      ? `${baseUrl}/api/PdfMerge/PdfMergerByAirBlob?metricgroupid=${encodeURIComponent(
          metricgroupId,
        )}&year=${encodeURIComponent(year)}&timedimension=${encodeURIComponent(
          timeDimension,
        )}&quarterid=${encodeURIComponent(quarterId)}`
      : `${baseUrl}/api/PdfMerge/PdfMergerByAirBlob?metricgroupid=${encodeURIComponent(
          metricgroupId,
        )}&year=${encodeURIComponent(year)}&timedimension=${encodeURIComponent(timeDimension)}`;

    try {
      document.body.classList.add('loading-indicator');
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        responseType: 'blob',
        headers: {},
      });

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'generated-document.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.notify.showSuccessNotify('PDF generated successfully.');
      } else {
        this.notify.showErrorNotify('Failed to generate PDF.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.notify.showErrorNotify('Error generating PDF.');
    } finally {
      document.body.classList.remove('loading-indicator');
    }
  };

  handleGenerateReportSubmit = async () => {
    const {
      selectedDropdownValue: metricgroupId,
      selectedDropdownValue1: year,
      selectedDropdownValue2: timeDimension,
      selectedDropdownValue3: quarterId,
    } = this.state;

    try {
      console.log('Generating PDF with:', {
        metricgroupId,
        year,
        timeDimension,
        quarterId,
      });

      await this.generatePDF(metricgroupId, year, timeDimension, quarterId ? quarterId : null);

      this.notify.showSuccessNotify('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      this.notify.showErrorNotify('Failed to generate PDF.');
    }
  };

  render() {
    const {
      currentRecord,
      dropdownOptions,
      dropdownOptions1,
      dropdownOptions2,
      dropdownOptions3,
      averageRow,
    } = this.state;
    const { t } = this.props;
    const tableRows = currentRecord.map((record: any) => ({
      month: record.monthName,
      PM: record.pollutantData.find((p: any) => p.name === 'PM'),
      SO2: record.pollutantData.find((p: any) => p.name === 'SO2'),
      NOx: record.pollutantData.find((p: any) => p.name === 'Nox'),
    }));
    const averageTableRow = averageRow
      ? {
          month: 'Average',
          PM: { specific: averageRow.AverageSpecificKgPM },
          SO2: { specific: averageRow.AverageSpecificKgSO },
          NOx: { specific: averageRow.AverageSpecificKgNO },
        }
      : null;

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity/TimeDimensionDataview`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_TIMEDIMENSION_DATAVIEW')}
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
                {t('SUBMENU_TIMEDIMENSION_DATAVIEW')}
              </Text>
            </Stack>
            <DefaultButton
              text={t('GENERATE_PDF')}
              className="publishButton"
              onClick={this.handleGenerateReportSubmit}
            />
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
            {this.state.isQuarterDropdownEnabled ? (
              <Grid item lg={2.7} xs={6}>
                <Dropdown
                  placeholder={t('SELECT_QUARTER')}
                  options={dropdownOptions3}
                  onChange={this.handleDropdownChange3}
                  styles={{ dropdown: { width: 250 } }}
                />
              </Grid>
            ) : (
              <Grid item lg={2.7} xs={6} />
            )}
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

        <Card>
          {this.state.selectedDropdownValue &&
            this.state.selectedDropdownValue1 &&
            this.state.selectedDropdownValue2 &&
            ((this.state.selectedDropdownValue2 === 2 && this.state.selectedDropdownValue3) ||
              this.state.selectedDropdownValue2 !== 2) && (
              <TableContainer
                component={Paper}
                className="custom-scrollbar TableContainerStyle"
              >
                <Table stickyHeader>
                  <TableHead className="sticky-header">
                    <TableRow>
                      <TableCell className="tablecell">{t('COL_MONTH')}</TableCell>
                      <TableCell colSpan={2} align="center" className="tablecell">
                        {t('PM_KG')}
                      </TableCell>
                      <TableCell colSpan={2} align="center" className="tablecell">
                        {t('SO_2_KG')}
                      </TableCell>
                      <TableCell colSpan={2} align="center" className="tablecell">
                        {t('NO_X_KG')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell className="tablecell">{t('TOTAL_KG')}</TableCell>
                      <TableCell className="tablecell">{t('SPECIFIC_KG/TCS')}</TableCell>
                      <TableCell className="tablecell">{t('TOTAL_KG')}</TableCell>
                      <TableCell className="tablecell">{t('SPECIFIC_KG/TCS')}</TableCell>
                      <TableCell className="tablecell">{t('TOTAL_KG')}</TableCell>
                      <TableCell className="tablecell">{t('SPECIFIC_KG/TCS')}</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.isRecord === null && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='tableMessage text-align-center'
                        >
                          {t('RECORDS')}
                        </TableCell>
                      </TableRow>
                    )}

                    {this.state.isRecord === false && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='tableMessage text-align-center'
                        >
                          {t('NO_RECORDS')}
                        </TableCell>
                      </TableRow>
                    )}

                    {this.state.isRecord === true &&
                      tableRows.length > 0 &&
                      tableRows.map((row: any, index: any) => (
                        <TableRow key={index}>
                          <TableCell className='tableMessage'>
                            {row.month}'{String(this.state.selectedDropdownValue1).slice(-2)}
                          </TableCell>
                          <TableCell className="tablecell1">
                            <span title={row.PM?.total?.toFixed(3) || '-'}>
                              {row.PM?.total?.toFixed(3) || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="tablecell1">
                            <span title={row.PM?.specific?.toFixed(3) || '-'}>
                              {row.PM?.specific?.toFixed(3) || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="tablecell1">
                            <span title={row.SO2?.total?.toFixed(3) || '-'}>
                              {row.SO2?.total?.toFixed(3) || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="tablecell1">
                            <span title={row.SO2?.specific?.toFixed(3) || '-'}>
                              {row.SO2?.specific?.toFixed(3) || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="tablecell1">
                            <span title={row.NOx?.total?.toFixed(3) || '-'}>
                              {row.NOx?.total?.toFixed(3) || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="tablecell1">
                            <span title={row.NOx?.specific?.toFixed(3) || '-'}>
                              {row.NOx?.specific?.toFixed(3) || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    {this.state.isRecord === true && averageTableRow && (
                      <TableRow className="fixed-row">
                        <TableCell className='tableMessage'>
                          {averageTableRow.month}
                        </TableCell>
                        <TableCell className="tablecell1">-</TableCell>
                        <TableCell className="tablecell1">
                          <span
                            className="boldtext"
                            title={averageTableRow.PM?.specific?.toFixed(3) || '-'}
                          >
                            {averageTableRow.PM?.specific?.toFixed(3) || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="tablecell1">-</TableCell>
                        <TableCell className="tablecell1">
                          <span
                            className="boldtext"
                            title={averageTableRow.SO2?.specific?.toFixed(3) || '-'}
                          >
                            {averageTableRow.SO2?.specific?.toFixed(3) || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="tablecell1">-</TableCell>
                        <TableCell className="tablecell1">
                          <span
                            className="boldtext"
                            title={averageTableRow.NOx?.specific?.toFixed(3) || '-'}
                          >
                            {averageTableRow.NOx?.specific?.toFixed(3) || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
        </Card>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(TimeDimensionDataview);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
