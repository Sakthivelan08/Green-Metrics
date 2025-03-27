import React, { Component } from 'react';
import {
  Stack,
  TextField,
  PrimaryButton,
  Checkbox,
  Text,
  TooltipHost,
} from '@fluentui/react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { withTranslation } from 'react-i18next';
import ApiManager from '@/services/ApiManager';
import { t } from 'i18next';
import NotificationManager from '@/services/NotificationManager';

interface EnterMetricNameLabelProps {
  onSave: (
    name: string,
    metricsQuestion: string,
    groupId: number,
    validationId: number,
    esgrcType: number,
    uom: number,
    prefix:number | undefined,
    category: number,
    standard: number,
    department: number,
    Services: number,
    RegulationType: number,
  ) => void;
  onPrevious: () => void;
  selectedRegulationType:'',
}

interface EnterMetricNameLabelState {
  name: string;
  metricsQuestion: string;
  metricOptions: IDropdownOption[];
  selectedMetric: number | null;
  validationOptions: any[];
  selectedValidationOptions: any;
  esgrcTypeOptions: IDropdownOption[];
  selectedEsgrcType: number | null;
  uomOptions: IDropdownOption[];
  selectedUom: number | null;
  prefixOptions: IDropdownOption[];
  selectedPrefix: number | undefined;
  categoryOptions: IDropdownOption[];
  selectedCategory: number | null;
  standardOptions: IDropdownOption[];
  selectedStandard: number | null;
  departmentOptions: IDropdownOption[];
  selectedDepartment: number | null;
  selectedregulationtype: number | null;
  servicesOptions: IDropdownOption[];
  regulationOptions: IDropdownOption[];
  selectedServices: number | null;
  isKeyIndicator: boolean;
  isUnique: boolean;
  selectedMetricText: string | '';
}

