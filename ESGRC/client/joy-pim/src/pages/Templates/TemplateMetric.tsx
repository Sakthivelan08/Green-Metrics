import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Stack,
} from '@mui/material';
import { ChevronDownRegular } from '@fluentui/react-icons';
import { Link, useLocation } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import ApiManager from '@/services/ApiManager';
import { AddButton, cancelsIcon, columnHeader } from '../PimStyles';
import { t } from 'i18next';
import { DefaultButton, Icon, IconButton } from 'office-ui-fabric-react';

interface MetricData {
  id: number;
  displayLabel: string;
  name: string;
  typeName: string;
  serialNumber?: number;
  metricsQuestion?: string;
  templateId?: number;
}

interface MetricGroup {
  metricGroupId: number;
  metricGroupName: string;
}

interface MetricGroup1 {
  id: number;
  metricName: string;
  dataType: string;
}

const TemplateMetric: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<number, MetricData[]>>({});
  const [metricGroups, setMetricGroups] = useState<MetricData[]>([]);
  const [metricGroups1, setMetricGroups1] = useState<MetricGroup1[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [popSelect, setPopSelect] = useState<MetricData[]>([]);
  const [activeMetricGroups, setActiveMetricGroups] = useState<MetricData[]>([]);
  const [isBRSRTaxonomyChecked, setIsBRSRTaxonomyChecked] = useState(false);
  const location = useLocation();
  const myParam = new URLSearchParams(location.search);
  const templateId = parseInt(myParam.get('id') || '', 10);
  const [metricGroupss, setMetricGroupss] = useState<MetricGroup[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{
    templateId: number;
    metricGroupId: number;
  } | null>(null);

  if (isNaN(templateId)) {
    return <div>Invalid template ID</div>;
  }

  const apiClient = new ApiManager().CreateApiClient();

  const fetchMetricsByGroupId = async (groupId: number) => {
    try {
      const response = await apiClient.getMetricsByGroupId(groupId.toString());
      if (response && response.result) {
        const fetchedMetrics = response.result.map((metric: any, index: number) => ({
          id: metric.id,
          displayLabel: metric.displayLabel,
          name: metric.name,
          typeName: metric.typeName || '',
          metricsQuestion: metric.metricsQuestion || '',
          serialNumber: index + 1,
        }));
        setMetrics((prevMetrics) => ({
          ...prevMetrics,
          [groupId]: fetchedMetrics,
        }));
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchTemplateGroup = async (templateId: number) => {
    try {
      const response = await apiClient.getTemplateGroup(templateId);
      if (response && response.result) {
        const groups = response.result.map((group: any) => ({
          id: group.metricGroupId,
          name: group.metricGroupName,
          displayLabel: group.label,
          typeName: group.industryName,
          templateId: group.templateId,
        }));
        setMetricGroups(groups);
        groups.forEach((group: any) => {
          fetchMetricsByGroupId(group.id);
        });
      }
    } catch (error) {
      console.error('Error fetching template group:', error);
    }
  };

  const fetchPrefixMetricsById = async (templateId: number) => {
    try {
      const response = await apiClient.getPrefixMetricsById(templateId);
      if (response && response.result) {
        const metrics = response.result.map((metric: any) => ({
          id: metric.id,
          metricName: metric.metric,
          dataType: metric.dataType,
        }));

        setMetricGroups1(metrics);
        metrics.forEach((group: any) => {
          fetchMetricsByGroupId(group.id);
        });
      }
    } catch (error) {
      console.error('Error fetching metrics by templateId:', error);
    }
  };

  useEffect(() => {
    if (templateId) {
      fetchPrefixMetricsById(templateId);
    }
  }, [templateId]);

  const deleteMetricGroup = async (templateId: number, metricGroupId: number) => {
    try {
      const response = await apiClient.deleteTemplategroup(templateId, metricGroupId);
      if (response && response.result) {
        setMetricGroups((prevGroups) => prevGroups.filter((group) => group.id !== metricGroupId));
        setDeleteDialogOpen(false);
        fetchTemplateGroup(templateId);
      } else {
        console.error('Failed to delete metric group');
      }
    } catch (error) {
      console.error('Error deleting metric group:', error);
    }
  };

  const handleDeleteClick = (
    templateId: number,
    metricGroupId: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setDeleteData({ templateId, metricGroupId });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteData) {
      deleteMetricGroup(deleteData.templateId, deleteData.metricGroupId);
    }
    setDeleteDialogOpen(false);
    fetchTemplateGroup(templateId);
    setDeleteData(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteData(null);
  };

  useEffect(() => {
    if (!isNaN(templateId)) {
      fetchTemplateGroup(templateId);
    }
  }, [templateId]);

  const fetchActiveMetricGroups = async () => {
    try {
      const response = await apiClient.getActiveMetricGroupsWithCount();
      if (response && response.result) {
        const filteredGroups = response.result
          .filter((group: any) => !metricGroups.some((mg) => mg.id === group.groupId))
          .map((group: any) => ({
            id: group.groupId,
            name: group.name,
            displayLabel: group.label,
            typeName: group.industryName,
          }));
        setActiveMetricGroups(filteredGroups);
      }
    } catch (error) {
      console.error('Error fetching active metric groups:', error);
    }
  };

  const fetchPrefixMetrics = async () => {
    try {
      const response = await apiClient.getPrefixMetrics();
      if (response && response.result) {
        const metricsList = response.result.map((metric: any) => ({
          id: metric.id,
          name: metric.metricsQuestion,
          displayLabel: metric.displayLabel,
          typeName: metric.typeName,
        }));
        setActiveMetricGroups(metricsList);
      }
    } catch (error) {
      console.error('Error fetching prefix metrics:', error);
    }
  };

  const handleBRSRTaxonomyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBRSRTaxonomyChecked(event.target.checked);
    if (event.target.checked) {
      fetchPrefixMetrics();
    } else {
      fetchActiveMetricGroups();
    }
  };

  const handleConfirm = async () => {
    const selectedGroupIds = popSelect.map((metric) => metric.id);
    const isBRSR = isBRSRTaxonomyChecked;

    try {
      if (!isBRSR) {
        const response = await apiClient.addTemplateGroup(templateId, selectedGroupIds, [], false);
        if (response) {
          setAddDialogOpen(false);
          fetchTemplateGroup(templateId);
          fetchPrefixMetricsById(templateId);
        }
      } else {
        const selectedMetricIds = popSelect.map((metric) => metric.id);
        const response = await apiClient.addTemplateGroup(templateId, [], selectedMetricIds, true);

        if (response) {
          setAddDialogOpen(false);
          fetchTemplateGroup(templateId);
          fetchPrefixMetricsById(templateId);
        }
      }
    } catch (error) {
      console.error('Error adding template group:', error);
    }
  };

  const handleRowSelected = (state: any) => {
    setPopSelect(state.selectedRows);
  };

  const mainTableColumns: TableColumn<MetricData>[] = [
    {
      id: 'indexColumn',
      name: <div className={columnHeader}>{t('S_NO')}</div>,
      selector: (row: MetricData) => row.serialNumber ?? '',
      width: '8%',
    },
    {
      id: 'metricsQuestion',
      name: <div className={columnHeader}>{t('COL_TEMPLATE_NAME')}</div>,
      cell: (row: MetricData) => (
        <Tooltip title={row.metricsQuestion || ''} arrow>
          <span className="truncate-text">{row.metricsQuestion}</span>
        </Tooltip>
      ),
      width: '47%',
    },
    {
      id: 'typeName',
      name: <div className={columnHeader}>{t('TYPE')}</div>,
      selector: (row) => row.typeName,
      width: '15%',
    },
  ];
  const addMetricsTableColumns: TableColumn<MetricData>[] = [
    {
      id: 'name',
      name: <div className={columnHeader}>{t('COL_NAME')}</div>,
      cell: (row) => (
        <Tooltip title={row.name} arrow>
          <span className="truncate-text">{row.name}</span>
        </Tooltip>
      ),
      width: '70%',
    },
  ];

  const columns: any = [
    {
      id: 'indexColumn',
      name: <div className={columnHeader}>{t('S_NO')}</div>,
      selector: (_row: MetricData, index: number) => index + 1,
      width: '10%',
    },
    {
      id: 'metricName',
      name: <div className={columnHeader}>{t('Metric Name')}</div>,
      selector: (row: MetricGroup1) => <span title={row.metricName}>{row.metricName}</span>,
      width: '40%',
    },
    {
      id: 'dataType',
      name: <div className={columnHeader}>{t('Data Type')}</div>,
      cell: (row: MetricGroup1) => <span title={row.dataType}>{row.dataType}</span>,
      width: '20%',
    },
  ];

  return (
    <div className="layout width-100">
      <Link to="/metrics/templates" className="headerText">
        {t('Metrics')} / {t('Template')} / {t('Template Metric')}
      </Link>

      <Typography variant="h2" className="metrics">
        {t('SUBMENU_TEMPLATE')}
      </Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
        <Grid item lg={2.3} xs={1}>
          <DefaultButton
            styles={AddButton}
            className="addgrpbtn"
            iconProps={{ iconName: 'CircleAddition' }}
            text={`${t('BTN_ADD_TEMPLATE')}`}
            onClick={() => {
              fetchActiveMetricGroups();
              setAddDialogOpen(true);
            }}
          />
        </Grid>
      </Grid>

      {metricGroups.length > 0 &&
        metricGroups.map((group) => (
          <Accordion key={group.id} className="accordion-root">
            <AccordionSummary
              expandIcon={<ChevronDownRegular />}
              aria-controls={`panel-${group.id}-content`}
              id={`panel-${group.id}-header`}
              className="accordion-summary"
            >
              <Typography>{`${t('SUBMENU_TEMPLATE')} - ${group.name}`}</Typography>
              <Icon
                iconName="Cancel"
                className="delete-icon"
                onClick={(event) => {
                  if (group.templateId && group.id) {
                    handleDeleteClick(group.templateId, group.id, event);
                  } else {
                    console.error('Invalid templateId or metricGroupId');
                  }
                }}
                style={cancelsIcon}
              />
            </AccordionSummary>
            <AccordionDetails className="accordion-details">
              <div className="table-container">
                <div className="table-content">
                  <DataTable
                    columns={mainTableColumns}
                    data={metrics[group.id] || []}
                    pagination
                    paginationPerPage={5}
                    paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    highlightOnHover
                    noDataComponent={<div>{t('No records available')}</div>}
                  />
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} className="dialog" maxWidth="sm">
        <DialogTitle>{t('DELETE_METRIC_GROUP')}</DialogTitle>
        <DialogActions className="dialogactions">
          <Button onClick={handleDeleteCancel} className="TMCancel">
            {t('CANCEL')}
          </Button>
          <Button onClick={handleDeleteConfirm} className="TMCancel">
            {t('CONFIRM')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setActiveMetricGroups([]);
          setIsBRSRTaxonomyChecked(false);
        }}
        className="dialog"
        maxWidth="md"
      >
        <DialogTitle className="dialog-title">{t('Add Metric Group')}</DialogTitle>
        <DialogContent className="dialogcontent">
          <FormControlLabel
            control={
              <Checkbox
                className="tableMessage"
                checked={isBRSRTaxonomyChecked}
                onChange={handleBRSRTaxonomyChange}
              />
            }
            label={<span className="tableMessage">{t('BRSR Taxonomy')}</span>}
            labelPlacement="end"
          />

          <DataTable
            selectableRows
            onSelectedRowsChange={handleRowSelected}
            columns={addMetricsTableColumns}
            data={activeMetricGroups}
            highlightOnHover
            className="datagrid"
          />
        </DialogContent>
        <DialogActions className="dialogactions">
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setIsBRSRTaxonomyChecked(false);
            }}
            className="TMCancel"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={() => {
              handleConfirm();
              setIsBRSRTaxonomyChecked(false);
            }}
            className="TMCancel"
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {metricGroups1.length > 0 && (
        <DataTable
          columns={columns}
          data={metricGroups1}
          pagination
          selectableRowsHighlight
          highlightOnHover
          responsive
          fixedHeader
          striped
          fixedHeaderScrollHeight="68.03vh"
          paginationComponentOptions={{ rowsPerPageText: `${t('ROWS_PER_PAGE')}` }}
          noDataComponent={
            <div className="noDataWidth">
              {<DataTable columns={columns} data={[{ '': '' }]} />}
              <Stack className="noRecordsWidth">
                {/* {this.state.isRecord
            ? `${this.props.t('RECORDS')}`
            : `${this.props.t('NO_RECORDS')}`} */}
              </Stack>
            </div>
          }
        />
      )}
    </div>
  );
};

export default TemplateMetric;
