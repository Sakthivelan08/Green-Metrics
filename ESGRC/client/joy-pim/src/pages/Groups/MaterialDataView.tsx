import { Pivot, PivotItem } from '@fluentui/react';
import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import MaterialGroups from './MaterialGroups';
import EditRegulation from '../../pages/Regulation/EditRegulations'
import EditMatricGroup from '../../pages/Groups/EditMetricGroup'
export class MaterialDataView extends React.Component<any, any> {
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
                <div className="bg-Color overflow-y-scroll">
                    <Link to={`/metrics/group`} className="headerText">
                        {t('MENU_METRICS')}/{t('GROUP')}/{t('METRIC_GROUP_DETAIL')}
                    </Link>
                    <div>
                        <div className="header-214">
                            <p>{`${this.props.t('MENU_METRICS')}`}</p>
                        </div>
                    </div>
                    <Pivot className="h-100">
                        <PivotItem headerText={t('Properties')}>
                            <EditMatricGroup />
                        </PivotItem>
                        <PivotItem headerText={t('Attribute')}>
                            <EditRegulation />
                        </PivotItem>
                        {isHierarchy && (
                            <PivotItem headerText={t('MaterialGroups')}>
                                <MaterialGroups />
                            </PivotItem>
                        )}
                    </Pivot>
                </div>
            </div>
        );
    }
}

const ComponentTranslated = withTranslation()(MaterialDataView);
function App() {
    return (
        <Suspense fallback="">
            <ComponentTranslated />
        </Suspense>
    );
}

export default App;
