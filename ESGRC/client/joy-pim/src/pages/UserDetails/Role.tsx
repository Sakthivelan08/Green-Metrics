import React, { Suspense } from 'react';
import 'react-phone-input-2/lib/style.css';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import DataTable from 'react-data-table-component';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { ComboBox, IComboBox, IComboBoxOption, Icon, Modal, Stack } from '@fluentui/react';
import { Link } from 'react-router-dom';
import ApiManager from '@/services/ApiManager';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { CancelroleStyles, cancelIcon, iconButtonStyles } from '@/common/properties';
import { withTranslation } from 'react-i18next';
import { Card, Grid } from '@mui/material';
import NotificationManager from '@/services/NotificationManager';
import {
  AddButton,
  AddButtonDea,
  columnHeader,
  hyperlink,
  PIMcontentStyles,
  PIMfooterButtonCancel,
  PIMHearderText,
  PIMsearchBoxStyles,
} from '../PimStyles';
import AddEditRole from './AddEditRole';

class Role extends React.Component<any, any> {
  apiClient = new ApiManager().CreateApiClient();
  stausofRecords = true;
  options: IComboBoxOption[] = [
    { key: 1, text: 'Yes' },
    { key: 2, text: 'No' },
  ];
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
      selectedRowData: [],
      noSelection: false,
      isRecord: true,
      filterOption: 'all',
    };
  }

  async componentDidMount(): Promise<void> {
    this.refresh(!this.state.inActivePage);
  }
  async refresh(inActivePage: boolean) {
    try {
      this.setState({ searchKey: '', isRecord: true, currentRecord: [] });
      const apiResponse: any = (await this.apiClient.getRoles(inActivePage)).result;
      this.setState({
        currentRecord: apiResponse?.map((item: any, index: any) => ({ index: index + 1, ...item })),
        copyRecord: apiResponse?.map((item: any, index: any) => ({ index: index + 1, ...item })),
        enableActiveButton: false,
        enableEditButton: false,
        selectedRowData: [],
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
    });
  }

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };
  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };
  rowSelection = (e: any) => {
    this.setState({ selectedRowData: e.selectedRows });
    const selectionCount = e.selectedCount;

    switch (selectionCount) {
      case 0:
        this.setState({ enableEditButton: false, enableActiveButton: false });
        break;
      case 1:
        this.setState({ enableEditButton: true, enableActiveButton: true });
        break;
      default:
        this.setState({ enableEditButton: false, enableActiveButton: true });
        break;
    }
  };

  async onActiaveClick() {
    try {
      const selectedRecordIds = [];
      for (let i = 0; i < this.state.selectedRowData.length; i++) {
        selectedRecordIds.push(this.state.selectedRowData[i].id);
      }
      const response = this.state.inActivePage
        ? await this.apiClient.activateRoleBatch(selectedRecordIds)
        : await this.apiClient.deactivateRoleBatch(selectedRecordIds);
      if (response.hasError) {
        this.notify.showErrorNotify(this.props.t('ERROR_UNKNOWN'));
      } else {
        this.notify.showSuccessNotify(
          this.state.inActivePage
            ? `${this.props.t('MSG_ACTIVATE')}`
            : `${this.props.t('MSG_DEACTIVATE')}`,
        );
      }
      this.setState(
        {
          filterOption: 'all',
          inActivePage: false,
          selectedRowData: [],
        },
        () => {
          this.refresh(true);
        },
      );
    } catch (e: any) {
      this.notify.showErrorNotify(e.message);
    }
  }

  handleRowClick = (row: any) => {
    this.setState({
      visible: true,
      selectedRowData: [row],
    });
  };
  onSearch(e: any) {
    var newValue = e?.target.value;
    newValue = newValue == undefined ? '' : newValue;
    this.setState({ searchKey: newValue });
    var { copyRecord } = this.state;
    var result = copyRecord.filter((element: any) => {
      return element?.name
        ?.toLowerCase()
        .includes(newValue.trim().split(/ +/).join(' ').toLowerCase());
    });
    this.setState({
      currentRecord: result?.map((item: any, index: any) => ({ index: index + 1, ...item })),
    });
  }

  render() {
    const { currentRecord } = this.state;
    const { t } = this.props;

    const columns: any = [
      {
        key: 'indexColumn',
        name: <div className={columnHeader}>{t('S_NO')}</div>,
        selector: (row: any) => row.index,
        width: '10%',
      },
      {
        key: 'nameColumn',
        name: <div className={columnHeader}>{t('TABLE_DESCRIPTION_NAME')}</div>,
        selector: (row: any) => row.name,
        cell: (row: any) => (
          <span className={hyperlink} onClick={() => this.handleRowClick(row)} title={row.name}>
            {row.name}
          </span>
        ),
        width: '18%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.name?.localeCompare(b?.name),
      },
      {
        key: 'descriptionColumn',
        name: <div className={columnHeader}>{t('COL_DESCRIPTION')}</div>,
        selector: (row: any) => <span title={row.description}>{row.description}</span>,
        width: '25%',
        sortable: true,
        sortFunction: (a: any, b: any) => a?.description?.localeCompare(b?.description),
      },
      {
        key: 'isActiveColumn',
        name: <div className={columnHeader}>{t('ACTIVE')}</div>,
        selector: (row: any) => (row.isActive !== undefined ? (row.isActive ? 'Yes' : 'No') : ''),
        cell: (row: any) => (
          <span title={row.isActive ? 'Yes' : 'No'}>
            {row.isActive !== undefined ? (row.isActive ? 'Yes' : 'No') : ''}
          </span>
        ),
        width: '10%',
      },
    ];
    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Link to={`/setting/role`} className="headerText">
            {t('MENU_SETTINGS')}/{t('MENU_ROLE')}
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
                {t('MENU_ROLES')}
              </Text>
            </Stack>
            <Grid item lg={8.6} xs={1} />
            <Grid item lg={1.3} xs={1}>
              <DefaultButton
                className="button"
                type="primary"
                onClick={() => {
                  this.setState({
                    A_D_Visible: true,
                    noSelection: !this.state.noSelection,
                    enableEditButton: false,
                    enableActiveButton: false,
                  });
                }}
                styles={AddButton}
                text={this.state.inActivePage ? `${t('BTN_ACTIVATE')}` : `${t('BTN_DEACTIVATE')}`}
                disabled={!this.state.enableActiveButton}
              />
            </Grid>
            <Grid item lg={1.5} xs={1}>
              <DefaultButton
                className="button"
                styles={AddButton}
                iconProps={{ iconName: 'CircleAddition' }}
                text={`${t('ADD_ROLE')}`}
                disabled={
                  this.state.enableActiveButton ||
                  this.state.inActivePage ||
                  this.state.filterOption === 'yes' ||
                  this.state.filterOption === 'no'
                }
                onClick={() => this.setState({ visible: true })}
              />
            </Grid>
          </Grid>

          <Grid lg={12} item container spacing={1} direction={'row'}>
            <Grid item lg={2.2} xs={12}>
              <SearchBox
                className="searchBox"
                styles={PIMsearchBoxStyles}
                placeholder={t('SEARCH_PLACEHOLDER')}
                onChange={(e: any) => this.onSearch(e)}
                value={this.state.searchKey}
                onClear={() => this.setState({ searchKey: '' })}
              />
            </Grid>
            <Grid item lg={8.5} xs={2} />
            <Grid item lg={0.5} xs={2} className="filterContainer">
              <Icon
                iconName="FilterSolid"
                title={this.props.t('BTN_FILTER')}
                className="iconStyle"
              />
              <ComboBox
                multiSelect
                options={[
                  { key: 'all', text: this.props.t('ALL') },
                  { key: 'yes', text: this.props.t('YES') },
                  { key: 'no', text: this.props.t('NO') },
                ]}
                selectedKey={this.state.filterOption}
                onChange={(event: React.FormEvent<IComboBox>, selectedOption?: IComboBoxOption) => {
                  if (selectedOption) {
                    const selectedKey = selectedOption.key as string;

                    this.setState(
                      {
                        filterOption: selectedKey,
                        inActivePage: selectedKey === 'no',
                        enableActiveButton: false,
                        enableEditButton: false,
                        selectedRowData: [],
                      },
                      () => {
                        if (selectedKey === 'all') {
                          this.refresh(true);
                        } else {
                          this.refresh(selectedKey === 'yes');
                        }
                      },
                    );
                  }
                }}
                className="filterCombobox"
              />
            </Grid>
            <Grid className="filterContainer" style={{ marginTop: '12px' }}>
              {this.state.filterOption !== 'all' && (
                <Icon
                  iconName="ClearFilter"
                  title={this.props.t('CLEAR_FILTER')}
                  className="clearFilterIcon"
                  onClick={() => {
                    this.setState(
                      {
                        filterOption: 'all',
                        inActivePage: false,
                      },
                      () => this.refresh(true),
                    );
                  }}
                />
              )}
            </Grid>
            <Grid item lg={0.5} xs={1}>
              <Icon
                style={{ paddingRight: '-10px' }}
                iconName="Refresh"
                title={this.props.t('BTN_REFRESH')}
                className="iconStyle iconStyle3"
                onClick={() => {
                  this.setState(
                    {
                      filterOption: 'all',
                      inActivePage: false,
                      selectedRowData: [],
                    },
                    () => {
                      this.refresh(true);
                    },
                  );
                }}
              />
            </Grid>
          </Grid>

          <Modal
            isOpen={this.state.A_D_Visible}
            containerClassName={PIMcontentStyles.confirmContaineruser}
            isBlocking={false}
            onDismiss={() =>
              this.setState({
                A_D_Visible: false,
              })
            }
          >
            <div className={PIMcontentStyles.confirmHeaderUser}>
              <IconButton
                styles={CancelroleStyles}
                iconProps={cancelIcon}
                ariaLabel="Close popup modal"
                onClick={() => {
                  this.setState({
                    A_D_Visible: false,
                    noSelection: !this.state.noSelection,
                    enableEditButton: false,
                    enableActiveButton: false,
                    selectedRowData: [],
                  });
                }}
              />
            </div>
            <div className={PIMcontentStyles.confirmbody}>
              {this.state.inActivePage == false ? (
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
                    styles={AddButton}
                    text={`${t('BTN_CONFIRM')}`}
                    onClick={this.onActiaveClick.bind(this)}
                  />
                </Grid>
                <Grid item lg={0.5} xs={12} />
                <Grid item lg={4} xs={12}>
                  <DefaultButton
                    className="button"
                    styles={PIMfooterButtonCancel}
                    text={`${t('BTN_CANCEL')}`}
                    onClick={() => {
                      this.setState({ A_D_Visible: false });
                    }}
                  />
                </Grid>
                <Grid item lg={2} xs={12} />
              </Grid>
            </div>
          </Modal>
          <Modal
            isOpen={this.state.visible}
            containerClassName={PIMcontentStyles.container}
            isBlocking={false}
            onDismiss={() =>
              this.setState({
                visible: false,
              })
            }
          >
            <div className={PIMcontentStyles.header}>
              <Grid container spacing={2}>
                <Grid item xs={10.5}>
                  <p>
                    {this.state.selectedRowData.length != 0 ? (
                      <span className="apptext1">{`${t('EDIT_ROLE')}`}</span>
                    ) : (
                      <span className="apptext1">{`${t('ADD_ROLE')}`}</span>
                    )}
                  </p>
                </Grid>
                <Grid item xs={1.5}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => {
                      this.setState({
                        visible: false,
                        noSelection: !this.state.noSelection,
                        enableEditButton: false,
                        enableActiveButton: false,
                        selectedRowData: [],
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </div>
            <div className={PIMcontentStyles.body}>
              <AddEditRole
                SelectedUser={this.state.selectedRowData[0]}
                recordId={this.state.selectedRowData[0]?.id}
                ClosePopup={() => {
                  this.setState({
                    visible: false,
                    noSelection: !this.state.noSelection,
                    enableEditButton: false,
                    enableActiveButton: false,
                    selectedRowData: [],
                  });
                  this.refresh(true);
                }}
              />
            </div>
          </Modal>
          <Card>
            {this.state.currentRecord?.length > 0 ? (
              <DataTable
                columns={columns}
                data={currentRecord}
                pagination={true}
                selectableRows={this.state.selectedRowData}
                onSelectedRowsChange={this.rowSelection}
                clearSelectedRows={this.state.noSelection}
                selectableRowsHighlight
                highlightOnHover
                responsive
                fixedHeader
                striped
                fixedHeaderScrollHeight="68.03vh"
                paginationComponentOptions={{ rowsPerPageText: `${this.props.t('ROWS_PER_PAGE')}` }}
                paginationPerPage={this.Defaultperpage()}
                paginationRowsPerPageOptions={this.perpage()}
                noDataComponent={
                  <div className="noDataWidth">
                    {<DataTable columns={columns} data={[{ '': '' }]} />}
                    <Stack className="noRecordsWidth">
                      {this.state.isRecord == true
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
      </div>
    );
  }
}

const ComponentTranslated: any = withTranslation()(Role);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
