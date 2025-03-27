import React, { Suspense } from 'react';
import {  DefaultButton, Dropdown, Icon, IDropdownOption, Label, PrimaryButton, Stack, TextField } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { withTranslation } from 'react-i18next';
import {  Card, Grid } from '@mui/material';
import DataTable from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { AddButton, columnHeader, PIMHearderText } from '@/pages/PimStyles';
import { Link } from 'react-router-dom';
import { CalculationProcess, ICalculationProcessDto, IFormulaStandards, IMetricDomainModel, ITimeDimension } from '@/services/ApiClient';

class ConversionFormula extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      isRecord: true,
      dropdownOptions: [],
      selectedDropdownValue: null,
      formulaOptions: [], 
      inputOptions: [],
      outputOptions: [],
      selectedFormula: null,
      selectedInput: null,
      selectedOutput: '',
      showDropdowns: false,
      rows: [],
      metricOptions: [],
      selectedMetric: '',
      editingRowId: null,
    };
  }
 
  async componentDidMount(): Promise<void> {
    await this.refresh();
    await this.fetchFormulaOptions(); 
    await this.fetchFormulaData();
    await this.fetchMetricData();
    await this.fetchInputOutputData();
  }

  async refresh() {
    await this.fetchFormulaData();
  }

  async fetchFormulaOptions() {
    try {
      const response = await this.apiClient.getFormulaStandards();
      const formulaOptions = (response.result ?? []).map((formula: IFormulaStandards) => ({
        key: formula.id,
        text: formula.name, 
      }));
      this.setState({ formulaOptions });
    } catch (error) {
      console.error('Error fetching formula options:', error);
    }
  }

  async fetchMetricData() {
    try {
      const response = await this.apiClient.getControlList();  
      const metricOptions = (response.result ?? []).map((metric: any) => ({
        key: metric.id,
        text: metric.metricsQuestion,  
      }));
      this.setState({ metricOptions});
    } catch (error) {
      console.error('Error fetching metrics data:', error);
    }
  }

  async fetchTimeDimensionData() {
    try {
      const response = await this.apiClient.getTimeDimension();
      const timeDimensionOptions = (response.result ?? []).map((timeDimension: ITimeDimension) => ({
        key: timeDimension.id,
        text: timeDimension.name, 
      }));
      this.setState({
        inputOptions: timeDimensionOptions, 
      });
    } catch (error) {
      console.error('Error fetching time dimension data:', error);
    }
  }
  
  handleFormulaSelection = async (selectedFormula: any) => {
    if (selectedFormula === 2) {
      await this.fetchTimeDimensionData();
    } else {
      await this.fetchInputOutputData();
    }
  };
  
  
  handleDropdownChange = async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue: option.key }, async () => {
        await this.fetchFormulaOptions();
      });
    }
  };

  handleAddConversionClick = async () => {
    const newRow = {
      id: 0, 
      selectedFormula: null, 
      selectedInput: null,
      selectedOutput: '',
      selectedMetric: '', 
      isEditing: true, 
    };
  
    this.setState((prevState: { rows: any[] }) => ({
      rows: [...prevState.rows, newRow],
      isRecord: false, 
      editingRowId: newRow.id,
    }));
  
    await this.fetchInputOutputData(); 
  };
  
  handleFormulaChange = async (id: number, selectedKey: any) => {
    const { isRecord, rows, currentRecord } = this.state;
    if (isRecord) {
      const updatedRecord = currentRecord.find((record: { id: number }) => record.id === id);
      if (updatedRecord) {
        updatedRecord.selectedFormula = selectedKey;
      }
      this.setState({ currentRecord }, () => {
        this.handleFormulaSelection(selectedKey); 
      });
    } else {
      const newRows = [...rows];
      const updatedRow = newRows.find(row => row.id === id);
      if (updatedRow) {
        updatedRow.selectedFormula = selectedKey;
      }
      this.setState({ rows: newRows }, () => {
        this.handleFormulaSelection(selectedKey); 
      });
    }
  };
  
  handleInputChange = (rowId: number, selectedKey: any) => {
    const { isRecord, rows, currentRecord } = this.state;
  
    if (isRecord) {
      const updatedRecord = currentRecord.find((record: { id: number; }) => record.id === rowId);
      if (updatedRecord) {
        updatedRecord.selectedInput = selectedKey;
      }
      this.setState({ currentRecord });
    } else {
      
      const newRows = [...rows];
      const updatedRow = newRows.find(row => row.id === rowId);
      if (updatedRow) {
        updatedRow.selectedInput = selectedKey;
      }
      this.setState({ rows: newRows });
    }
  };
  
  handleOutputChange = (rowId: number, selectedKey: any) => {
    const { isRecord, rows, currentRecord } = this.state;
    if (isRecord) {
      const updatedRecord = currentRecord.find((record: { id: number; }) => record.id === rowId);
      if (updatedRecord) {
        updatedRecord.selectedOutput = selectedKey;
      }
      this.setState({ currentRecord });
    } else {
     
      const newRows = [...rows];
      const updatedRow = newRows.find(row => row.id === rowId);
      if (updatedRow) {
        updatedRow.selectedOutput = selectedKey;
      }
      this.setState({ rows: newRows });
    }
  };
  
  handleMetricChange = (rowId: number, selectedKey: any) => {
    const { isRecord, rows, currentRecord } = this.state;
  
    if (isRecord) {
      const updatedRecord = currentRecord.find((record: { id: number; }) => record.id === rowId);
      if (updatedRecord) {
        updatedRecord.selectedMetric = selectedKey;
      }
      this.setState({ currentRecord });
    } else {
    
      const newRows = [...rows];
      const updatedRow = newRows.find(row => row.id === rowId);
      if (updatedRow) {
        updatedRow.selectedMetric = selectedKey;
      }
      this.setState({ rows: newRows });
    }
  };
  
  handleSaveRow = async (rowId: number) => {
    const { rows, currentRecord, isRecord, backupRow } = this.state;

    if (isRecord) {
      const recordToSave = currentRecord.find((record: { id: number }) => record.id === rowId);
      if (!recordToSave) {
        
        this.notify.showErrorNotify(this.props.t('RECORD_NOT_FOUND'));
        return;
      }

      const selectedFormula = recordToSave.selectedFormula || backupRow?.formulaStandardId;
      const selectedInput = recordToSave.selectedInput || backupRow?.formulaInput;
      const selectedOutput = recordToSave.selectedOutput || backupRow?.formulaOutput;
      const selectedMetric = recordToSave.selectedMetric || backupRow?.childQuestionId;

      if (!selectedFormula || !selectedInput || !selectedOutput || !selectedMetric) {
        this.notify.showErrorNotify(this.props.t('PLEASE_SELECT_ALL_FIELDS_FOR_RECORD'));
        return;
      }

      await this.createTimeDimension({
        formulaStandardId: selectedFormula,
        formulaInput: selectedInput,
        formulaOutput: String(selectedOutput),
        metricId: selectedMetric,
        id: recordToSave.id || 0,
      });

      recordToSave.isEditing = false;
      this.setState({ currentRecord, editingRowId: null, backupRow: null });
      await this.fetchFormulaData();
    } else {
      const rowToSave = rows.find((row: { id: number }) => row.id === rowId);
      if (!rowToSave) {
        this.notify.showErrorNotify(this.props.t('ROW_NOT_FOUND'));
        return;
      }

      const { selectedFormula, selectedInput, selectedOutput, selectedMetric } = rowToSave;
      if (!selectedFormula || !selectedInput || !selectedOutput || !selectedMetric) {
        this.notify.showErrorNotify(this.props.t('PLEASE_SELECT_ALL_FIELDS_FOR_ROW'));
        return;
      }

      await this.createTimeDimension({
        formulaStandardId: selectedFormula,
        formulaInput: selectedInput,
        formulaOutput: String(selectedOutput),
        metricId: selectedMetric,
        id: rowToSave.id || 0,
      });

      rowToSave.isEditing = false;
      this.setState((prevState: { rows: any[] }) => ({
        rows: prevState.rows.filter((row: any) => row.id !== 0),
        editingRowId: null,
      }));
      await this.fetchFormulaData();
    }
};


  async fetchInputOutputData() {
    try {
      const response = await this.apiClient.getMetric();
      const metrics = response.result;
      if (metrics) {
        const inputOptions = metrics.map((metric: IMetricDomainModel) => ({
          key: metric.id,
          text: metric.name, 
        }));
        const outputOptions = metrics.map((metric: IMetricDomainModel) => ({
          key: metric.id,
          text: metric.name,  
        }));
        this.setState({
          inputOptions,
          outputOptions,
        });
      } else {
        console.error("No metrics found in the API response.");
      }
  
    } catch (error) {
      console.error('Error fetching input/output data:', error);
    }
  }

  createTimeDimension = async (data: any) => {
    const body: CalculationProcess = new CalculationProcess();
    body.createdBy = 0;
    body.updatedBy = 0;
    body.dateCreated = new Date().toISOString();
    body.dateModified = new Date().toISOString();
    body.id = data.id ?? 0; 
    body.isActive = true;
    body.timeDimension = undefined;
    body.formulaStandardId = data.formulaStandardId ?? 0;
    body.formulaInput = data.formulaInput ?? 0;
    body.formulaOutput = data.formulaOutput ?? '';
    body.metricId = data.metricId ?? 0;
  
    if (body.init) {
      body.init();
    }
  
    try {
      const response = await this.apiClient.createTimeDimension(body);
      if (response?.hasError) {
        this.notify.showErrorNotify(`Error creating or updating Time Dimension: ${response.message || 'Unknown error'}`);
      } else {
        this.notify.showSuccessNotify('Time Dimension created/updated successfully');
      }
    } catch (error) {
      this.notify.showErrorNotify('Failed to create or update Time Dimension');
    }
  };
  
  
  async fetchFormulaData() {
    try {
      const response = await this.apiClient.getTimeDimentionalformula();
      if (response.result) {
        const currentRecord = response.result.map((item: ICalculationProcessDto, index: number) => ({
          id: item.id,
          index: index + 1,
          formulaStandardName: item.formulaStandardName,
          formulainputName: item.formulainputName,
          formulaoutputName: item.formulaoutputName,
          formulaStandardId: item.formulaStandardId, 
          formulaInput: item.formulaInput,          
          formulaOutput: item.formulaOutput,  
          childQuestionId: item.childQuestionId,
          childQuestion: item.childQuestion
        }));
        this.setState({
          currentRecord,
        });
      }
    } catch (error) {
      console.error('Error fetching formula data:', error);
      this.notify.showErrorNotify('Failed to load formula data');
    }
  }
  
  handleEditRow = (id: number) => {
    const { currentRecord } = this.state;
    const rowToEdit = currentRecord.find((row: any) => row.id === id);
    if (rowToEdit) {
      this.setState({
        editingRowId: id,
        backupRow: { ...rowToEdit }, 
        selectedFormula: rowToEdit.formulaStandardId || null,
        selectedInput: rowToEdit.formulaInput || null,
        selectedOutput: rowToEdit.formulaOutput || '',
        selectedMetric: rowToEdit.childQuestionId || '',
      });
    }
  };
  
  render() {
    const { currentRecord,formulaOptions,inputOptions,editingRowId,outputOptions, showDropdowns,
    selectedFormula, selectedInput, selectedOutput,rows,metricOptions, selectedMetric,timeDimensionOptions } = this.state;
    const { t } = this.props;

    const columns = [
      {
        name: <div className={columnHeader}>{this.props.t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '7%',
      },
      {
        name: <div className={columnHeader}>{this.props.t('FORMULA')}</div>,
        cell: (row: any) => (
          row.isEditing || row.id === editingRowId ? (
            <Dropdown
              placeholder={this.props.t('SELECT_FORMULA')}
              options={formulaOptions}
              selectedKey={row.selectedFormula || selectedFormula}
              onChange={(e, option) => this.handleFormulaChange(row.id, option?.key)}
              styles={{
                dropdown: { width: '100%', maxWidth: '200px' }, 
                callout: { minWidth: '200px' } 
              }}
            />
          ) : (
            <TextField value={row.formulaStandardName} disabled={true} />
          )
        ),
        width: '15%',
      },
      {
        name: <div className={columnHeader}>{this.props.t('INPUT_METRIC')}</div>,
        cell: (row: any) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {row.isEditing || row.id === editingRowId ? (
              <Dropdown
                placeholder={this.props.t('SELECT_INPUT')}
                options={selectedFormula === 2 ? timeDimensionOptions : inputOptions} 
                selectedKey={+(row.selectedInput || selectedInput)}
                onChange={(e, option) => this.handleInputChange(row.id, option?.key)}
                styles={{
                  dropdown: { width: '100%', maxWidth: '200px' }, 
                  callout: { minWidth: '200px' } 
                }}
              />
            ) : (
              <TextField value={row.formulainputName} disabled={true} styles={{ root: { width: '45%' } }} />
            )}
      
            <Icon
              iconName="Cancel"
              style={{ marginLeft: '10px', cursor: 'pointer' }}
            />
      
            {row.isEditing || row.id === editingRowId ? (
              <Dropdown
                placeholder={this.props.t('SELECT_OUTPUT')}
                options={outputOptions}
                selectedKey={row.selectedOutput || selectedOutput}
                onChange={(e, option) => this.handleOutputChange(row.id, option?.key)}
                styles={{
                  dropdown: { width: '100%', maxWidth: '200px' }, 
                  callout: { minWidth: '200px' } 
                }}
              />
            ) : (
              <TextField value={row.formulaoutputName} disabled={true} styles={{ root: { width: '45%' } }} />
            )}
      
            <Label style={{ marginLeft: '10px', fontSize: '16px' }}>=</Label>
          </div>
        ),
        width: '48%',
      },
      {
        name: <div className={columnHeader}>{this.props.t('OUTPUT_METRIC')}</div>,
        cell: (row: any) => (
          // <div style={{ display: 'flex', alignItems: 'center' }}>
            row.isEditing || row.id === editingRowId ? (
              <Dropdown
                placeholder={this.props.t('SELECT_METRIC')}
                options={metricOptions}
                selectedKey={+(row.selectedMetric || selectedMetric)} 
                onChange={(e, option) => this.handleMetricChange(row.id, option?.key)}
                styles={{ dropdown: { width: '100%', maxWidth: '200px' } }}  
              />
             ) : (
              <TextField value={row.childQuestion || ''} disabled={true} />
            )
          // </div>
        ),
        width: '19%',
      },
      {
        name: <div className={columnHeader}>{this.props.t('ACTION')}</div>,
        cell: (row: any) => (
          row.isEditing || row.id === editingRowId ? (  
            <PrimaryButton
              text={this.props.t('SAVE')}
              onClick={async () => {
                await this.handleSaveRow(row.id);
                await this.fetchFormulaData();
                () => this.refresh();
              }}
            />
          ) : (
            <PrimaryButton
              text={this.props.t('EDIT')}
              onClick={async () => {
                await this.handleEditRow(row.id);
                await this.fetchFormulaData();
                () => this.refresh();
              }}
            
            />
          )
        ),
        width: '10%',
      },
    ];
    
    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity/ConversionFormula`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_CONVERSION_FORMULA')}
          </Link>
          <Grid item container spacing={-4} direction={'row'} justifyContent="space-between" alignItems="center">
            <Stack>
              <Text className="color-blue text" key={'xxLarge'} variant={'xxLarge' as ITextProps['variant']} styles={PIMHearderText} nowrap block>
                {t('SUBMENU_CONVERSION_FORMULA')}
              </Text>
            </Stack>
    
            <Grid item lg={2.1} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ADD_CONVERSION')}`}
                onClick={this.handleAddConversionClick} 
              />
            </Grid>
          </Grid>
        </div>
        <Grid lg={12} item container spacing={1} direction={'row'} justifyContent="flex-end">
          <Grid item lg={0.9} xs={6}></Grid>
          <Grid item lg={1.3} xs={6}></Grid>
          <Grid item lg={1.3} xs={6}></Grid>
          <Grid item lg={4.7} />
          <Grid item lg={0.5} xs={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              data={rows.concat(currentRecord)} 
              pagination
              clearSelectedRows={this.state.noSelection}
              highlightOnHover
              responsive
              fixedHeader
              striped
              fixedHeaderScrollHeight="386px"
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
                {this.state.isRecord == true
                  ? `${this.props.t('RECORDS')}`
                  : `${this.props.t('NO_RECORDS')}`}
              </Stack>
            </div>
          )}
        </Card>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(ConversionFormula);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
