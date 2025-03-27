import React, { Component, Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import { Grid, Stack, Card } from '@mui/material';
import { Icon } from '@fluentui/react';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import { PIMHearderText, columnHeader } from '@/pages/PimStyles';
import { Link } from 'react-router-dom';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import {
  MetricDomainModelListApiResponse,
  IMetricDomainModel,
  ITemplayteMetricGroupDto,
} from '@/services/ApiClient';

interface AssessmentMetricState {
  templateId: number | null;
  metricGroups: ITemplayteMetricGroupDto[];
  metrics: IMetricDomainModel[];
  loading: boolean;
  isRecord: boolean;
  filterValue: string | undefined;
  showFilterDropdown: boolean | undefined;
}

class AssessmentMetric extends Component<any, AssessmentMetricState> {
  apiClient = new ApiManager().CreateApiClient();

  constructor(props: any) {
    super(props);
    this.state = {
      templateId: null,
      metricGroups: [],
      metrics: [],
      loading: true,
      isRecord: true,
      filterValue: '',
      showFilterDropdown: false,
    };
  }

  async componentDidMount(): Promise<void> {
    const templateId = this.getTemplateIdFromUrl();
    if (templateId !== null) {
      this.setState({ templateId });
      await this.fetchMetricsByTemplateId(templateId);
    } else {
      this.setState({ loading: false, isRecord: false });
    }
  }

  getTemplateIdFromUrl(): number | null {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = parseInt(urlParams.get('templateId') || '', 10);
    return isNaN(templateId) ? null : templateId;
  }

  async fetchMetricsByTemplateId(templateId: number): Promise<void> {
    try {
      const response: MetricDomainModelListApiResponse =
        await this.apiClient.getMetricsByTemplateId(templateId);
      if (response.result) {
        this.setState({
          metrics: response.result,
          isRecord: this.state.metrics.length > 0,
        });
      } else {
        this.setState({ isRecord: false });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      this.setState({ isRecord: false });
    } finally {
      this.setState({ loading: false });
    }
  }

  handleFilter = (value: string) => {
    this.setState({ filterValue: value, showFilterDropdown: false });
  };

  handleClearFilter = () => {
    this.setState({ filterValue: '', showFilterDropdown: false });
  };

  render() {
    const { t } = this.props;
    const { metrics, showFilterDropdown, filterValue } = this.state;

    const filteredData = metrics.filter((item: IMetricDomainModel) => {
      return filterValue ? item.esgrcName === filterValue : true;
    });

    const columns: any = [
      {
        id: 'metricsQuestion',
        name: <div className={columnHeader}>{t('COL_METRICQUESTIONS')}</div>,
        cell: (row: IMetricDomainModel) => (
          <span title={row.metricsQuestion}>{row.metricsQuestion}</span>
        ),
        width: '47%',
      },
      {
        id: 'typeName',
        name: <div className={columnHeader}>{t('TYPE')}</div>,
        selector: (row: IMetricDomainModel) => (
          <span title={row.typeName || ''}>{row.typeName || ''}</span>
        ),
        width: '15%',
      },
      {
        key: 'esgrc',
        name: (
          <div className={columnHeader}>
            {t('ESG')}
            <Icon
              iconName="Filter"
              onClick={() => this.setState({ showFilterDropdown: !showFilterDropdown })}
              className='filtericondiv'
            />
            {showFilterDropdown && (
              <div className="filterdiv">
                {['E', 'S', 'G'].map((option) => (
                  <div
                    key={option}
                    style={{ padding: '5px', cursor: 'pointer' }}
                    onClick={() => this.handleFilter(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            {filterValue && (
              <Icon
                iconName="ClearFilter"
                onClick={this.handleClearFilter}
                className='filtericondiv'
              />
            )}
          </div>
        ),
        selector: (row: any) => <span title={row.esgrcName}>{row.esgrcName}</span>,
        width: '15%',
      },
      {
        id: 'standardName',
        name: <div className={columnHeader}>{t('STANDARD NAME')}</div>,
        selector: (row: IMetricDomainModel) => (
          <span title={row.standardName || ''}>{row.standardName || ''}</span>
        ),
        width: '18%',
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={'/metrics/assessment'} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_ASSESSMENTS')}/{t('ASSESSMENT_METRIC')}
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
                variant={'xxLarge' as ITextProps['variant']}
                styles={PIMHearderText}
                nowrap
                block
              >
                {t('ASSESSMENT_METRIC')}
              </Text>
            </Stack>
          </Grid>

          <Grid lg={12} item container spacing={1} direction="row">
            <Grid item lg={4.7} />
            <Grid item lg={0.5} xs={1}>
              {/* <Icon
                iconName="Refresh"
                title={t('BTN_REFRESH')}
                className="iconStyle iconStyle1"
                onClick={() => this.componentDidMount()}
              /> */}
            </Grid>
          </Grid>

          <Card>
            {metrics.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="68.03vh"
                paginationComponentOptions={{
                  rowsPerPageText: t('ROWS_PER_PAGE'),
                }}
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
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(AssessmentMetric);

function App() {
  return (
    <Suspense fallback="Loading...">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
