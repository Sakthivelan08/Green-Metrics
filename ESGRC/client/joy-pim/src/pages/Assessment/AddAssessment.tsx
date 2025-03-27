import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Checkbox,
  Drawer,
  Tabs,
  Tab,
  AccordionDetails,
  Accordion,
  AccordionSummary,
} from '@mui/material';
import ApiManager from '@/services/ApiManager';
import DataTable, { TableColumn } from 'react-data-table-component';
import { t } from 'i18next';
import { IMetricGroup, MetricDomainModel, Template } from '@/services/ApiClient';
import { columnHeader } from '../PimStyles';
import Service from './Service';
import NameandGroup from './NameandGroup';
import ReviewandFinish from './ReviewandFinish';
import { ChevronDownRegular } from '@fluentui/react-icons';

const AddAssessment: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMetricGroupIds, setSelectedMetricGroupIds] = useState<string[]>([]);
  const [selectedMetricGroups, setSelectedMetricGroups] = useState<IMetricGroup[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
  const [metricGroups, setMetricGroups] = useState<IMetricGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [assessmentName, setAssessmentName] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDrawer1, setOpenDrawer1] = useState(false);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [metrics, setMetrics] = useState<Record<number, MetricDomainModel[]>>({});
  const [isAccordionVisible, setIsAccordionVisible] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    refresh();
  }, [selectedTab]);
  const apiClient = new ApiManager().CreateApiClient();

  const refresh = () => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [metricGroupsResponse, templatesResponse] = await Promise.all([
          apiClient.getMetricGroupWithRegulationList(),
          apiClient.getAllActiveTemplate(),
        ]);

        if (metricGroupsResponse?.result) {
          setMetricGroups(metricGroupsResponse.result);
        }

        if (templatesResponse?.result) {
          setTemplates(templatesResponse.result);
        }

        const activeUsersResponse = await apiClient.activeUsers();
        if (activeUsersResponse?.result) {
          const userMapping: Record<number, string> = {};
          activeUsersResponse.result.forEach((user) => {
            if (user.id !== undefined) {
              userMapping[user.id] = user.firstName ?? 'Unknown';
            }
          });
          setUserMap(userMapping);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const handleOpenDrawer1 = () => {
    setOpenDrawer1(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const handleCloseDrawer1 = () => {
    setOpenDrawer1(false);
  };

  const handleRowSelect = (id: string) => {
    setSelectedMetricGroupIds((prevState) =>
      prevState.includes(id)
        ? prevState.filter((metricGroupId) => metricGroupId !== id)
        : [...prevState, id],
    );
  };

  const handleRowSelect1 = (templateId: number) => {
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
    } else {
      setSelectedTemplateId(templateId);
    }
    const selectedTemplate = templates.find((template) => template.id === templateId);
    setSelectedTemplateName(selectedTemplate?.name || '');
  };

  const fetchMetrics = async (groupId: number) => {  
    try {
      const metricsResponse = await apiClient.getMetricsByGroupId(groupId.toString());
      if (metricsResponse?.result) {
        setMetrics((prev) => ({
          ...prev,
          [groupId]: metricsResponse.result ?? [],
        }));
      } else {
        console.error('No metrics found for the groupId', groupId);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchTemplateGroup = async (templateId: number) => { 
    try {
      const response = await apiClient.getTemplateGroup(templateId);
      if (response.result) {
        const groups = response.result.map((group: any) => ({
          id: group.metricGroupId,
          name: group.metricGroupName,
          displayLabel: group.label,
          typeName: group.industryName,
        }));
        setMetricGroups(groups);
        groups.forEach((group: any) => {
          fetchMetrics(group.id);
        });
      }
    } catch (error) {
      console.error('Error fetching template group:', error);
    }
  };

  const handleSave = () => {
    const selectedGroups = metricGroups.filter(
      (group) => group.id !== undefined && selectedMetricGroupIds.includes(group.id.toString()),
    );
    setSelectedMetricGroups(selectedGroups);
    setShowDetails(true);
    setOpenDrawer(false);
  };

  const handleSave1 = () => {
    if (selectedTemplateId !== null) {
      console.log('Saving selected template ID:', selectedTemplateId);
      fetchTemplateGroup(selectedTemplateId);
      setOpenDrawer(false);
      setOpenDrawer1(false);
      setIsAccordionVisible(true);
    }
  };

  const handleNext = () => {
    if (selectedMetricGroupIds.length === 0 && selectedTemplateId === null) {
      setGlobalError(t('SELECT_REGULATION_AND_TEMPLATE') ?? '');
      return;
    }

    if (selectedMetricGroupIds.length === 0 && selectedTemplateId !== null) {
      setGlobalError(t('SELECT_A_REGULATION') ?? '');
      return;
    }

    if (selectedTemplateId === null && selectedMetricGroupIds.length > 0) {
      setGlobalError(t('SELECT_TEMPLATE') ?? '');
      return;
    }

    setGlobalError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleEditRegulation = () => {
    setActiveStep(0);
  };

  const handleEditGroup = () => {
    setActiveStep(1);
  };

  const handleEditService = () => {
    setActiveStep(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const drawerTableColumns: TableColumn<IMetricGroup>[] = [
    {
      id: 'select',
      name: '',
      cell: (row) => {
        const rowId = row.id?.toString() ?? '';
        return (
          <Checkbox
            checked={selectedMetricGroupIds.includes(rowId)}
            onChange={() => handleRowSelect(rowId)}
          />
        );
      },
      width: '5%',
    },
    {
      id: 'name',
      name: <div className={columnHeader}>{t('COL_NAME')}</div>,
      selector: (row) => row.name ?? '',
      width: '40%',
    },
    {
      id: 'createdBy',
      name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
      selector: (row) => {
        const createdByName = userMap[row.createdBy || -1] || t('N/A');
        return createdByName;
      },
      width: '22%',
    },
    {
      id: 'dateCreated',
      name: <div className={columnHeader}>{t('COL_DATE_CREATED')}</div>,
      selector: (row) => {
        return row.dateCreated ? formatDate(row.dateCreated) : '';
      },
      width: '25%',
    },
  ];

  const maintablecolumns: TableColumn<IMetricGroup>[] = [
    {
      id: 'slNo',
      name: <div className={columnHeader}>{t('S_NO')}</div>,
      selector: (row, index) => (index !== undefined ? index + 1 : ''),
      width: '10%',
    },
    {
      id: 'name',
      name: <div className={columnHeader}>{t('COL_NAME')}</div>,
      selector: (row) => row.name ?? '',
      width: '39%',
    },
    {
      id: 'createdBy',
      name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
      selector: (row) => {
        const createdByName = userMap[row.createdBy || -1] || t('N/A');
        return createdByName;
      },
      width: '21%',
    },
    {
      id: 'dateCreated',
      name: <div className={columnHeader}>{t('COL_DATE_CREATED')}</div>,
      selector: (row) => {
        return row.dateCreated ? formatDate(row.dateCreated) : '';
      },
      width: '25%',
    },
  ];

  const templateTableColumns: TableColumn<Template>[] = [
    {
      id: 'select',
      name: '',
      cell: (row) => (
        <Checkbox
          checked={selectedTemplateId === row.id}
          onChange={() => handleRowSelect1(row.id as number)}
        />
      ),
      width: '5%',
    },
    {
      id: 'name',
      name: <div className={columnHeader}>{t('COL_NAME')}</div>,
      selector: (row) => row.name ?? '',
      width: '40%',
    },
    {
      id: 'createdBy',
      name: <div className={columnHeader}>{t('COL_CREATED_BY')}</div>,
      selector: (row) => {
        const createdByName = userMap[row.createdBy || -1] || 'N/A';
        return createdByName;
      },
      width: '22%',
    },
    {
      id: 'dateCreated',
      name: <div className={columnHeader}>{t('COL_DATE_CREATED')}</div>,
      selector: (row) => {
        return row.dateCreated ? formatDate(row.dateCreated) : '';
      },
      width: '25%',
    },
  ];

  const metricColumns: TableColumn<MetricDomainModel>[] = [
    {
      id: 'metricsQuestion',
      name: 'Metrics Question',
      selector: (row) => row.metricsQuestion ?? 'N/A',
      width: '30%',
    },
    {
      id: 'typeName',
      name: 'Type Name',
      selector: (row) => row.typeName ?? 'N/A',
      width: '30%',
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <Box sx={{ maxWidth: 400, paddingLeft: '20px' }}>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              '.MuiStepConnector-line': { minHeight: '50px', marginRight: '25px' },
              '.MuiStepLabel-root.Mui-active .MuiStepLabel-label': {
                fontWeight: '500',
                fontSize: '3rem',
              },
              '.MuiStepLabel-label': { fontSize: '1rem' },
              '.MuiStepConnector-root': { marginLeft: '8px' },
            }}
          >
            {['Regulation', 'Role', 'Service', 'Review and Finish'].map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Grid>

      <Grid item xs={10}>
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 1, fontSize: '1.5rem' }}>
              {t('BASE_YOUR_ASSESSMENT')}
            </Typography>

            {globalError && (
              <Typography color="error" sx={{ mt: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {globalError}
              </Typography>
            )}

            {activeStep === 0 && (
              <>
                <Tabs
                  value={selectedTab}
                  onChange={(event, newTab) => setSelectedTab(newTab)}
                  aria-label="Assessment Tabs"
                >
                  <Tab label="Regulation" />
                  <Tab label="Template" />
                </Tabs>

                {selectedTab === 0 && activeStep === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleOpenDrawer} sx={{ mb: 2 }}>
                      {t('BTN_SELECT_REGULATION')}
                    </Button>

                    <Box sx={{ mt: 2, border: '1px solid #ccc', borderRadius: '8px', p: 2 }}>
                      <Typography variant="h5" sx={{ fontSize: '1.3rem', mb: 2 }}>
                        {t('SELECTED_METRIC_GROUP')}
                      </Typography>

                      {showDetails && selectedMetricGroups.length > 0 ? (
                        <DataTable
                          columns={maintablecolumns}
                          data={selectedMetricGroups}
                          pagination
                          paginationPerPage={2}
                          paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                          noDataComponent="No records selected"
                          className="small-font-table"
                        />
                      ) : (
                        <Typography>{t('NOT_SELECTED')}</Typography>
                      )}
                    </Box>
                  </Box>
                )}
                {selectedTab === 1 && activeStep === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      <Button variant="contained" onClick={handleOpenDrawer1} sx={{ mb: 2 }}>
                        {t('BTN_SELECT_TEMPLATE')}
                      </Button>
                    </Typography>

                    {isAccordionVisible && (
                      <Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {metricGroups.length === 0 ? (
                          <Typography color="textSecondary" sx={{ mt: 2 }}>
                            No metrics under this template.
                          </Typography>
                        ) : (
                          metricGroups.map((group) => {
                            const groupId = group.id;
                            if (groupId === undefined) {
                              return null;
                            }

                            return (
                              <Box sx={{ mt: 2 }} key={groupId}>
                                <Accordion className="accordion-root">
                                  <AccordionSummary
                                    expandIcon={<ChevronDownRegular />}
                                    aria-controls={`panel-${groupId}-content`}
                                    id={`panel-${groupId}-header`}
                                    onClick={() => fetchMetrics(groupId)}
                                    className="accordion-summary"
                                  >
                                    <Typography>{group.name}</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails className="accordion-details">
                                    <div className="table-container">
                                      <div className="table-content">
                                        <DataTable
                                          columns={metricColumns}
                                          data={metrics[groupId] || []}
                                          pagination
                                          paginationPerPage={4}
                                          paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                                          highlightOnHover
                                          noDataComponent={<div>No records available</div>}
                                        />
                                      </div>
                                    </div>
                                  </AccordionDetails>
                                </Accordion>
                              </Box>
                            );
                          })
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                <Button variant="contained" onClick={handleNext} sx={{ mt: 3 }}>
                  {t('BTN_NEXT')}
                </Button>
              </>
            )}

            {activeStep === 1 && (
              <NameandGroup
                handleBack={handleBack}
                handleNext={handleNext}
                selectedGroupNameSetter={setSelectedGroupName}
                selectedRoleIdSetter={setSelectedRoleId}
                selectedAssessmentName={setAssessmentName}
                initialAssessmentName={assessmentName || ''}
                initialSelectedGroup={selectedGroupName || ''}
                initialSelectedRoleId={selectedRoleId}
              />
            )}

            {activeStep === 2 && (
              <Service
                handleBack={handleBack}
                handleNext={handleNext}
                selectedServiceNameSetter={setSelectedServiceName}
                selectedServiceIdSetter={setSelectedService}
                selectedServiceId={selectedService}
                selectedServiceName={selectedServiceName}
              />
            )}

            {activeStep === 3 && (
              <ReviewandFinish
                handleBack={handleBack}
                handleNext={handleNext}
                regulationNames={selectedMetricGroups
                  .map((group) => group.name)
                  .filter((name) => name !== undefined)}
                selectedMetricGroupIds={selectedMetricGroupIds}
                selectedGroup={selectedGroupName}
                selectedServiceName={selectedServiceName}
                handleEditRegulation={handleEditRegulation}
                handleEditGroup={handleEditGroup}
                handleEditService={handleEditService}
                //selectedMetricGroupId={selectedMetricGroupId}
                selectedRoleId={selectedRoleId}
                SelectedService={selectedService}
                assessmentName={assessmentName}
                selectedTemplateId={selectedTemplateId}
                selectedTemplateName={selectedTemplateName}
              />
            )}
          </Box>
        </Paper>
      </Grid>

      <Drawer anchor="right" open={openDrawer} onClose={handleCloseDrawer}>
        <Box sx={{ width: 550, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            <strong>{t('SELECT_REGULATION')}</strong>
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <div className="table-content">
              <DataTable
                columns={drawerTableColumns}
                data={metricGroups}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                highlightOnHover
                noDataComponent={<div>{t('No records available')}</div>}
                className="small-font-table"
              />
            </div>
          )}
          <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
            {t('BTN_SAVE')}
          </Button>
          <Button variant="outlined" onClick={handleCloseDrawer} sx={{ mt: 2, ml: 1 }}>
            {t('BTN_CANCEL')}
          </Button>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={openDrawer1} onClose={handleCloseDrawer1}>
        <Box sx={{ width: 550, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            <strong>{t('SELECT_TEMPLATE')}</strong>
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <div className="table-content">
              <DataTable
                columns={templateTableColumns}
                data={templates}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                highlightOnHover
                noDataComponent={<div>{t('No records available')}</div>}
                className="small-font-table"
              />
            </div>
          )}
          <Button variant="contained" onClick={handleSave1} sx={{ mt: 2 }}>
            {t('BTN_SAVE')}
          </Button>
          <Button variant="outlined" onClick={handleCloseDrawer1} sx={{ mt: 2, ml: 1 }}>
            {t('BTN_CANCEL')}
          </Button>
        </Box>
      </Drawer>
    </Grid>
  );
};

export default AddAssessment;
