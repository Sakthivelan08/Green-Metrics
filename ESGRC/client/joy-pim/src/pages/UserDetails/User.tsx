import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';
import { Icon, Modal, Stack } from '@fluentui/react';
import { Link } from 'react-router-dom';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import NotificationManager from '@/services/NotificationManager';
import {
  AddButton,
  AddFam,
  CancelBtn,
  cancelsIcon,
  CardAlignment,
  checkMarkIcon,
  columnHeader,
  hyperlink,
  PIMcontentStyles,
  PIMsearchBoxStyles,
} from '../PimStyles';
import AddEditUser from './AddEditUser';
import { AddorUpdateUser } from '../enumCommon';

class User extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  constructor(props: any) {
    super(props);
    this.state = {
      A_D_Visible: false,
      currentRecord: [],
      enableEditButton: false,
      enableActiveButton: false,
      inActivePage: false,
      copyRecord: [],
      searchKey: '',
      roleList: [],
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      filtervalue: 1,
      visible: false,
      row: null,
    };
  }

  componentDidMount() {
    this.refresh(2);
  }

  async refresh(inActivePage: number) {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const roleList: any[] = [];
      const apiResponse: any = (await this.apiClient.searchAllUsers(inActivePage)).result?.records;
      this.apiClient.getRoles(true).then((r: any) => {
        if (r?.result) {
          r.result.forEach((element: any) => {
            roleList.push({ key: element.id, text: element.name });
          });
        }
      });

      this.setState({
        currentRecord: apiResponse?.map((item: any, index: any) => ({ index: index + 1, ...item })),
        copyRecord: apiResponse?.map((item: any, index: any) => ({ index: index + 1, ...item })),
        roleList: roleList,
      });
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
    this.setState({
      A_D_Visible: false,
      noSelection: !this.state.noSelection,
      enableEditButton: false,
      enableActiveButton: false,
      selectedRowData: [],
      isRecord: false,
      visible: false,
    });
  }

  onSearch(e: any) {
    const newValue = e?.target.value ?? '';
    this.setState({ searchKey: newValue });
    const { copyRecord } = this.state;
    const result = copyRecord.filter((element: any) => {
      return (
        element?.name
          ?.toLowerCase()
          .includes(newValue.trim().split(/ +/).join(' ').toLowerCase()) ||
        element?.email?.toLowerCase().includes(newValue.toLowerCase()) ||
        element?.mobile?.includes(newValue.toLowerCase())
      );
    });
    this.setState({ currentRecord: result });
  }

  handleRowClick = (row: any) => {
    this.handleEdit(row);
    this.setState({
      visible: true,
      selectedRowData: [row],
    });
  };

  async toggleQuestionStatus(row: any, isActive: boolean) {
    try {
      if (isActive) {
        await this.apiClient.deactivateUser(row.id);
        this.notify.showSuccessNotify(this.props.t('MSG_DEACTIVATE'));
      } else {
        await this.apiClient.activateUser(row.id);
        this.notify.showSuccessNotify(this.props.t('MSG_ACTIVATE'));
      }
    } catch (error) {
      this.notify.showErrorNotify(
        `${this.props.t('FAILEDTO')} ${
          isActive ? this.props.t('BTN_DEACTIVATE') : this.props.t('BTN_ACTIVATE')
        } ${this.props.t('COL_NAMESET')}`,
      );
    }
    this.refresh(2);
  }

  handleEdit(row: any): void {
    let body = new AddorUpdateUser();
    body.email = row.email;
    body.firstName = row.firstName;
    body.lastName = row.lastName;
    body.mobile = row.mobile;
    this.setState({ selectedDatatoEdit: body });
  }

  render() {
    const { currentRecord } = this.state;
    const { t } = this.props;
    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '100px',
      },
      {
        key: 'nameColumn',
        name: <div className={columnHeader}>{t('TABLE_DESCRIPTION_NAME')}</div>,
        selector: (row: any) => row.nameColumn,
        cell: (row: any) => (
          <span className={hyperlink} onClick={() => this.handleRowClick(row)} title={row.name}>
            {row.name}
          </span>
        ),
        width: '200px',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.name?.localeCompare(b?.name),
      },
      {
        key: 'emailColumn',
        name: <div className={columnHeader}>{t('TABLE_DESCRIPTION_EMAIL')}</div>,
        selector: (row: any) => <span title={row.email}>{row.email}</span>,
        width: '250px',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.email?.localeCompare(b?.email),
      },
      {
        key: 'mobileColumn',
        name: <div className={columnHeader}>{t('TABLE_DESCRIPTION_MOBILE')}</div>,
        selector: (row: any) => <span title={row.mobile}>{row.mobile}</span>,
        width: '150px',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.mobile?.localeCompare(b?.mobile),
      },
      {
        key: 'isactive',
        name: <div className={columnHeader}>{this.props.t('COL_STATUS')}</div>,
        selector: (row: any) => {
          if (row.index) {
            const tooltipText = row.isActive
              ? this.props.t('BTN_ACTIVATE')
              : this.props.t('BTN_DEACTIVATE');
            return <span title={tooltipText}>{tooltipText}</span>;
          }
          return null;
        },
        isVisible: true,
        width: '130px',
        sortable: true,
        sortFunction: (a: any, b: any) => (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0),
      },
      {
        key: 'action',
        name: <div className={columnHeader}>{`${this.props.t('COL_ACTION')}`}</div>,
        selector: (row: any) => {
          if (row.index) {
            return (
              <>
                {row.isActive === false ? (
                  <Icon
                    iconName="CheckMark"
                    className="iconStyle"
                    title={this.props.t('BTN_ACTIVATE')}
                    onClick={() => this.setState({ row, A_D_Visible: true, inActivePage: false })}
                    style={checkMarkIcon}
                  />
                ) : (
                  <Icon
                    iconName="Cancel"
                    className="iconStyle"
                    title={this.props.t('BTN_DEACTIVATE')}
                    onClick={() => this.setState({ row, A_D_Visible: true, inActivePage: true })}
                    style={cancelsIcon}
                  />
                )}
              </>
            );
          }
          return null;
        },
        isVisible: false,
        width: '100px',
      },
    ];

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/setting/user`} className="headerText">
            {t('MENU_SETTINGS')}/{t('MENU_USER')}
          </Link>
          <Grid
            item
            container
            spacing={-4}
            direction={'row'}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item lg={3.5} xs={12}>
              <Text variant="xxLarge" className={CardAlignment.headerText}>
                {`${this.props.t('MENU_USERS')}`}
              </Text>
            </Grid>
            <Grid item lg={1.6} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ROLE_USER_BTN_ADD')}`}
                disabled={this.state.enableActiveButton || this.state.filtervalue != 1}
                onClick={() =>
                  this.setState({ visible: true, selectedRowData: [], selectedDatatoEdit: null })
                }
              />
            </Grid>
          </Grid>
          <Grid lg={12} item container spacing={1} direction={'row'}>
            <Grid item lg={2} xs={12}>
              <SearchBox
                className="searchBox"
                styles={PIMsearchBoxStyles}
                placeholder={t('SEARCH_PLACEHOLDER')}
                onChange={(e: any) => this.onSearch(e)}
                value={this.state.searchKey}
                onClear={() => this.setState({ searchKey: '' })}
              />
            </Grid>
            <Grid item lg={7.35} />
            <Grid item lg={0.5} xs={2}>
              <Icon
                iconName="Refresh"
                title={this.props.t('BTN_REFRESH')}
                className="iconStyle iconStyle2"
                onClick={() => this.refresh(2)}
              />
            </Grid>
          </Grid>
          <Modal
            isOpen={this.state.visible}
            containerClassName={PIMcontentStyles.attributeContainer}
            isBlocking={false}
            onDismiss={() => this.setState({ visible: false })}
          >
            <div className={PIMcontentStyles.header}>
              <div className="apptext1">
                {this.state.selectedRowData.length !== 0
                  ? `${this.props.t('EDIT_USER')}`
                  : `${this.props.t('ADD_USER')}`}
              </div>
              <div className="UserADDorUpdate">
                <IconButton
                  styles={iconButtonStyles}
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={() => {
                    this.setState({ visible: false });
                  }}
                />
              </div>
            </div>
            <div className={PIMcontentStyles.body}>
              <AddEditUser
                SelectedUser={this.state.selectedDatatoEdit}
                recordId={this.state.selectedRowData[0]?.id}
                ClosePopup={() => {
                  this.setState({ visible: false, selectedDatatoEdit: null });
                  this.refresh(2);
                }}
              />
            </div>
          </Modal>
          <Modal
            isOpen={this.state.A_D_Visible}
            containerClassName={PIMcontentStyles.confirmContaineruser}
            isBlocking={false}
            onDismiss={() => this.setState({ A_D_Visible: false })}
          >
            <div className={PIMcontentStyles.confirmHeaderUser}>
              <IconButton
                styles={iconButtonStyles}
                iconProps={cancelIcon}
                ariaLabel="Close popup modal"
                onClick={() => this.setState({ A_D_Visible: false })}
              />
            </div>
            <div className={PIMcontentStyles.confirmbody}>
              {this.state.inActivePage ? (
                <Text variant="xLarge" className="apptext2">{`${t('CONFIRM_DEACTIVATE')}`}</Text>
              ) : (
                <Text variant="xLarge" className="apptext2">{`${t('CONFIRM_ACTIVATE')}`}</Text>
              )}
            </div>

            <div className={PIMcontentStyles.footer}>
              <Grid lg={12} item container spacing={2}>
                <Grid item lg={1.5} xs={12} />
                <Grid item lg={4} xs={12}>
                  <DefaultButton
                    className="button"
                    styles={AddFam}
                    text={`${t('BTN_CONFIRM')}`}
                    onClick={() =>
                      this.toggleQuestionStatus(this.state.row, this.state.inActivePage)
                    }
                  />
                </Grid>
                <Grid item lg={0.5} xs={12} />
                <Grid item lg={4} xs={12}>
                  <DefaultButton
                    className="button"
                    styles={CancelBtn}
                    text={`${t('BTN_CANCEL')}`}
                    onClick={() => this.setState({ A_D_Visible: false })}
                  />
                </Grid>
                <Grid item lg={2} xs={12} />
              </Grid>
            </div>
          </Modal>

          <div>
            {this.state.currentRecord?.length > 0 ? (
              <DataTable
                columns={columns}
                data={currentRecord}
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
          </div>
        </div>
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(User);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
