import { Icon, IconButton, Modal, Stack } from '@fluentui/react';
import React, { Suspense } from 'react';
import DataTable from 'react-data-table-component';
import { withTranslation } from 'react-i18next';
import { columnHeader, PIMcontentStyles, PIMHearderText } from '../PimStyles';
import { t } from 'i18next';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import ApiManager from '@/services/ApiManager';
import AuthManagerService from '@/services/AuthManagerService';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
import { Grid } from '@mui/material';
import { queriesEnum, TemplateStageApprovalEnum } from '../enumCommon';

import { iconButtonStyles, cancelIcon } from '@/common/properties';
import Viewquery from '../Compliance/Viewquery';
import AddorUpdateQuery from './AddorUpdateQuery';

class Queriesraise extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  notify = new NotificationManager();
  isAuthenticated = this.authManager.isAuthenticated();

  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      noSelection: false,
      isRecord: true,
      A_D_Visible: false,
      Visible: false,
      Queriesraisedata: [],
      viewQueriesraisedata: [],
      name:'',
    };
  }

  componentDidMount() {
    this.refresh();
    this.fetchNameOptions();
  }

  async fetchNameOptions() {
    try {
      const response = await this.apiClient.getRoles(true);
      if (!response?.result) {
        throw new Error('No result from the API');
      }
      const name = new Map<number, string>(
        response.result.map((e: any) => [e.id, e.name]),
      );
      this.setState({ name });
    } catch (error) {
      this.notify.showErrorNotify('Error getting name');
    }
  }

  async refresh() {
    this.setState({ isRecord: true, currentRecord: [], noSelection: false });
    try {
      const response = (await this.apiClient.getQueriesstatus()).result;
      this.setState({
        currentRecord: (response || []).map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
      });      
      this.setState({
        isRecord: this.state.currentRecord.length > 0,
      });
      await this.fetchNameOptions();
    } catch (e: any) {
      this.notify.showErrorNotify(e);
    }
  }

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };

  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };

  ViewApp(row: any) {
    this.setState({ A_D_Visible: true, Queriesraisedata: row });
  }
  ViewApp1(row: any) {
    this.setState({ Visible: true, viewQueriesraisedata: row });
  }
  getStatusClass = (status: TemplateStageApprovalEnum): string => {
    switch (status) {
      case TemplateStageApprovalEnum.Completed:
        return 'status-completed';
      case TemplateStageApprovalEnum.Error:
        return 'status-error';
      case TemplateStageApprovalEnum.QueryRaised:
        return 'status-query-raised';
      case TemplateStageApprovalEnum.Rejected:
        return 'status-rejected';
      case TemplateStageApprovalEnum.Success:
        return 'status-success';
      case TemplateStageApprovalEnum.Pending:
        return 'status-pending';
      case TemplateStageApprovalEnum.Yettostart:
        return 'status-yet-to-start';
      case TemplateStageApprovalEnum.Approved:
        return 'status-approved';
      default:
        return 'status-default';
    }
  };

  render() {
    const columns: any[] = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{`${t('S_NO')}`}</div>,
        selector: (row: any) => row.index,
        isVisible: true,
        width: '7%'
      },
      {
        key: 'auditname',
        name: <div className={columnHeader}>{`${t('COL_AUDIT_PROCESS_NAME')}`}</div>,
        selector: (row: any) => <span title={row.auditname}>{row.auditname}</span>,
        isVisible: true,
        width: '12%',
      },
      {
        key: 'Assignedto',
        name: <div className={columnHeader}>{`${t('COL_ASSIGNED_TO')}`}</div>,
        selector: (row: any) => {
          const requestedByName = this.state.name || new Map();
          const assignedName = requestedByName.get(row.roleid) || row.roleid;
          return <span title={assignedName}>{assignedName}</span>;
        },
        isVisible: true,
        width: '12%',
      },
      {
        key: 'status',
        name: <div className={columnHeader}>{t('COL_STATUS')}</div>,
        selector: (row: { querystatus: TemplateStageApprovalEnum }) => {
          const statusClass = this.getStatusClass(row.querystatus);
          const statusText = TemplateStageApprovalEnum[row.querystatus] || '-';

          return this.state.currentRecord.length > 0 ? (
            <div className={`status-label ${statusClass}`}>{statusText}</div>
          ) : null;
        },
        width: '13%',
      },
      {
        key: 'Action',
        name: <div className={columnHeader}>{t('COL_ACTION')}</div>,
        width: '10%',
        cell: (row: any) => {
          return (
            this.state.currentRecord.length > 0 && (
              <div>
                <Icon iconName="RedEye" onClick={() => this.ViewApp(row)} className='redeyeicon'/>
                <Icon iconName="Edit" onClick={() => this.ViewApp1(row)} className='editicon'/>
              </div>
            )
          );
        },
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_QUERIES')}
          </Link>
          <Grid lg={12} item container spacing={1} direction={'row'}>
          <Grid item lg={2} xs={12}>
            <Stack>
              <Text
                className="color-blue text"
                key={'xxLarge'}
                variant={'xxLarge' as ITextProps['variant']}
                styles={PIMHearderText}
                nowrap
                block
              >
                {t('Queries')}
              </Text>
            </Stack>
          </Grid>

          <Grid item lg={0.9} xs={6}></Grid>
            <Grid item lg={1.3} xs={6}></Grid>
            <Grid item lg={1.3} xs={6}></Grid>
            
            <Grid item lg={4.7} />
            <Grid item lg={0.8} xs={1}>
              <Icon
                iconName="Refresh"
                title={this.props.t('BTN_REFRESH')}
                className="iconStyle iconStyle1"
                onClick={() => this.refresh()}
              />
            </Grid>
          </Grid>
          
        </div>
        <DataTable
          columns={columns}
          data={this.state.currentRecord}
          pagination={true}
          clearSelectedRows={this.state.noSelection}
          selectableRowsHighlight
          highlightOnHover
          responsive
          fixedHeader
          striped
          fixedHeaderScrollHeight="68.03vh"
          paginationComponentOptions={{
            rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}`,
          }}
          paginationPerPage={this.Defaultperpage()}
          paginationRowsPerPageOptions={this.perpage()}
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
        <div>
          <Modal
            isOpen={this.state.A_D_Visible}
            containerClassName={PIMcontentStyles.tableContainer}
            isBlocking={false}
            onDismiss={() => {
              this.setState({ A_D_Visible: false }, () => {
                this.refresh();
              });
            }}
          >
            <div className={PIMcontentStyles.header}>
              <Grid container spacing={2}>
                <Grid item xs={10.5}>
                  <div className="apptext1">
                    <span>{`${t('AddQuery')}`}</span>
                  </div>
                </Grid>
                <Grid item xs={1.5}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => {
                      this.setState({ A_D_Visible: false }, () => {
                        this.refresh();
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </div>
            <div className={PIMcontentStyles.body}>
              <Viewquery Datakd={this.state.Queriesraisedata} />
            </div>
          </Modal>

          <Modal
            isOpen={this.state.Visible}
            containerClassName={PIMcontentStyles.container}
            isBlocking={false}
            onDismiss={() => {
              this.setState({ Visible: false }, () => {
                this.refresh();
              });
            }}
          >
            <div className={PIMcontentStyles.header}>
              <Grid container spacing={2}>
                <Grid item xs={10.5}>
                  <div className="apptext1">
                    <span>{`${this.state.currentRecord.length===0 ?t('AddQuery'):t('EditQuery')}`}</span>
                  </div>
                </Grid>
                <Grid item xs={1.5}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => {
                      this.setState({ Visible: false }, () => {
                        this.refresh();
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </div>
            <div className={PIMcontentStyles.body}>            
              <AddorUpdateQuery
                rowData1={this.state.currentRecord}
                ClosePopup={() => this.setState({ Visible: false }, () => this.refresh())}
                kd={this.state.currentRecord}
                Datakd={this.state.currentRecord}
              />
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(Queriesraise);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
