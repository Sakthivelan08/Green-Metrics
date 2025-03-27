import { Stack } from '@fluentui/react';
import React from 'react';
import DataTable from 'react-data-table-component';
import { columnHeader, PIMHearderText } from '../PimStyles';
import { t } from 'i18next';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import ApiManager from '@/services/ApiManager';
import AuthManagerService from '@/services/AuthManagerService';
import NotificationManager from '@/services/NotificationManager';
import { Link } from 'react-router-dom';
import { Grid } from '@mui/material';
interface props {
  Datakd: any;
}
class ViewQuery extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  authManager = new AuthManagerService();
  notify = new NotificationManager();
  isAuthenticated = this.authManager.isAuthenticated();
  constructor(props: any) {
    super(props);
    this.state = {
      currentRecord: [],
      isRecord: true,
      A_D_Visible: false,
    };
  }
  componentDidMount() {
    this.refresh();
  }
  async refresh() {
    this.setState({ isRecord: true, currentRecord: [] });
    try {
      const response = (await this.apiClient.getViewQueries(this.props.Datakd.id)).result;
      this.setState({
        currentRecord: response?.map((item: any, index: any) => ({
          index: index + 1,
          ...item,
        })),
      });
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

  render() {
    const columns: any[] = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{`${t('S_NO')}`}</div>,
        selector: (row: any) => row.index,
        isVisible: true,
        minwidth: '100px',
      },
      {
        key: 'auditprocessname',
        name: <div className={columnHeader}>{`${t('COL_AUDIT_PROCESS_NAME')}`}</div>,
        selector: (row: any) => row.auditname,
        isVisible: true,
        minwidth: '100px',
      },
      {
        key: 'querydescription',
        name: <div className={columnHeader}>{`${t('COL_QUERY_DESCRIPTION')}`}</div>,
        selector: (row: any) => row.querydescription,
        isVisible: true,
        minwidth: '100px',
      },
      {
        key: 'response',
        name: <div className={columnHeader}>{`${t('COL_RESPONSE')}`}</div>,
        selector: (row: any) => row.response,
        isVisible: true,
        minwidth: '100px',
      },
    ];
    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/activity`} className="headerText">
            {t('MENU_ACTIVITY')}/{t('SUBMENU_QUERIES')}
          </Link>
          <Grid
            item
            container
            spacing={-4}
            direction={'row'}
            justifyContent="space-between"
            alignItems="center"
          >
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
          noDataComponent={
            <div className="noDataWidth">
              {<DataTable columns={columns} data={[{ '': '' }]} />}
              <Stack className="noRecordsWidth">
                {this.state.isRecord == true ? `${t('RECORDS')}` : `${t('NO_RECORDS')}`}
              </Stack>
            </div>
          }
        />
        <div></div>
      </div>
    );
  }
}
export default ViewQuery;
