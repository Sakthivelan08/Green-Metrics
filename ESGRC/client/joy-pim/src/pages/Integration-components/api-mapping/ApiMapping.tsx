import { AddFam, columnHeader, PIMHearderText } from '@/pages/PimStyles';
import { ApiMetadataDtoListApiResponse } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import { DefaultButton, Stack, Text } from '@fluentui/react';
import Grid from '@mui/material/Grid';
import { t } from 'i18next';
import React from 'react'
import DataTable, { TableColumn } from 'react-data-table-component';
import AddEditMetaData from '../meta-data/AddEditMetaData';

interface Props {
    tableData: any[];
    addMetaData: boolean;
}

export class ApiMapping extends React.Component<any, Props> {
    apiClient = new ApiManager().CreateApiClient();

    constructor(props: Props) {
        super(props);
        this.state = {
            tableData: [],
            addMetaData: false
        }
    }

    componentDidMount(): void {
        this.getTableData()
    }

    getTableData(list?: number[]): void {
        if (list === undefined) {
            list = [1];
        }

        const res = Promise.all(list.map(async e => {
            let response;
            if (e === 1) {
                response = await this.apiClient.getApiMapping();
            }
            return { e, response };
        }));

        res.then(r => {
            this.responseMapping(r);
        })
    }

    responseMapping(response: { e: number; response: ApiMetadataDtoListApiResponse | undefined; }[]): void {
        response.forEach(element => {
            if (element.e === 1 && !element.response?.hasError && element.response?.result !== undefined) {
                this.setState({ tableData: element.response?.result });
            }
        });
    }

    Defaultperpage = () => {
        const recordCont = 25;
        return recordCont;
    };

    perpage = () => {
        const recordCont = [25, 50, 100, 150, 200];
        return recordCont;
    };

    toggleAddPopup(): void {
        this.setState({ addMetaData: !this.state.addMetaData });
    }

    render() {

        const _column: TableColumn<any>[] = [
            {
                name: <div className={columnHeader}>{`${t('S_NO')}`}</div>,
                selector: (row: any, rowIndex: any) => rowIndex + 1,
            },
            {
                name: <div className={columnHeader}>{`${t('BASE_URL')}`}</div>,
                selector: (row: any) => row?.baseUrl,
            }
        ];

        return (
            <div className="layout width-100">
                <Stack>
                    <Grid container spacing={2} direction="row" alignItems="center" className="grid">
                        <Grid item lg={3.5} xs={12}>
                            <Text variant="xxLarge" styles={PIMHearderText} className="color-blue text">{`${t(
                                'MENU_API_META_DATA',
                            )}`}</Text>
                        </Grid>
                        <Grid item lg={6.5} xs={12} />
                        <Grid item lg={2} xs={12} >
                            <DefaultButton
                                className="button"
                                iconProps={{ iconName: 'CircleAddition' }}
                                text={`${t('BTN_ADD')}`}
                                styles={AddFam}
                                onClick={() => this.toggleAddPopup()}
                            />
                        </Grid>
                    </Grid>
                </Stack>

                <div>
                    <DataTable
                        columns={_column}
                        data={this.state.tableData}
                        pagination={true}
                        responsive
                        striped
                        highlightOnHover
                        selectableRowsHighlight
                        fixedHeader
                        fixedHeaderScrollHeight="386px"
                        paginationComponentOptions={{ rowsPerPageText: `${t('ROWS_PER_PAGE')}` }}
                        paginationPerPage={this.Defaultperpage()}
                        paginationRowsPerPageOptions={this.perpage()}
                        noDataComponent={
                            <div className="noDataWidth">
                                {<DataTable columns={_column} data={[{ '': '' }]} />}
                                <Stack className="noRecordsWidth">
                                    {this.state.tableData.length !== 0
                                        ? `${t('RECORDS')}`
                                        : `${t('NO_RECORDS')}`}
                                </Stack>
                            </div>
                        }
                    />
                    <AddEditMetaData isOpen={this.state.addMetaData} togglePopup={() => this.toggleAddPopup()} refreshData={() => this.getTableData([1])} />
                </div>
            </div>
        )
    }
}
