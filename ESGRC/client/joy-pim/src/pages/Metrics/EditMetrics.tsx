import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { Dropdown, PrimaryButton, Checkbox, IDropdownOption } from '@fluentui/react';
import { t } from 'i18next';
import { Stack, TextField, Toggle } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation, useHistory } from 'react-router-dom';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { PIMdropdownStyles, PIMHearderText } from '@/pages/PimStyles';
import { Link } from 'react-router-dom';

const stackTokens = { childrenGap: 15 };
const columnStackTokens = { childrenGap: 10, padding: 10 };

export default function EditMetrics(props: any) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any>({});
  const [selectedValidations, setSelectedValidations] = useState<number[]>([]);
  const numberOfColumns = 3;
  const [metricOptions, setMetricOptions] = useState<any[]>([]);
  const [selectedMetric, setselectedMetric] = useState<number>();
  const [esgrcOptions, setEsgrcOptions] = useState<IDropdownOption[]>([]);
  const [selectedEsgrcType, setSelectedEsgrcType] = useState<number | undefined>(undefined);
  const [uomOptions, setUomOptions] = useState<IDropdownOption[]>([]);
  const [selectedUom, setSelectedUom] = useState<number | undefined>(undefined);
  const [categoryOptions, setCategoryOptions] = useState<IDropdownOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [standardOptions, setStandardOptions] = useState<IDropdownOption[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<number | undefined>(undefined);
  const [departmentOptions, setDepartmentOptions] = useState<IDropdownOption[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);
  const [regulationtypeOptions, setRegulationOptions] = useState<IDropdownOption[]>([]);
  const [selectedService, setSelectedService] = useState<number | undefined>(undefined);
  const [serviceOptions, setServiceOptions] = useState<IDropdownOption[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<number | undefined>(undefined);
  const [isKeyIndicator, setIsKeyIndicator] = useState<boolean>(false);

  const [isUnique, setIsUnique] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid = false },
  } = useForm<any>({
    mode: 'onChange',
    defaultValues: {},
  });

  useEffect(() => {
    if (id) {
      apiClient.getAllActiveMetric().then(async (res: any) => {
        if (res && res.result) {
          const record = res.result.find((e: any) => e.id == id);
          setCurrentRecord(record);
          if (record) {
            const validationIdString = record.validationId ? record.validationId.toString() : '';
            setSelectedValidations(validationIdString.split(',').map(Number));

            reset(record);
            setValue('displayLabel', record?.displayLabel || '');
            setIsKeyIndicator(record.isKeyIndicator || false);
            setIsUnique(record.isUnique || false);
            const options = await apiClient.getActiveMetricGroupsWithCount();
            const metricOptions =
              options?.result?.map((e: any) => ({
                key: e.groupId,
                text: e.name,
              })) ?? [];
            setMetricOptions(metricOptions);
            setselectedMetric(record.groupId);
            setSelectedEsgrcType(record.esgrcType);
            setSelectedUom(record.uom);
            setSelectedCategory(record.category);
            setSelectedStandard(record.standard);
            setSelectedDepartment(record.department);
            setSelectedService(record.serviceid);
            setSelectedRegulation(record.regulationtypeid);
          } else {
            setSelectedValidations([]);
          }
        }
      });
    }
    getRoles();
    getEsgrcTypes();
    getUomOptions();
    getCategoryOptions();
    getStandardOptions();
    getDepartmentOptions();
    getRegulationsTypeOptions();
    getservicesoptions();
  }, [id]);

  const getRoles = async (): Promise<void> => {
    const roleOptions = await apiClient.getValidationList();
    setRoleOptions(roleOptions?.result ?? []);
  };
  const getEsgrcTypes = async (): Promise<void> => {
    const esgrcTypes = await apiClient.getEsgrc();
    if (esgrcTypes && esgrcTypes.result) {
      const esgrcOptions = esgrcTypes.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setEsgrcOptions(esgrcOptions);
    }
  };

  const getUomOptions = async (): Promise<void> => {
    const uomOptions = await apiClient.getUom();
    if (uomOptions && uomOptions.result) {
      const uomDropdownOptions = uomOptions.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setUomOptions(uomDropdownOptions);
    }
  };

  const getCategoryOptions = async (): Promise<void> => {
    const categoryOptions = await apiClient.getCategory();
    if (categoryOptions && categoryOptions.result) {
      const categoryDropdownOptions = categoryOptions.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setCategoryOptions(categoryDropdownOptions);
    }
  };

  const getStandardOptions = async (): Promise<void> => {
    const standardOptions = await apiClient.getStandards();
    if (standardOptions && standardOptions.result) {
      const standardDropdownOptions = standardOptions.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setStandardOptions(standardDropdownOptions);
    }
  };

  const getservicesoptions = async (): Promise<void> => {
    const servicesOptions = await apiClient.getServices(); 
    if (servicesOptions && servicesOptions.result) {
      const servicesDropdownOptions = servicesOptions.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setServiceOptions(servicesDropdownOptions);
    }
  };

  const getDepartmentOptions = async (): Promise<void> => {
    const departmentOptions = await apiClient.getDepartment();
    if (departmentOptions && departmentOptions.result) {
      const departmentDropdownOptions = departmentOptions.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setDepartmentOptions(departmentDropdownOptions);
    }
  };

  const getRegulationsTypeOptions = async (): Promise<void> => {
    const regulationsOptions = await apiClient.getTypes();
    if (regulationsOptions && regulationsOptions.result) {
      const regulationDropdownOptions = regulationsOptions.result.map((item: any) => ({
        key: item.id,
        text: item.name,
      }));
      setRegulationOptions(regulationDropdownOptions);
    }
  };

  const handleCheckboxChange = (id: number, isChecked: boolean) => {
    setSelectedMetrics((prev) => {
      if (isChecked) {
        setSelectedValidations([...selectedValidations, id]);
        return [...prev, id];
      } else {
        setSelectedValidations(selectedValidations.filter((e: any) => e !== id));
        return prev.filter((item) => item !== id);
      }
    });
  };

  const onSubmit = (data: any) => {
    console.log('Data being submitted:', {
      ...data,
      groupId: selectedMetric,
      validationId: selectedValidations.join(','),
      esgrcType: selectedEsgrcType,
      uom: selectedUom,
      category: selectedCategory,
      standard: selectedStandard,
      department: selectedDepartment,
      serviceid: selectedService,
      regulationtypeid: selectedRegulation,
      isKeyIndicator: isKeyIndicator,
      isUnique: isUnique,
    });

    apiClient
      .createMetric({
        ...data,
        groupId: selectedMetric,
        validationId: selectedValidations.join(','),
        esgrcType: selectedEsgrcType,
        uom: selectedUom,
        category: selectedCategory,
        standard: selectedStandard,
        department: selectedDepartment,
        serviceid: selectedService,
        regulationtypeid: selectedRegulation,
        isKeyIndicator: isKeyIndicator,
        isUnique: isUnique,
      })
      .then((res: any) => {
        if (!res.hasError) {
          notify.showSuccessNotify(`${t('METRIC_GROUP_UPDATED_SUCCESSFULLY')}`);
        } else {
          notify.showErrorNotify(res.message);
        }
      })
      .catch((error: any) => {
        console.error('Error while creating metric:', error);
        notify.showErrorNotify(error);
      });
  };

  const splitIntoColumns = (array: any[], columns: number) => {
    const itemsPerColumn = Math.ceil(array.length / columns);
    return Array.from({ length: columns }, (_, i) =>
      array.slice(i * itemsPerColumn, i * itemsPerColumn + itemsPerColumn),
    );
  };

  const roleColumns = splitIntoColumns(roleOptions, numberOfColumns);
  const metricGroupLabel = t('MENU_METRICS_GROUP') || '';

  const handleMetricChange = (e: any, option?: IDropdownOption) => {
    setselectedMetric(option?.key as number);
  };

  const handleEsgrcChange = (e: any, option?: IDropdownOption) => {
    setSelectedEsgrcType(option?.key as number);
  };

  const handleUomChange = (e: any, option?: IDropdownOption) => {
    setSelectedUom(option?.key as number);
  };

  const handleCategoryChange = (e: any, option?: IDropdownOption) => {
    setSelectedCategory(option?.key as number);
  };

  const handleStandardChange = (e: any, option?: IDropdownOption) => {
    setSelectedStandard(option?.key as number);
  };

  const handleDepartmentChange = (e: any, option?: IDropdownOption) => {
    setSelectedDepartment(option?.key as number);
  };

  const handleRegulationChange = (e: any, option?: IDropdownOption) => {
    setSelectedRegulation(option?.key as number);
  };
  const handleServiceChange = (e: any, option?: IDropdownOption) => {
    setSelectedService(option?.key as number);
  };

  useEffect(() => {
    console.log('Metric Options:', metricOptions);
  }, [metricOptions]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/metrics/metric`} className="headerText">
            {t('MENU_METRICS')}/{t('MENU_METRICS_GROUP')}/{t('EDIT_METRIC')}
          </Link>
          <div className="w-20">
            <Stack>
              <Text
                className="color-blue text"
                key={'xxLarge'}
                variant={'xxLarge' as ITextProps['variant']}
                styles={PIMHearderText}
                nowrap
                block
              >
                {t('EDIT_METRIC')}
              </Text>
            </Stack>
            <Stack tokens={stackTokens}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <TextField
                    className="metrics"
                    label={`${t('COL_NAME')}`}
                    {...field}
                    errorMessage={errors.name && errors.name.message?.toString()}
                  />
                )}
              />

              <Controller
                name="metricsQuestion"
                control={control}
                rules={{ required: 'disaplayLabel is required' }}
                render={({ field }) => (
                  <TextField
                    className="metrics"
                    label={`${t('COL_METRICQUESTIONS')}`}
                    {...field}
                    errorMessage={
                      errors.metricsQuestion && errors.metricsQuestion.message?.toString()
                    }
                    multiline
                  />
                )}
              />

              <Dropdown
                className="metrics"
                label={metricGroupLabel}
                styles={PIMdropdownStyles}
                placeholder={metricGroupLabel}
                options={metricOptions}
                onChange={handleMetricChange}
                selectedKey={selectedMetric}
              />
              <Dropdown
                className="metrics"
                label="ESGRC Type"
                styles={PIMdropdownStyles}
                placeholder="Select ESGRC Type"
                options={esgrcOptions}
                onChange={handleEsgrcChange}
                selectedKey={selectedEsgrcType}
              />
              <Dropdown
                className="metrics"
                label="Unit Of Measure"
                styles={PIMdropdownStyles}
                placeholder="Select Unit Of Measure"
                options={uomOptions}
                onChange={handleUomChange}
                selectedKey={selectedUom}
              />
              <Dropdown
                className="metrics"
                label="Category"
                styles={PIMdropdownStyles}
                placeholder="Select Category"
                options={categoryOptions}
                onChange={handleCategoryChange}
                selectedKey={selectedCategory}
              />
              <Dropdown
                className="metrics"
                label="Standard"
                styles={PIMdropdownStyles}
                placeholder="Select Standard"
                options={standardOptions}
                onChange={handleStandardChange}
                selectedKey={selectedStandard}
              />
              <Dropdown
                className="metrics"
                label="Department"
                styles={PIMdropdownStyles}
                placeholder="Select Department"
                options={departmentOptions}
                onChange={handleDepartmentChange}
                selectedKey={selectedDepartment}
              />

              <Dropdown
                className="metrics"
                label="RegulationType"
                styles={PIMdropdownStyles}
                placeholder="Select RegulationType"
                options={regulationtypeOptions}
                onChange={handleRegulationChange}
                selectedKey={selectedRegulation}
              />

              <Dropdown
                className="metrics"
                label="Service"
                styles={PIMdropdownStyles}
                placeholder="Select Service"
                options={serviceOptions}
                onChange={handleServiceChange}
                selectedKey={selectedService}
              />
              <Controller
                name="isKeyIndicator"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="Is Key Indicator"
                    checked={isKeyIndicator}
                    onChange={(e, checked) => {
                      setIsKeyIndicator(checked || false);
                      setValue('isKeyIndicator', checked || false);
                    }}
                  />
                )}
              />
              <PrimaryButton
                className="submitglobal"
                type="submit"
                text={`${t('BTN_SUBMIT')}`}
                disabled={!isValid}
              />
            </Stack>
          </div>
          <div>
            <Text className="text"> {t('VALIDATION_TYPE')}</Text>
            <Stack horizontal tokens={columnStackTokens}>
              {roleColumns.map((column: any[], columnIndex: number) => (
                <Stack.Item key={columnIndex}>
                  <Stack tokens={columnStackTokens}>
                    {column.map((option: any) => (
                      <Checkbox
                        label={option.name}
                        checked={selectedValidations.includes(option.id)}
                        onChange={(ev, isChecked) => handleCheckboxChange(option.id, isChecked!)}
                        key={option.id}
                      />
                    ))}
                  </Stack>
                </Stack.Item>
              ))}
            </Stack>
          </div>
        </div>
      </div>
    </form>
  );
}
