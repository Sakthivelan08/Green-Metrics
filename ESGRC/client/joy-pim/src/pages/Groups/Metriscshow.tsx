import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { withTranslation } from 'react-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import { ChevronDownRegular } from '@fluentui/react-icons';
class MaterialShow extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  stausofRecords = true;
  notify = new NotificationManager();
  url = new URL(window.location.href);

  constructor(props: any) {
    super(props);
    this.state = {
      A_D_Visible: false,
      isVisible: false,
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      copyRecord: [],
      searchKey: '',
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      groupid: this.url.searchParams.get('id'),
      isHierarchy: this.url.searchParams.get('isHierarchy') === 'true',
      dropdownOptions: [],
      selectedDropdownOptions: [],
      divisionSelected: [],
      deleteenable: false,
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh();
  }

  async refresh() {
    try {
      this.setState({ searchKey: '', isRecord: true });
      const apiResponse1: any = (await this.apiClient.getMetricAnswerOptionsDetails(this.state.groupid)).result;
      const currentRecord = apiResponse1?.map((item: any, index: any) => ({
        index: index + 1,
        ...item,
      }));
      const copyRecord = [...currentRecord];
      const apiResponse2: any = (await this.apiClient.getMetric()).result;
      const dropdownOptions = [
        { key: 'selectAll', text: 'Select All' },
        ...apiResponse2
          .filter((metric: any) => !currentRecord.some((record: any) => record.metricId === metric.id))
          .map((item: any) => ({
            key: item.id,
            text: item.metricsQuestion,
          })),
      ];

      this.setState({
        currentRecord,
        copyRecord,
        dropdownOptions,
      });
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
    this.setState({
      A_D_Visible: false,
      noSelection: !this.state.noSelection,
      enableEditButton: false,
      enableActiveButton: false,
      selectedRowData: [],
      isRecord: false,
    });
  }

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };

  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };

  rowSelection = (e: any) => {
    this.setState({ selectedRowData: e.selectedRows, deleteenable: true });

    const selectionCount = e.selectedCount;
    switch (selectionCount) {
      case 0:
        this.setState({ enableEditButton: false, enableActiveButton: false });
        break;
      case 1:
        this.setState({ enableEditButton: true, enableActiveButton: true });
        break;
      default:
        this.setState({ enableEditButton: false, enableActiveButton: true });
        break;
    }
  };

  handleRowClick = (row: any) => {
    this.setState({
      visible: true,
      selectedRowData: [row],
    });
  };

  handleCreateNewClick = () => {
    this.setState({ showMetricTypeChooser: true });
  };

  handleMetricTypeSelected = (type: string) => {
    this.setState({ showMetricTypeChooser: false, visible: true });
  };

  OnSave = async () => {
    const { divisionSelected, groupid } = this.state;
    const ids = divisionSelected;
    try {
      if (ids && ids.length > 0 && groupid) {
        const response = await this.apiClient.updateMetric(ids, groupid);

        if (response?.hasError) {
          this.notify.showErrorNotify(`${t('METRICID_ALREADY_EXISTS')}`);
        } else {
          this.notify.showSuccessNotify(`${t('ADDED_SUCCESSFULLY')}`);
        }

        this.setState({ divisionSelected: '' });
        await this.refresh();
      } else {
        this.notify.showErrorNotify(`${t('NO_DATA')}`);
      }
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  };





  render() {
    const { currentRecord } = this.state;
    const { t } = this.props;

    return (
      <div>
      {currentRecord?.map((record:any, index:any) => (
        <Accordion key={record.id}>
          <AccordionSummary
            expandIcon={<ChevronDownRegular />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            <Typography>{`Record ${index + 1}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(record.responseJson).map(([key, value]) => (
              <Typography key={key}>
                <strong>{key}:</strong> {value}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

    </div>    );
  }
}

const ComponentTranslated: any = withTranslation()(MaterialShow);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
