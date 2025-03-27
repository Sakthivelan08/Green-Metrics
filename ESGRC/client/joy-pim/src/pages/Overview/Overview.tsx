import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import { Card, Grid, Typography } from '@mui/material';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function BasicBars() {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [selectedMetricGroup, setSelectedMetricGroup] = useState<IDropdownOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<IDropdownOption | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<IDropdownOption | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);
  const [dropdownOptions1, setDropdownOptions1] = useState<any[]>([]);
  const [dropdownOptions2, setDropdownOptions2] = useState<any[]>([]);
  const [averageValue1, setAverageValue1] = useState<number | null>(null);
  const [averageValue2, setAverageValue2] = useState<number | null>(null);
  const [averageValue3, setAverageValue3] = useState<number | null>(null);

  useEffect(() => {
    fetchDropdownData();
    fetchDropdownData1();
    fetchDropdownData2();
  }, []);

  useEffect(() => {
    if (selectedMetricGroup && selectedYear && selectedQuarter) {
      fetchData(selectedMetricGroup.key, selectedYear.key, selectedQuarter.key);
    }
  }, [selectedMetricGroup, selectedYear, selectedQuarter]);

  const fetchData = async (groupId: any, year: any, quarterId: any) => {
    const timeDimension = 2;
    if (!groupId || !year || !timeDimension) {
      console.warn('Required parameters are missing, skipping fetchData.');
      return;
    }

    try {
      const apiResponse = await apiClient.getTotalJson(groupId, year, timeDimension, quarterId);
      const fetchedData: any = apiResponse?.result || [];

      let averageRow: any = null;

      if (fetchedData && fetchedData.length > 0) {
        averageRow = fetchedData.find(
          (item: any) =>
            item.AverageSpecificKgNO !== undefined &&
            item.AverageSpecificKgPM !== undefined &&
            item.AverageSpecificKgSO !== undefined,
        );

        const formattedData = fetchedData
          .filter((record: any) => !record.AverageSpecificKgNO)
          .map((record: any) => ({
            name: record.MonthName,
            pm: record.SpecificKgPM,
            sox: record.SpecificKgSO,
            nox: record.SpecificKgNO,
          }));

        setData(formattedData);

        if (averageRow) {
          setAverageValue1(averageRow.AverageSpecificKgPM);
          setAverageValue2(averageRow.AverageSpecificKgSO);
          setAverageValue3(averageRow.AverageSpecificKgNO);
        }
      } else {
        setData([]);
        setAverageValue1(null);
        setAverageValue2(null);
        setAverageValue3(null);
      }
    } catch (e: any) {
      console.error('Error fetching data:', e);
      notify.showErrorNotify(e.message);
      setData([]);
      setAverageValue1(null);
      setAverageValue2(null);
      setAverageValue3(null);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const apiResponse = await apiClient.getActiveMetricGroupsWithCount();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.groupId,
          text: item.name,
        })) || [];
      setDropdownOptions(options);
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      notify.showErrorNotify(e.message);
    }
  };

  const fetchDropdownData1 = async () => {
    try {
      const apiResponse = await apiClient.getYear();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.year,
          text: item.year,
        })) || [];
      setDropdownOptions1(options);
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      notify.showErrorNotify(e.message);
    }
  };

  const fetchDropdownData2 = async () => {
    try {
      const apiResponse = await apiClient.getQuatter();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.id,
          text: item.name,
        })) || [];
      setDropdownOptions2(options);
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      notify.showErrorNotify(e.message);
    }
  };

  const handleMetricGroupChange = (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined,
  ) => {
    setSelectedMetricGroup(item || null);
  };

  const handleYearChange = (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined,
  ) => {
    setSelectedYear(item || null);
  };

  const handleQuarterChange = (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined,
  ) => {
    setSelectedQuarter(item || null);
  };

  return (
    <div className="layout width-100">
      <div className="bg-Color">
        <Link to={`/activity/MetricDataDashboard`} className="headerText">
          {t('MENU_ACTIVITY')}/{t('SUBMENU_METRIC_DATA_DASHBOARD')}
        </Link>
        <h1 className="text-3xl font-bold mb-4 chartheader">{t('SUBMENU_METRIC_DATA_DASHBOARD')}</h1>

        <Grid lg={12} item container spacing={1} direction="row" className="chartGrid">
          <Grid item lg={3.2} xs={6}>
            <Dropdown
              className="dropdown1"
              placeholder="Select Metric Group"
              options={dropdownOptions}
              onChange={handleMetricGroupChange}
              selectedKey={selectedMetricGroup?.key}
              styles={{ dropdown: { width: 280 } }}
            />
          </Grid>

          <Grid item lg={3.2} xs={6}>
            <Dropdown
              className="dropdown1"
              placeholder="Select Year"
              options={dropdownOptions1}
              onChange={handleYearChange}
              selectedKey={selectedYear?.key}
              styles={{ dropdown: { width: 280 } }}
            />
          </Grid>

          <Grid item lg={3.2} xs={6}>
            <Dropdown
              className="dropdown1"
              placeholder="Select Quarter"
              options={dropdownOptions2}
              onChange={handleQuarterChange}
              selectedKey={selectedQuarter?.key}
              styles={{ dropdown: { width: 280 } }}
            />
          </Grid>
        </Grid>

        {selectedMetricGroup && selectedYear && selectedQuarter && data.length > 0 && (
          <>
            <Grid container spacing={12} className="mb-6 chartGrid1">
              <Grid item xs={0}>
                <Card className="card-style-1">
                  <div>
                    <Typography variant="h6" className="chartTypo">
                    {t('AVERAGE_SPECIFI_KG/TCS')}
                    </Typography>
                    <Typography variant="h6" className="chartTypo1">
                    {t('PM_KG')}
                    </Typography>
                    <Typography variant="h6" className="chartTypo1">
                      {averageValue1 !== null ? averageValue1.toFixed(3) : '-'}
                    </Typography>
                  </div>
                </Card>
              </Grid>

              <Grid item xs={0}>
                <Card className="card-style-2">
                  <div>
                    <Typography variant="h6" className="chartTypo">
                      {t('AVERAGE_SPECIFI_KG/TCS')}
                    </Typography>
                    <Typography variant="h6" className="chartTypo1">
                    {t('SO_2_KG')}
                    </Typography>
                    <Typography variant="h6" className="chartTypo1">
                      {averageValue2 !== null ? averageValue2.toFixed(3) : '-'}
                    </Typography>
                  </div>
                </Card>
              </Grid>

              <Grid item xs={0}>
                <Card className="card-style-3">
                  <div>
                    <Typography variant="h6" className="chartTypo">
                     {t('AVERAGE_SPECIFI_KG/TCS')}
                    </Typography>
                    <Typography variant="h6" className="chartTypo1">
                    {t('NO_X_KG')}
                    </Typography>
                    <Typography variant="h6" className="chartTypo1">
                      {averageValue3 !== null ? averageValue3.toFixed(3) : '-'}
                    </Typography>
                  </div>
                </Card>
              </Grid>
            </Grid>

            <BarChart
              width={970}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toFixed(3)} />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="pm" fill="#696969" name="PM" barSize={20} />
              <Bar dataKey="sox" fill="#FFD700" name="SO₂" barSize={20} />
              <Bar dataKey="nox" fill="#FF4500" name="NOₓ" barSize={20} />
            </BarChart>
          </>
        )}
      </div>
    </div>
  );
}