class EnterMetricNameLabel extends Component<EnterMetricNameLabelProps, EnterMetricNameLabelState> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();

  constructor(props: EnterMetricNameLabelProps) {
    super(props);
    this.state = {
      name: '',
      metricsQuestion: '',
      metricOptions: [],
      selectedMetric: null,
      validationOptions: [],
      selectedValidationOptions: [],
      esgrcTypeOptions: [],
      selectedEsgrcType: null,
      uomOptions: [],
      selectedUom: null,
      prefixOptions: [],
      selectedPrefix: undefined,
      categoryOptions: [],
      selectedCategory: null,
      standardOptions: [],
      selectedStandard: null,
      departmentOptions: [],
      selectedDepartment: null,
      servicesOptions: [],
      regulationOptions: [],
      selectedregulationtype: null,
      selectedServices: null,
      isKeyIndicator: false,
      isUnique: false,
      selectedMetricText: '',
    };
  }

  componentDidMount() {
    const { selectedRegulationType } = this.props;
    this.setState({
      selectedregulationtype: selectedRegulationType ? parseInt(selectedRegulationType, 10) : null,
    });
    this.getMetricGroups();
    this.getValidationList();
    this.getEsgrcTypes();
    this.getUomOptions();
    this.getPrefixOptions();
    this.getCategoryOptions();
    this.getStandardOptions();
    this.getDepartmentOptions();
    this.getservices();
    this.getRegulationtype();
  }

  componentDidUpdate(prevProps: EnterMetricNameLabelProps) {
    if (prevProps.selectedRegulationType !== this.props.selectedRegulationType) {
      this.setState({
        selectedregulationtype: this.props.selectedRegulationType ?? null,
      });
    }
  }

  async getMetricGroups() {
    try {
      const options = await this.apiClient.getActiveMetricGroupsWithCount();
      const metricOptions =
        options?.result?.map((e: any) => ({
          key: e.groupId,
          text: e.name,
        })) ?? [];
      this.setState({ metricOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getEsgrcTypes() {
    try {
      const response = await this.apiClient.getEsgrc();
      const esgrcTypeOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ esgrcTypeOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getUomOptions() {
    try {
      const response = await this.apiClient.getUom();
      const uomOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ uomOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getPrefixOptions() {
    try {
      const response = await this.apiClient.getMetricsPrefix();
      const prefixOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ prefixOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getCategoryOptions() {
    try {
      const response = await this.apiClient.getCategory();
      const categoryOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ categoryOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getStandardOptions() {
    try {
      const response = await this.apiClient.getStandards();
      const standardOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ standardOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getDepartmentOptions() {
    try {
      const response = await this.apiClient.getDepartment();
      const departmentOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ departmentOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getservices() {
    try {
      const response = await this.apiClient.getServices();
      const servicesOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState({ servicesOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  async getRegulationtype() {
    try {
      const response = await this.apiClient.getTypes();
      const regulationOptions: IDropdownOption[] = (response?.result ?? []).map((e: any) => ({
        key: e.id ?? 0,
        text: e.name ?? '',
      }));
      this.setState((prevState:any) => ({
        regulationOptions,
        selectedregulationtype: prevState.selectedregulationtype ?? regulationOptions[0]?.key ?? null,
      }));    
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
  }

  async getValidationList() {
    try {
      const options = await this.apiClient.getValidationList();
      const validationOptions = options?.result ?? [];
      this.setState({ validationOptions });
    } catch (error: any) {
      this.notify.showErrorNotify(error.message);
    }
  }

  handleNameChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
  ) => {
    this.setState({ name: newValue || '' });
  };

  handleLabelChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
  ) => {
    this.setState({ metricsQuestion: newValue || '' });
  };

  handleMetricChange = (e: any, option?: IDropdownOption) => {
    this.setState({
      selectedMetric: option?.key as number,
      selectedMetricText: option?.text || '',
    });
  };

  handleEsgrcTypeChange = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedEsgrcType: option?.key as number });
  };

  handleUomChange = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedUom: option?.key as number });
  };

  handlePrefixChange = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedPrefix: option?.key as number });
  };

  handleCategoryChange = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedCategory: option?.key as number });
  };

  handleStandardChange = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedStandard: option?.key as number });
  };

  handleDepartmentChange = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedDepartment: option?.key as number });
  };

  handleRegulationstype = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedregulationtype: option?.key as number });
  };

  handleServices = (e: any, option?: IDropdownOption) => {
    this.setState({ selectedServices: option?.key as number });
  };

  handleKeyIndicatorChange = (ev: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
    this.setState({ isKeyIndicator: isChecked || false });
  };

  handleUniqueChange = (ev: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
    this.setState({ isUnique: isChecked || false });
  };

  handleCheckboxChange = (ev: React.FormEvent<HTMLElement>, isChecked: boolean, id: number) => {
    const { selectedValidationOptions } = this.state;
    const updatedSelectedOptions = isChecked
      ? [...selectedValidationOptions, id]
      : selectedValidationOptions.filter((optionId: any) => optionId !== id);

    this.setState({ selectedValidationOptions: updatedSelectedOptions });
  };

  handleSave = () => {
    const {
      name,
      metricsQuestion,
      selectedMetric,
      selectedValidationOptions,
      selectedEsgrcType,
      selectedUom,
      selectedPrefix,
      selectedCategory,
      selectedStandard,
      selectedDepartment,
      selectedServices,
      selectedregulationtype,
    } = this.state;

    if (
      selectedMetric !== null &&
      selectedEsgrcType !== null &&
      selectedUom !== null &&
      selectedCategory !== null &&
      selectedStandard !== null &&
      selectedDepartment !== null &&
      selectedServices !== null &&
      selectedregulationtype !== null
    ) {
      this.props.onSave(
        name,
        metricsQuestion,
        selectedMetric,
        selectedValidationOptions,
        selectedEsgrcType,
        selectedUom,
        selectedPrefix, 
        selectedCategory,
        selectedStandard,
        selectedDepartment,
        selectedregulationtype,
        selectedServices,
      );
    } else {
      this.notify.showErrorNotify('Please fill in all required fields.');
    }
  };

  splitIntoRows = (arr: any[], itemsPerRow: number) => {
    const rows = [];
    for (let i = 0; i < arr.length; i += itemsPerRow) {
      rows.push(arr.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  render() {
    const { onPrevious } = this.props;
    const {
      name,
      metricsQuestion,
      metricOptions,
      selectedMetric,
      validationOptions,
      selectedValidationOptions,
      esgrcTypeOptions,
      selectedEsgrcType,
      uomOptions,
      selectedUom,
      prefixOptions,
      selectedPrefix,
      categoryOptions,
      selectedCategory,
      standardOptions,
      selectedStandard,
      departmentOptions,
      selectedDepartment,
      isKeyIndicator,
      isUnique,
      selectedServices,
      regulationOptions,
      servicesOptions,
      selectedregulationtype,
    } = this.state;
    const nameLabel = t('COL_NAME') || '';
    const metricquestionLabel = t('COL_METRICQUESTIONS') || '';
    const metricGroupLabel = t('MENU_METRICS_GROUP') || '';
    const esgrcTypeLabel = 'ESGRC Type';
    const rows = this.splitIntoRows(validationOptions, 3);
    const columnStackTokens = { childrenGap: 10, padding: 5 };
    const { selectedMetricText } = this.state;

    return (
      <div className="modal-container">
        <div className="form-container">
          <Stack tokens={{ childrenGap: 20 }}>
            <div className="grid-container">
              <div className="left-column">
                <TextField
                  className="metrix"
                  required
                  label={metricquestionLabel}
                  value={metricsQuestion}
                  onChange={this.handleLabelChange}
                  multiline
                />
                <TooltipHost content={selectedMetricText || 'Select a metric group'}>
                  <Dropdown
                    className="metrix"
                    label={metricGroupLabel}
                    placeholder={metricGroupLabel}
                    options={metricOptions}
                    onChange={this.handleMetricChange}
                    selectedKey={selectedMetric}
                  />
                </TooltipHost>
                <Dropdown
                  className="metrix"
                  label={esgrcTypeLabel}
                  placeholder="Select ESGRC Type"
                  options={esgrcTypeOptions}
                  onChange={this.handleEsgrcTypeChange}
                  selectedKey={selectedEsgrcType}
                />
                <Dropdown
                  className="metrix"
                  label="Unit Of Measure"
                  placeholder="Select Unit Of Measure"
                  options={uomOptions}
                  onChange={this.handleUomChange}
                  selectedKey={selectedUom}
                />
                <Dropdown
                  className="metrix"
                  label="Prefix"
                  placeholder="Select Prefix"
                  options={prefixOptions}
                  onChange={this.handlePrefixChange}
                  selectedKey={selectedPrefix}
                />
              </div>
              <div className="right-column">
                <Dropdown
                  className="metrix"
                  label="Category"
                  placeholder="Select Category"
                  options={categoryOptions}
                  onChange={this.handleCategoryChange}
                  selectedKey={selectedCategory}
                />
                <Dropdown
                  className="metrix"
                  label="Standard"
                  placeholder="Select Standard"
                  options={standardOptions}
                  onChange={this.handleStandardChange}
                  selectedKey={selectedStandard}
                />
                <Dropdown
                  className="metrix"
                  label="Department"
                  placeholder="Select department"
                  options={departmentOptions}
                  onChange={this.handleDepartmentChange}
                  selectedKey={selectedDepartment}
                />
                <Dropdown
                  className="metrix"
                  label="Regulation Type"
                  placeholder="Select RegulationType"
                  options={regulationOptions}
                  onChange={this.handleRegulationstype}
                  selectedKey={this.state.selectedregulationtype}
                />
                <Dropdown
                  className="metrix"
                  label="Services"
                  placeholder="Select Services"
                  options={servicesOptions}
                  onChange={this.handleServices}
                  selectedKey={selectedServices}
                />
              </div>
            </div>
            <Stack horizontalAlign="center" horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton className="submitglobal" text="Previous" onClick={onPrevious} />
              <PrimaryButton className="submitglobal" text="Save" onClick={this.handleSave} />
            </Stack>
            <div>
              <Text className="text">{t('VALIDATION_TYPE')}</Text>
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                {rows.map((row: any, rowIndex: any) => (
                  <Stack tokens={{ childrenGap: 10 }} key={rowIndex}>
                    {row.map((option: any) => (
                      <Stack.Item key={option.id}>
                        <Checkbox
                          className="checkbox-text"
                          label={option.name}
                          checked={selectedValidationOptions.includes(option.id)}
                          onChange={(ev, isChecked) =>
                            this.handleCheckboxChange(ev!, isChecked!, option.id)
                          }
                        />
                      </Stack.Item>
                    ))}
                  </Stack>
                ))}
              </Stack>
            </div>
          </Stack>
        </div>
      </div>
    );
  }
}

export default withTranslation()(EnterMetricNameLabel);
