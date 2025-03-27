import React, { Component } from 'react';
import DataTable from "react-data-table-component";
import ApiManager from '@/services/ApiManager';
import { DefaultButton } from '@fluentui/react';
import { Grid } from '@mui/material';
import { AddFam, columnHeader } from '../PimStyles';
import { t } from 'i18next';

class SupplierOrgCreation extends Component<any, any> {
    apiClient = new ApiManager().CreateApiClient();
    constructor(props: any) {
        super(props);
        this.state = {
            selectedRowData: [],
            supplierDetails: []
        }
    }

    componentDidMount = async () => {
        const supplierDetails = await this.apiClient.getSupplierDetails();
        if (!supplierDetails?.hasError && supplierDetails?.result && supplierDetails?.result?.length > 0) {
            this.setState({ supplierDetails: supplierDetails?.result });
        }
    }

    render() {
        const { supplierDetails } = this?.state;
        const columns = [
            {
                name: <div className={columnHeader}>{t('S_NO')}</div>,
                selector: ((row: any) => row.id)
            },
            {
                name: <div className={columnHeader}>{t('COL_NAME')}</div>,
                selector: ((row: any) => row.supplierName)
            },
            {
                name: <div className={columnHeader}>{t('COL_CODE')}</div>,
                selector: ((row: any) => row.supplierCode)
            },
            {
                name: <div className={columnHeader}>{t('COL_ADDRESS')}</div>,
                selector: ((row: any) => row?.address)
            },
        ];

        return (
            <div style={{ padding: '5px' }}>
                <div>
                    <h4> {t('SUPPLER_CRE')} </h4>
                </div>
                <div>
                    <div>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs="auto" sm="auto" md="auto">
                            </Grid>
                            <Grid item xs="auto" sm="auto" md="auto">
                                <DefaultButton
                                    className="button"
                                    iconProps={{ iconName: 'CircleAddition' }}
                                    text={'Add Supplier'}
                                    styles={AddFam}
                                />
                            </Grid>
                        </Grid>
                    </div>
                    <div>
                        <DataTable
                            columns={columns}
                            data={supplierDetails}
                            pagination
                            selectableRowsHighlight
                            highlightOnHover
                            responsive
                            fixedHeader
                            striped
                            fixedHeaderScrollHeight="68.03vh"
                            style={{ marginBottom: '20px' }}
                            selectableRows={this.state.selectedRowData}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default SupplierOrgCreation;