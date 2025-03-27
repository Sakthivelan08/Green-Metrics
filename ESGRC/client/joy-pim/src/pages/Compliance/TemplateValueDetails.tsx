import { Stack } from '@mui/material';
import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import Util from '@/services/Util';
import NotificationManager from '@/services/NotificationManager';
import { AddFams, columnHeader, PIMHearderText } from '@/pages/PimStyles';
import { withRouter } from 'react-router-dom';
import { DefaultButton } from 'office-ui-fabric-react';
import { Text } from '@fluentui/react/lib/Text';

class TempalteValueDetails extends React.Component<any, any> {
  util = new Util();
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.util = new Util();
    this.apiClient = new ApiManager().CreateApiClient();
    this.notify = new NotificationManager();
    this.state = {
      rowData: [],
      isRecord: false,
      columns: [],
      auditId: null,
      templateId: null,
      searchKey: '',
      currentRecord: [],
    };
    this.token = sessionStorage.getItem('token');
  }

  async componentDidMount() {
    this.setState({
      isRecord: true,
    });
    this.refresh();
  }

  onSearch(e: any) {
    const newValue = e?.target.value || '';
    const { currentRecord } = this.state;
    const searchResult = currentRecord.filter((element: any) => {
      return (
        element.JSON.toLowerCase().includes(newValue.toLowerCase().trim()) ||
        element['JSON Values'].toString().toLowerCase().includes(newValue.toLowerCase().trim())
      );
    });
    this.setState({
      rowData: searchResult.map((item: any, index: any) => ({
        index: index + 1,
        ...item,
      })),
      searchKey: newValue,
    });
  }

  async refresh() {
    try {
      const query = new URLSearchParams(window.location.search);
      const auditId: any = query.get('id');
      const assessmentGroupId: any = query.get('templateId') || query.get('assessmentId');

      if (auditId && assessmentGroupId) {
        this.setState({
          auditId: parseInt(auditId, 10),
          assessmentGroupId: parseInt(assessmentGroupId, 10),
        });
        const apiResponse = await this.apiClient.getMetricAnswer(assessmentGroupId, auditId);
        const viewitems = apiResponse.result;
        if (viewitems && viewitems.length > 0) {
          const uidData = viewitems[0].responseJson;
          if (uidData) {
            const transformedData = Object.entries(uidData).map(([key, value], index) => ({
              JSON: key,
              'JSON Values': value,
            }));
            this.setState({
              columns: [
                {
                  key: 'JSON',
                  name: <div className={columnHeader}>{'Questions'}</div>,
                  selector: (row: any) => row.JSON.title,
                  cell: (row: any) => (
                    <div className="lightgray-background full-width">{row.JSON}</div>
                  ),
                  isVisible: true,
                  minWidth: '100px',
                },
                {
                  key: 'JSON Values',
                  name: <div className={columnHeader}>{'Answers'}</div>,
                  selector: (row: any) => row['JSON Values'],
                  isVisible: true,
                  minWidth: '100px',
                },
              ],
              rowData: transformedData,
              currentRecord: transformedData,
            });
          } else {
            this.notify.showErrorNotify('uidData is undefined');
          }
        } else {
          this.notify.showErrorNotify('No data ');
        }
      } else {
        this.notify.showErrorNotify('Audit ID is null');
      }
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
    this.setState({
      isRecord: false,
      selectedRowData: [],
    });
  }

  render() {
    const { t, history } = this.props;

    return (
      <>
        <div className="layout width-100">
          <div>
            <div className="d-flex align-item-center justify-content-between">
              <Text variant="xxLarge" styles={PIMHearderText} className="color-blue text">{`${t(
                'AUDIT_DATA',
              )}`}</Text>
              <DefaultButton
                className="button w-auto"
                styles={AddFams}
                onClick={() => history.push('/metrics/complianceList')}
                text={t('BTN_BACK')}
              />
            </div>
            <DataTable
              columns={this.state.columns}
              data={this.state.rowData}
              selectableRowsHighlight
              highlightOnHover
              responsive
              fixedHeader
              striped
              style={{ marginBottom: '20px' }}
              noDataComponent={
                <div className="noDataWidth">
                  <Stack className="noRecordsWidth">
                    {this.props.isRecord
                      ? `${this.props.t('RECORDS')}`
                      : `${this.props.t('NO_RECORDS')}`}
                  </Stack>
                </div>
              }
            />
          </div>
        </div>
      </>
    );
  }
}

const ComponentTranslated = withTranslation()(withRouter(TempalteValueDetails));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated rowData1={[]} isRecord={false} />
    </Suspense>
  );
}

export default App;
