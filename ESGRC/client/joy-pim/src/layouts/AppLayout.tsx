import { Route, withRouter } from 'react-router-dom';
import React, { useState } from 'react';
import AppHeader from './AppHeader';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import ParseToken from '@/pages/ParseToken';
import Role from '@/pages/UserDetails/Role';
import User from '@/pages/UserDetails/User';
import Overview from '@/pages/Overview';
import AppSidebar from './AppSidebar';
import SupplierQASheet from '@/pages/Supplier/SupplierQASheet';
import SupplierOrgCreation from '@/pages/Supplier/SupplierOrgCreation';
import Chart from '@/pages/ChartComponents/Chart';
import PageNotFound from '@/pages/PageNotFound';
import City from '@/pages/Geograpthy/City';
import Metricgroup from '@/pages/Groups/Metricgroup';
import Metrics from '@/pages/Metrics/Metrics';
import MetricGroup from '@/pages/Groups/Metricgroup';
import MetricGroupDetail from '@/pages/Groups/MetricGroupDetail';
import Templates from '@/pages/Templates/Templates';
import EditMetrics from '@/pages/Metrics/EditMetrics';
import AddorUpdateMetricts from '@/pages/Metrics/AddorUpdateMetricts';
import ProcessList from '@/pages/ProcessList/ProcessList';
import AddStages from '@/pages/ProcessList/AddStages';
import TemplateMetric from '@/pages/Templates/TemplateMetric';
import Compliance from '@/pages/Compliance/Compliance';
import ComplianceList from '@/pages/Compliance/ComplianceList';
import TemplateQuestion from '@/pages/Compliance/TemplateQuestion';
import Dashboard from '@/Dashboard/Dashboard';
import Report from '@/Dashboard/Report';
// import InspectionRequest from '@/Dashboard/inspectionRequest';
import Industery from '@/pages/Groups/Industery';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import InspectionRequest from '@/Dashboard/InspectionRequest';
import Scheduler from '@/pages/Scheduler/Scheduler';
import Audit from '@/pages/Audit/Audit';
import Query from '@/pages/Compliance/QueryRaise';
import QueryRaise from '@/pages/Compliance/QueryRaise';
import TempalteValueDetails from '@/pages/Compliance/TemplateValueDetails';
import Period from '@/pages/Period/Period';
import Fiscalyear from '@/pages/Fiscalyear/Fiscalyear';
import Standard from '@/pages/Standard/Standard';
import Goalsetting from '@/pages/GoalSetting/Goalsetting';
import Regulation from '@/pages/Regulation/Regulation';

import EditRegulations from '@/pages/Regulation/EditRegulations';

import Assessment from '@/pages/Assessment/assessment';
import AddAssessment from '@/pages/Assessment/AddAssessment';
import AssessmentMetric from '@/pages/Assessment/AssessmentMetric';
import SFTPUpload from '@/pages/SFTPUpload/SFTPUpload';
import timedimension from '@/pages/TimeDimesion/timedimesion';

import Reports from '@/Reports/Reports';
import Publish from '@/pages/ProcessList/PublishView';
import NewReport from '@/pages/Report/Report';
import TimeDimension from '@/pages/TimeDimension/TimeDimension';
import ConversionFormula from '@/pages/CoversionFormula/ConversionFormula';
import CreateImportTemplate from '@/pages/CreateImportTemplate/CreateImportTemplate';
import TimeDimensionDataview from '@/pages/TimeDimensionDataview/TimeDimensionDataview';
import Excelview from '@/pages/Excelview/Excelview';
import TableDataview from '@/pages/Excelview/TableDataview';
import AirEmissionReport from '@/pages/AirEmissionReport/AirEmissionReport';
import BasicBars from '@/pages/Overview/Overview';
import { Integration } from '@/pages/Integration-components/integration/Integration';
import { ApiMapping } from '@/pages/Integration-components/api-mapping/ApiMapping';
import { Mapping } from '@/pages/Integration-components/mapping/Mapping';
import { MetaData } from '@/pages/Integration-components/meta-data/MetaData';
import MaterialDataView from '@/pages/Groups/MaterialDataView';
import MaterialGroup from '@/pages/Groups/MaterialGroup';

