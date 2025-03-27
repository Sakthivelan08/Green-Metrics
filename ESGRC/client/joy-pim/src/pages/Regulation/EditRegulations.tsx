import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import {
  Grid,
  Tabs,
  Tab,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Card,
} from '@mui/material';
import { Stack } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { PIMHearderText } from '../PimStyles';
import RegControls from '../Regulation/RegulationControl';
import ApiManager from '@/services/ApiManager';
import { t } from 'i18next';
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronDown20Regular,
} from '@fluentui/react-icons';
import ImprovementActions from '../Regulation/ImprovementActions';
import MaterialShow from '../../pages/Groups/Metriscshow';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

class EditRegulation extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();

  constructor(props: any) {
    super(props);
    this.state = {
      activeTab: 0,
      isSidebarCollapsed: false,
      metricDetails: null,
      activeUsers: [],
      expanded: false,
    };
  }

  componentDidMount() {
    this.fetchActiveUsers();
    this.fetchMetricDetails();
  }

  fetchMetricDetails = async () => {
    const { id } = this.props.location.state;
    try {
      const response = await this.apiClient.getMetricsWithId(id);
      const data = response.result;
      if (data && data.length > 0) {
        this.setState({ metricDetails: data[0] }, this.mapAndSetMetricDetails);
      }
    } catch (error) {
      console.error('Error fetching metric details:', error);
    }
  };

  fetchActiveUsers = async () => {
    try {
      const userResponse = await this.apiClient.activeUsers();
      this.setState({ activeUsers: userResponse.result || [] }, this.mapAndSetMetricDetails);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  mapAndSetMetricDetails = () => {
    const { metricDetails, activeUsers } = this.state;
    if (!metricDetails || activeUsers.length === 0) return;

    const createdByUser = activeUsers.find(
      (user: any) => user.id === metricDetails.createdBy,
    )?.firstName;
    const updatedByUser = activeUsers.find(
      (user: any) => user.id === metricDetails.updatedBy,
    )?.firstName;

    this.setState({
      metricDetails: {
        ...metricDetails,
        createdBy: createdByUser || metricDetails.createdBy,
        updatedBy: updatedByUser || metricDetails.updatedBy,
      },
    });
  };

  formatDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({ activeTab: newValue });
  };

  toggleSidebar = () => {
    this.setState((prevState: any) => ({ isSidebarCollapsed: !prevState.isSidebarCollapsed }));
  };

  handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    this.setState({
      expanded: isExpanded ? panel : false,
    });
  };

  renderSidebar = () => {
    const { metricDetails } = this.state;
    return (
      <div style={{ marginTop: '-20px' }}>
        <Link to={`/metrics/regulation`} className="headerText">
          {t('SUBMENU_REGULATIONS')}/{t('SUBMENU_CONTROLS')}
        </Link>
        <div
          className="sidebar"
          style={{
            marginTop: this.state.isSidebarCollapsed ? '71.5%' : '7.5%',
          }}
        >

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={this.toggleSidebar} aria-label="toggle sidebar">
              {this.state.isSidebarCollapsed ? <ChevronRight20Regular /> : <ChevronLeft20Regular />}
            </IconButton>
          </div>
          <Card style={{ minWidth: "540px", maxHeight: "500px",  overflow: "auto",scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1"}}>
            {!this.state.isSidebarCollapsed && (
              <div className='editRegulationCss'>
                <Accordion disableGutters>
                  <AccordionSummary expandIcon={null}>
                    <Typography style={{ fontSize: '1.1rem' }}>
                      <b>{this.props.t('COL_OVERVIEW')}</b>
                    </Typography>
                  </AccordionSummary>
                  {/* <AccordionDetails><Typography></Typography></AccordionDetails> */}
                </Accordion>

                <Accordion
                  expanded={this.state.expanded === 'panel2'}
                  onChange={this.handleAccordionChange('panel2')}
                >
                  <AccordionSummary expandIcon={<ChevronDown20Regular />}>
                    <Typography
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: this.state.expanded === 'panel2' ? 'bold' : 'normal',
                      }}
                    >
                      {this.props.t('COL_DETAILS')}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails >
                    <MaterialShow />

                  </AccordionDetails>
                </Accordion>


              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const { activeTab, isSidebarCollapsed } = this.state;

    return (
      <div className="layout width-100">
        <div className="bg-Color overflow-y-scroll">
          <Link to={`/metrics`} className="headerText headerText1">
            {t('MENU_METRICS')}/{t('SUBMENU_CONTROLS')}
          </Link>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={isSidebarCollapsed ? 0.5 : 3}>
              {this.renderSidebar()}
            </Grid>

            <Grid item xs={12} sm={isSidebarCollapsed ? 11 : 8.5} >
              <div style={{ marginLeft: isSidebarCollapsed ? '0%' : '35%' }}>
                <Stack>
                  <Text
                    className="color-blue text"
                    key={'xxLarge'}
                    variant={'xxLarge' as ITextProps['variant']}
                    styles={PIMHearderText}
                    nowrap
                    block
                  >
                    {t('Evidence List')}
                  </Text>
                </Stack>
                <hr />
                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={activeTab}
                    onChange={this.handleTabChange}
                    aria-label="controls tabs"
                    sx={{ fontFamily: 'Times New Roman' }}
                  >
                    <Tab label={t('Evidence Documents')} id="tab-0" aria-controls="tabpanel-0" />
                    <Tab label={t('COL_ACTIONS')} id="tab-1" aria-controls="tabpanel-1" />
                  </Tabs>

                  <TabPanel value={activeTab} index={0}>
                    <RegControls />
                  </TabPanel>
                  <TabPanel value={activeTab} index={1}>
                    <ImprovementActions />
                  </TabPanel>
                </Box>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(withRouter(EditRegulation));

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
