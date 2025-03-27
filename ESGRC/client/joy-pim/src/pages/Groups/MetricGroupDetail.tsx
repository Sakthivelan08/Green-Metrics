import { Pivot, PivotItem } from '@fluentui/react';
import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import MetricsShow from '../Groups/Metriscshow';
import EditMatricGroup from './EditMetricGroup';
import { Link } from 'react-router-dom';
import MetricGroups from './MetricGroups';
import OldMetricshow from './OldMetricshow';
export class MetricGroupDetail extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    const { t } = this.props;
    const urlParams = new URLSearchParams(window.location.search);
    const isHierarchy = urlParams.get('isHierarchy') === 'true';
    console.log('isHierarchy:', isHierarchy);

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/group`} className="headerText">
            {t('MENU_METRICS')}/{t('GROUP')}/{t('METRIC_GROUP_DETAIL')}
          </Link>
          <div>
            <div className="header-214">
              <p>{`${this.props.t('MENU_METRICGROUP')}`}</p>
            </div>
          </div>
          <Pivot className="h-100">
            <PivotItem headerText={t('PROPERTIES')}>
              <EditMatricGroup />
            </PivotItem>
            <PivotItem headerText={t('ATTRIBUTES')}>
              {/* <MetricsShow /> */}
              <OldMetricshow />
            </PivotItem>
            {isHierarchy && (
              <PivotItem headerText={t('METRIC_GROUP')}>
                <MetricGroups />
              </PivotItem>
            )}
          </Pivot>
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(MetricGroupDetail);
function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
