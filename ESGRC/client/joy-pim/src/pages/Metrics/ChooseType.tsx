import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import '@/global.css';
import ApiManager from '@/services/ApiManager';
import { IconButton, PrimaryButton, Stack, Text } from '@fluentui/react';
import AddLookUp from './AddLookup';

interface ChooseMetricTypeProps extends WithTranslation {
  onMetricTypeSelected: (type: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onLookUpSave: (data: { lookupTable: string; lookupTableColumn: string }) => void;
}

interface ChooseMetricTypeState {
  selectedType: number | null;
  name: string;
  label: string;
  showLookUpPopup: boolean;
  lookUpTableOptions: any[];
  lookUpColumnOptions: any[];
  metricTypes: Array<{ id: number; name: string; icon: string }>;
}

class ChooseMetricType extends Component<ChooseMetricTypeProps, ChooseMetricTypeState> {
  apiClient = new ApiManager().CreateApiClient();

  constructor(props: ChooseMetricTypeProps) {
    super(props);
    this.state = {
      selectedType: null,
      name: '',
      label: '',
      metricTypes: [],
      showLookUpPopup: false,
      lookUpColumnOptions: [],
      lookUpTableOptions: [],
    };
  }

  async componentDidMount(): Promise<void> {
    const metricTypes: any = (await this.apiClient.getAllMetricType()).result;
    const metricDetails = metricTypes.map((type: any) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
    }));
    this.setState({ metricTypes: metricDetails });
    this.getTableMetaData();
  }

  onLookupSaveClick(data: any): void {
    this.toggleLookUpPopup();
    this.props.onLookUpSave(data);
  }

  async getTableMetaData() {
    await this.apiClient
      .getTableMetaData()
      .then((res) =>
        this.setState({
          lookUpTableOptions: res?.result?.map((e: any) => ({ key: e.name, text: e.name })) ?? [],
        }),
      );
  }

  async getTableMetaDataColumns(tableName: string) {
    await this.apiClient
      .getTableMetaDataColumn(tableName)
      .then((res) =>
        this.setState({
          lookUpColumnOptions: res?.result?.map((e: any) => ({ key: e, text: e })) ?? [],
        }),
      );
  }

  withLookUpSave = (metric: any) => {
    this.toggleLookUpPopup();
    this.handleMetricTypeClick(metric.id);
  };

  toggleLookUpPopup(): void {
    this.setState({ showLookUpPopup: !this.state.showLookUpPopup });
  }

  handleMetricTypeClick = (type: number) => {
    this.setState({ selectedType: type }, () => {
      this.props.onMetricTypeSelected(type);
    });
  };

  handleNextClick = () => {
    this.setState({ selectedType: null, name: '', label: '' });
    this.props.onNext();
  };

  render() {
    const { t, onPrevious } = this.props;
    const { showLookUpPopup } = this.state;
    const next = t('NEXT') || '';
    const Previous = t('PREVIOUS') || '';

    return (
      <div className="choose-metric-container">
        <h4 className="choose-header">{t('CHOOSE_METRIC_TYPE')}</h4>
        <Stack
          tokens={{ childrenGap: 10 }}
          horizontalAlign="center"
          className="metric-grid-container"
        >
          {this.state.metricTypes.map((metric: any) => (
            <Stack
              key={metric.id}
              tokens={{ childrenGap: 5 }}
              className={`metric-type-button ${
                this.state.selectedType === metric.id ? 'selected' : ''
              }`}
              style={{ width: 'auto', cursor: 'pointer', height: 'auto' }}
            >
              <IconButton
                iconProps={{ iconName: metric.icon }}
                className="attributeIcon"
                title="Metric Type"
                ariaLabel="Metric Type"
                onClick={() => {
                  metric.name === 'LookUp'
                    ? this.withLookUpSave(metric)
                    : this.handleMetricTypeClick(metric.id);
                }}
              />
              <Text variant="small">{t(metric.name)}</Text>
            </Stack>
          ))}
        </Stack>
        <Stack
          className="buttons_choose"
          horizontalAlign="center"
          horizontal
          tokens={{ childrenGap: 10 }}
        >
          <PrimaryButton className="submitglobal" text={Previous} onClick={onPrevious} />
          <PrimaryButton
            className="submitglobal"
            text={next}
            onClick={this.handleNextClick}
            disabled={!this.state.selectedType}
          />
        </Stack>
        <AddLookUp
          isOpen={showLookUpPopup}
          lookUpTableOptions={this.state.lookUpTableOptions}
          lookUpColumnOptions={this.state.lookUpColumnOptions}
          toggleLookUp={() => this.toggleLookUpPopup()}
          onLookupSaveClick={(data: any) => this.onLookupSaveClick(data)}
          getLookUpColumns={(tableName: any) => this.getTableMetaDataColumns(tableName)}
        />
      </div>
    );
  }
}

export default withTranslation()(ChooseMetricType);