class AppLayout extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      headerData: null,
      accessData: props?.accessData,
      navigationData: props?.navigationData,
    };
    this.handleHeaderData = this.handleHeaderData.bind(this);
  }

  handleHeaderData(data: any) {
    this.setState({ headerData: data });
    this.props.history.push(`/${data?.toLowerCase()}`);
  }

  render() {
    const isAuthenticated = this.props.isAuthenticated;
    const user = this.props.user;
    const userrole: any[] = user?.roleId;
    const notDesigner = !(
      userrole?.filter((element: any) => element == 5 || element == 4).length > 0
    );

    const navItemRenderValidation = (e: any): boolean => {
      // return true
      if (e) {
        const hasItemInAccess: any = this.state?.navigationData?.filter(
          (item: any) => item?.accessName?.toLowerCase()?.trim() === e?.toLowerCase()?.trim(),
        );
        if (hasItemInAccess?.length > 0) {
          return true;
        }
        return false;
      }
      return false;
    };

    return (
      <>
        <DndProvider backend={HTML5Backend}>
          <div className="parent">
            {isAuthenticated && (
              <AppHeader
                accessData={this.props?.accessData}
                navigationData={this.props?.navigationData}
                onDataEmit={this.handleHeaderData}
              />
            )}
            <div className="main">
              {isAuthenticated && notDesigner && (
                <AppSidebar
                  headerData={this.state.headerData}
                  accessData={this.props?.accessData}
                  navigationData={this.props?.navigationData}
                />
              )}
              <div className="appcontent content">
                <Route exact path="/" component={Login} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/overview" component={'/overview' ? Dashboard : PageNotFound} />
                <Route
                  exact
                  path="/user/geography/city"
                  component={
                    navItemRenderValidation('/user/geography/city') &&
                      navItemRenderValidation('/user')
                      ? City
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/group"
                  component={
                    navItemRenderValidation('/home/group') && navItemRenderValidation('/home')
                      ? MetricGroup
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/materialgroup"
                  component={
                    navItemRenderValidation('/home/materialgroup') && navItemRenderValidation('/home')
                      ? MaterialGroup
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/configuration/regulation"
                  component={
                    navItemRenderValidation('/configuration/regulation') && navItemRenderValidation('/configuration')
                      ? Regulation
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/configuration/regulation/Controls"
                  component={
                    navItemRenderValidation('/configuration/regulation/Controls') &&
                      navItemRenderValidation('/configuration')
                      ? EditRegulations
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/templates"
                  component={
                    navItemRenderValidation('/home/templates') &&
                      navItemRenderValidation('/home')
                      ? Templates
                      : PageNotFound
                  }

                />
                <Route
                  exact
                  path="/users/user"
                  component={
                    navItemRenderValidation('/users/user') && navItemRenderValidation('/configuration')
                      ? User
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/users/role"
                  component={
                    navItemRenderValidation('/users/role') && navItemRenderValidation('/setting')
                      ? Role
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/AirReports"
                  component={
                    navItemRenderValidation('/home/AirReports') &&
                      navItemRenderValidation('/home')
                      ? AirEmissionReport
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/bsrpdf"
                  component={
                    navItemRenderValidation('/home/bsrpdf') &&
                      navItemRenderValidation('/home')
                      ? Reports
                      : PageNotFound
                  }
                // component={Report}
                />
                <Route
                  exact
                  path="/home/SelectedReports"
                  component={
                    navItemRenderValidation('/home/SelectedReports') &&
                      navItemRenderValidation('/home')
                      ? NewReport
                      : PageNotFound
                  }

                // component={Report}
                />
                <Route
                  exact
                  path="/configuration/SFTPUpload"
                  component={
                    navItemRenderValidation('/configuration/SFTPUpload') &&
                      navItemRenderValidation('/configuration')
                      ? SFTPUpload
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/configuration/ConversionFormula"
                  component={
                    navItemRenderValidation('/configuration/ConversionFormula') &&
                      navItemRenderValidation('/configuration')
                      ? ConversionFormula
                      : PageNotFound

                  }

                />
                <Route
                  exact
                  path="/configuration/CreateImportTemplate"
                  component={
                    navItemRenderValidation('/configuration/CreateImportTemplate') &&
                      navItemRenderValidation('/configuration')
                      ? CreateImportTemplate
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/configuration/Excelview"
                  component={
                    navItemRenderValidation('/configuration/Excelview') &&
                      navItemRenderValidation('/configuration')
                      ? TableDataview
                      : PageNotFound
                  }
                //component={TableDataview}
                />
                <Route
                  exact
                  path="/configuration/CalculatedDataview"
                  component={
                    navItemRenderValidation('/configuration/CalculatedDataview') &&
                      navItemRenderValidation('/configuration')
                      ? TimeDimensionDataview
                      : PageNotFound
                  }
                /> <Route
                  exact
                  path="/configuration/MetricDataDashboard"
                  component={
                    navItemRenderValidation('/configuration/MetricDataDashboard') &&
                      navItemRenderValidation('/configuration')
                      ? BasicBars
                      : PageNotFound
                  }
                />
                <Route exact path="/configuration/integration" component={Integration} />
                <Route exact path="/configuration/mapping" component={Mapping} />
                <Route exact path="/configuration/metaData" component={MetaData} />
                <Route exact path="/configuration/apiMapping" component={ApiMapping} />


                {/* <Route
                exact
                path="/activity"
                component={
                  navItemRenderValidation('/activity')
                    ? PageNotFound
                    : PageNotFound
                }
              />
              <Route
                exact
                path="/metrics"
                component={
                  navItemRenderValidation('/metrics')
                    ? PageNotFound
                    : PageNotFound
                }
              /> */}
                <Route
                  exact
                  path="/SupplierQASheet"
                  component={
                    navItemRenderValidation('/supplierQAForm') ? SupplierQASheet : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/supplier"
                  component={
                    navItemRenderValidation('/supplier') ? SupplierOrgCreation : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/setting/chart"
                  component={navItemRenderValidation('/setting/chart') ? Chart : PageNotFound}
                />
                <Route
                  exact
                  path="/setting/user"
                  component={
                    navItemRenderValidation('/setting/user') && navItemRenderValidation('/setting')
                      ? User
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/setting/role"
                  component={
                    navItemRenderValidation('/setting/role') && navItemRenderValidation('/setting')
                      ? Role
                      : PageNotFound
                  }
                />
                {/* <Route
                  exact
                  path="/metrics/group"
                  component={
                    navItemRenderValidation('/metrics/group') && navItemRenderValidation('/metrics')
                      ? MetricGroup
                      : PageNotFound
                  }
                /> */}
                <Route
                  exact
                  path="/metrics/metric"
                  component={
                    navItemRenderValidation('/metrics/metric') &&
                      navItemRenderValidation('/metrics')
                      ? Metrics
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/metric/editmetric"
                  component={
                    navItemRenderValidation('/metrics/metric/editmetric') &&
                      navItemRenderValidation('/metrics')
                      ? EditMetrics
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/activity/geography/city"
                  component={
                    navItemRenderValidation('/activity/geography/city') &&
                      navItemRenderValidation('/activity')
                      ? City
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/templates"
                  component={
                    navItemRenderValidation('/metrics/templates') &&
                      navItemRenderValidation('/metrics')
                      ? Templates
                      : PageNotFound
                  }
                //component={Templates}
                />

                <Route
                  exact
                  path="/metrics/templates/templatemetric"
                  component={
                    navItemRenderValidation('/metrics/templates') &&
                      navItemRenderValidation('/metrics')
                      ? TemplateMetric
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/templates/templatemetric"
                  component={
                    navItemRenderValidation('/home/templates') &&
                      navItemRenderValidation('/home')
                      ? TemplateMetric
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/regulation/Controls"
                  component={
                    navItemRenderValidation('/metrics/regulation/Controls') &&
                      navItemRenderValidation('/metrics')
                      ? EditRegulations
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/timedimenison"
                  component={
                    navItemRenderValidation('/metrics/timedimenison') &&
                      navItemRenderValidation('/metrics')
                      ? TimeDimension
                      : PageNotFound
                  }
                //component={TimeDimension}
                />
                <Route
                  exact
                  path="/activity/Excelview"
                  component={
                    navItemRenderValidation('/activity/Excelview') &&
                      navItemRenderValidation('/activity')
                      ? TableDataview
                      : PageNotFound
                  }
                //component={TableDataview}
                />

                {/*  <Route
                  exact
                  path="/metrics/Regulations/EditRegulation"
                  component={EditRegulations}
                />
                <Route
                  exact
                  path="/metrics/Regulations/Controls"
                  component={RegControl}
                />
                <Route
                  exact
                  path="/metrics/Regulations/Tab2Controls"
                  component={Tab2Controls}
                />
                <Route
                  exact
                  path="/metrics/Regulations/Tab2Controls"
                  component={Tab3Controls}
                /> */}
                {/* <Route

                component={'/metrics/templates/templateMetric' ? TemplateMetric : PageNotFound}
              //component={TemplateMetric}
              /> */}

                <Route exact path="/metrics/process/add" component={AddStages} />
                <Route exact path="/configuration/process/add" component={AddStages} />
                {/* <Route exact path="/activity/pdfreport"
                  component={
                    navItemRenderValidation('/activity/pdfreport') &&
                      navItemRenderValidation('/activity')
                      ? Reports
                      : PageNotFound
                  }
                /> */}
                <Route
                  exact
                  path="/metrics/process"
                  component={
                    navItemRenderValidation('/metrics/process') &&
                      navItemRenderValidation('/metrics')
                      ? ProcessList
                      : PageNotFound
                  }

                // component={ProcessList}
                />
                <Route
                  exact
                  path="/configuration/process"
                  component={
                    navItemRenderValidation('/configuration/process') &&
                      navItemRenderValidation('/configuration')
                      ? ProcessList
                      : PageNotFound
                  } />
                <Route
                  exact
                  path="/home/compliance"
                  component={
                    // navItemRenderValidation('/home/compliance') &&
                    //   navItemRenderValidation('/home')
                    //   ? Compliance
                    //   : PageNotFound
                    Compliance
                  }
                //component={Compliance}
                />
                <Route
                  exact
                  path="/home/complianceList"
                  component={
                    navItemRenderValidation('/home/complianceList') &&
                      navItemRenderValidation('/home')
                      ? ComplianceList
                      : PageNotFound
                  } />
                <Route
                  exact
                  path="/metrics/compliance"
                  component={
                    navItemRenderValidation('/metrics/compliance') &&
                      navItemRenderValidation('/metrics')
                      ? Compliance
                      : PageNotFound
                  }
                //component={Compliance}
                />
                <Route
                  exact
                  path="/metrics/complianceList"
                  component={
                    navItemRenderValidation('/metrics/complianceList') &&
                      navItemRenderValidation('/metrics')
                      ? ComplianceList
                      : PageNotFound
                  }
                //component={Compliance}
                />
                <Route exact path="/home/publish" component={Publish} />
                <Route
                  exact
                  path="/metrics/complianceList/:templateId"
                  component={
                    navItemRenderValidation('/metrics/complianceList') &&
                      navItemRenderValidation('/metrics')
                      ? TemplateQuestion
                      : PageNotFound
                  }
                />

                <Route
                  exact
                  path="/metrics/group/metricGroupDetail"
                  component={'/metrics/group/metricGroupDetail' ? MetricGroupDetail : PageNotFound}
                />
                <Route
                  exact
                  path="/home/group/metricGroupDetail"
                  component={'/home/group/metricGroupDetail' ? MetricGroupDetail : PageNotFound}
                />
                <Route
                  exact
                  path="/home/materialgroup/materialdataview"
                  component={'/home/materialgroup/materialdataview' ? MaterialDataView : PageNotFound}
                />

                <Route
                  exact
                  path="/setting/gruops/addmetricts"
                  component={'/setting/gruops/addmetricts' ? AddorUpdateMetricts : PageNotFound}
                />

                <Route
                  exact
                  path="/activity/queries"
                  component={
                    navItemRenderValidation('/activity/queries') &&
                      navItemRenderValidation('/activity')
                      ? QueryRaise
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/home/queries"
                  component={
                    navItemRenderValidation('/home/queries') &&
                      navItemRenderValidation('/home')
                      ? QueryRaise
                      : PageNotFound
                  }
                />


                <Route
                  exact
                  path="/activity/dashboard"
                  component={
                    navItemRenderValidation('/activity/dashboard') &&
                      navItemRenderValidation('/activity')
                      ? Dashboard
                      : PageNotFound
                  }
                // component={Dashboard}
                />

                <Route
                  exact
                  path="/activity/report"
                  component={
                    navItemRenderValidation('/activity/report') &&
                      navItemRenderValidation('/activity')
                      ? Report
                      : PageNotFound
                  }
                // component={Report}
                />

                <Route
                  exact
                  path="/activity/bsrpdf"
                  component={
                    navItemRenderValidation('/activity/bsrpdf') &&
                      navItemRenderValidation('/activity')
                      ? Reports
                      : PageNotFound
                  }
                // component={Report}
                />
                <Route
                  exact
                  path="/activity/AirReports"
                  // component={
                  //   navItemRenderValidation('/activity/airemissionreport') &&
                  //     navItemRenderValidation('/activity')
                  //     ? AirReports
                  //     : PageNotFound
                  // }
                  component={AirEmissionReport}
                />

                <Route
                  exact
                  path="/activity/inspection"
                  component={
                    navItemRenderValidation('/activity/inspection') &&
                      navItemRenderValidation('/activity')
                      ? InspectionRequest
                      : PageNotFound
                  }
                // component={InspectionRequest}
                />
                <Route
                  exact
                  path="/metrics/regulation"
                  component={
                    navItemRenderValidation('/metrics/regulation') &&
                      navItemRenderValidation('/activity')
                      ? Regulation
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/assessment"
                  component={
                    navItemRenderValidation('/metrics/assessment') &&
                      navItemRenderValidation('/metrics')
                      ? Assessment
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/assessment/addassessment"
                  component={
                    navItemRenderValidation('/metrics/assessment/addassessment') &&
                      navItemRenderValidation('/metrics')
                      ? AddAssessment
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/assessment/assessmentmetrics"
                  // component={
                  //   navItemRenderValidation('/metrics/assessment/assessmentmetrics') &&
                  //     navItemRenderValidation('/metrics')
                  //     ? AssessmentMetric
                  //     : PageNotFound
                  // }
                  component={AssessmentMetric}
                />

                <Route
                  exact
                  path="/metrics/industry"
                  component={
                    navItemRenderValidation('/metrics/industry') &&
                      navItemRenderValidation('/metrics')
                      ? Industery
                      : PageNotFound
                  }
                // component={Industery}
                />

                <Route
                  exact
                  path="/metrics/assessmentgroup"
                  component={
                    navItemRenderValidation('/metrics/assessmentgroup') &&
                      navItemRenderValidation('/metrics')
                      ? Audit
                      : PageNotFound
                  }
                //component={Audit}
                />
                <Route
                  exact
                  path="/configuration/assessmentgroup"
                  component={
                    navItemRenderValidation('/configuration/assessmentgroup') &&
                      navItemRenderValidation('/configuration')
                      ? Audit
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/period"
                  component={
                    navItemRenderValidation('/metrics/period') &&
                      navItemRenderValidation('/metrics')
                      ? Period
                      : PageNotFound
                  }
                //component={Audit}
                />
                <Route
                  exact
                  path="/metrics/fiscalyear"
                  component={
                    navItemRenderValidation('/metrics/fiscalyear') &&
                      navItemRenderValidation('/metrics')
                      ? Fiscalyear
                      : PageNotFound
                  }
                //component={Audit}
                />
                <Route
                  exact
                  path="/metrics/standard"
                  component={
                    navItemRenderValidation('/metrics/standard') &&
                      navItemRenderValidation('/metrics')
                      ? Standard
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/metrics/goalsetting"
                  component={
                    navItemRenderValidation('/metrics/goalsetting') &&
                      navItemRenderValidation('/metrics')
                      ? Goalsetting
                      : PageNotFound
                  }
                />

                <Route
                  exact
                  path="/activity/SFTPUpload"
                  component={
                    navItemRenderValidation('/activity/SFTPUpload') &&
                      navItemRenderValidation('/activity')
                      ? SFTPUpload
                      : PageNotFound
                  }
                />
                <Route
                  exact
                  path="/activity/TimeDimension"
                // component={
                //   navItemRenderValidation('/activity/TimeDimension') &&
                //     navItemRenderValidation('/activity')
                //     ? timedimension
                //     : PageNotFound
                // }
                //component={timedimension}
                />

                {/* <Route
                  exact
                  path="/metrics/complianceLists/tempalteValueDetails"
                  component={TempalteValueDetails}
                /> */}

                <Route
                  exact
                  path="/home/complianceLists/tempalteValueDetails"
                  component={TempalteValueDetails}
                />

                <Route exact path="/metrics/complianceLists/Publish" component={Publish} />
                <Route exact path="/home/complianceLists/Publish" component={Publish} />


                <Route
                  exact
                  path="/activity/SelectedReports"
                  component={
                    navItemRenderValidation('/activity/SelectedReports') &&
                      navItemRenderValidation('/activity')
                      ? NewReport
                      : PageNotFound
                  }
                // component={Report}
                />

                <Route
                  exact
                  path="/activity/ConversionFormula"
                  component={
                    navItemRenderValidation('/activity/ConversionFormula') &&
                      navItemRenderValidation('/activity')
                      ? ConversionFormula
                      : PageNotFound
                  }
                />

                <Route
                  exact
                  path="/activity/CreateImportTemplate"
                  component={
                    navItemRenderValidation('/activity/CreateImportTemplate') &&
                      navItemRenderValidation('/activity')
                      ? CreateImportTemplate
                      : PageNotFound
                  }
                />

                <Route
                  exact
                  path="/activity/CalculatedDataview"
                  component={
                    navItemRenderValidation('/activity/CalculatedDataview') &&
                      navItemRenderValidation('/activity')
                      ? TimeDimensionDataview
                      : PageNotFound
                  }
                />

                <Route
                  exact
                  path="/activity/MetricDataDashboard"
                  component={
                    navItemRenderValidation('/activity/MetricDataDashboard') &&
                      navItemRenderValidation('/activity')
                      ? BasicBars
                      : PageNotFound
                  }
                />

                <Route exact path="/logout" component={Logout} />
                <Route path="/parsetoken" component={ParseToken} />
                {/* <Route path="*" component={PageNotFound} /> */}
              </div>
            </div>
          </div>
        </DndProvider>
      </>
    );
  }
}
export default withRouter(AppLayout);
