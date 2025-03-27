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
import AddAssessment from './AddAssessment';
import {
  AddButton,
  columnHeader,
  hyperlink,
  PIMcontentStyles,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '@/pages/PimStyles';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { Link } from 'react-router-dom';
import { IAssessmentDto } from '@/services/ApiClient';

class Assessments extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();

  constructor(props: any) {
    super(props);
    this.state = {
      searchKey: '',
      currentRecord: [],
      isRecord: true,
      visible: false,
      selectedRowData: [],
      copyRecord: [],
      enableActiveButton: false,
      inActivePage: false,
      isvisible: false,
      assessments: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  async refresh() {
    const apiClient = new ApiManager().CreateApiClient();
    this.setState({
      copyRecord: [],
      currentRecord: [],
      isRecord: true,
    });
    try {
      const response = await apiClient.getAssessments();
      if (response && response.result) {
        this.setState({
          assessments: response.result,
          copyRecord: response.result,
          currentRecord: response.result.map((item: IAssessmentDto, index: number) => ({
            index: index + 1,
            ...item,
          })),
          isRecord: this.state.currentRecord.length > 0,
        });
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      this.setState({ loading: false });
    }
  }

  onSearch(e: any) {
    var newValue = e?.target.value?.toLowerCase() || '';
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;

    const results = copyRecord.filter((element: IAssessmentDto) => {
      const assessmentName = element.assessmentName?.toLowerCase() || '';
      const metricgroupName = element.metricgroupName?.toLowerCase() || '';
      const serviceName = element.serviceName?.toLowerCase() || '';
      const roleName = element.roleName?.toLowerCase() || '';
      const templateName = element.templateName?.toLowerCase() || '';

      return (
        assessmentName.includes(newValue) ||
        metricgroupName.includes(newValue) ||
        serviceName.includes(newValue) ||
        roleName.includes(newValue) ||
        templateName.includes(newValue)
      );
    });

    this.setState({
      currentRecord: results.map((item: IAssessmentDto, index: number) => ({
        index: index + 1,
        ...item,
      })),
    });
  }

  render() {
    const { currentRecord, isvisible } = this.state;
    const { t } = this.props;

    const columns: any = [
      {
        key: 'Assessment',
        name: <div className={columnHeader}>{t('COL_ASSESSMENT')}</div>,
        cell: (row: any) => (
          <Link
            className={hyperlink}
            to={`/metrics/assessment/assessmentmetrics?templateId=${row.templateId}`}
          >
            <span title={row.assessmentName}>{row.assessmentName}</span>
          </Link>
        ),
        width: '20%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const assessmentA = a.assessmentName?.toLowerCase() || '';
          const assessmentB = b.assessmentName?.toLowerCase() || '';
          return assessmentA.localeCompare(assessmentB);
        },
      },
      {
        key: 'metricgroup',
        name: <div className={columnHeader}>{t('COL_METRIC_GROUP')}</div>,
        selector: (row: IAssessmentDto) => (
          <span title={row.metricgroupName}>{row.metricgroupName}</span>
        ),
        width: '25%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const groupA = a.metricgroupName?.toLowerCase() || '';
          const groupB = b.metricgroupName?.toLowerCase() || '';
          return groupA.localeCompare(groupB);
        },
      },
      {
        key: 'templateName',
        name: <div className={columnHeader}>{t('SUBMENU_TEMPLATE')}</div>,
        selector: (row: IAssessmentDto) => <span title={row.templateName}>{row.templateName}</span>,
        width: '25%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const templateA = a.templateName?.toLowerCase() || '';
          const templateB = b.templateName?.toLowerCase() || '';
          return templateA.localeCompare(templateB);
        },
      },
      {
        key: 'service',
        name: <div className={columnHeader}>{t('COL_SERVICE')}</div>,
        selector: (row: IAssessmentDto) => <span title={row.serviceName}>{row.serviceName}</span>,
        cell: (row: IAssessmentDto) => <span title={row.serviceName}>{row.serviceName}</span>,
        minwidth: '200px',
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const serviceA = a.serviceName?.toLowerCase() || '';
          const serviceB = b.serviceName?.toLowerCase() || '';
          return serviceA.localeCompare(serviceB);
        },
      },
      {
        key: 'role',
        name: <div className={columnHeader}>{t('MENU_ROLE')}</div>,
        selector: (row: IAssessmentDto) => <span title={row.roleName}>{row.roleName}</span>,
        cell: (row: IAssessmentDto) => <span title={row.roleName}>{row.roleName}</span>,
        minwidth: '200px',
        width: '15%',
        sortable: true,
        sortFunction: (a: any, b: any) => {
          const roleA = a.roleName?.toLowerCase() || '';
          const roleB = b.roleName?.toLowerCase() || '';
          return roleA.localeCompare(roleB);
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/assessment`} className="headerText">
            {t('MENU_METRICS')}/{t('SUBMENU_ASSESSMENTS')}
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
                {t('SUBMENU_ASSESSMENTS')}
              </Text>
            </Stack>
            <Grid item lg={2.1} xs={1}>
              <Link to="/metrics/assessment/addassessment">
                <DefaultButton
                  className="button"
                  styles={AddButton}
                  iconProps={{ iconName: 'CircleAddition' }}
                  text={`${t('ADD_SUBMENU_ASSESSMENT')}`}
                  disabled={this.state.enableActiveButton || this.state.inActivePage}
                />
              </Link>
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
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(Assessments);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
