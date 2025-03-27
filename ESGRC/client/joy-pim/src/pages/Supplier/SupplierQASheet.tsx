import React, { Component } from 'react';
import ApiManager from '@/services/ApiManager';
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Typography, Card, CardContent } from '@mui/material';
import { DefaultButton } from 'office-ui-fabric-react';
import { t } from 'i18next';
import { Grid } from '@material-ui/core';
import { baseUrl } from '@/services/Constants';
import axios from 'axios';
import NotificationManager from '@/services/NotificationManager';

class SupplierQASheet extends Component<any, any> {
    apiClient = new ApiManager().CreateApiClient();

    constructor(props: any) {
        super(props);
        this.state = {
            supplierData: [],
            activeSupplierId: 1,
            supplierQADetailSet: []
        };
    }

    notify = new NotificationManager();

    async componentDidMount(): Promise<void> {
        try {
            const response = await this.apiClient.getSupplierDetails();
            if (!response?.hasError && response?.result && response?.result?.length > 0) {
                const supplierQADetailSet = await this.apiClient.getQuestionSet(response?.result[0]?.id);
                this.setState({ supplierData: response?.result, activeSupplierId: response?.result[0]?.id });
                if (!supplierQADetailSet?.hasError) {
                    this.setState({ supplierQADetailSet: supplierQADetailSet?.result });
                }
            }
        } catch (error) {
            this.notify.showErrorNotify(`${t('MSG_FET_DATA')} ${error}`);

        }
    }

    renderQuestionSet = async (supplierId: number) => {
        if (supplierId) {
            const supplierRecord = this?.state?.supplierData;
            const item = supplierRecord.find((f: any) => f?.id === supplierId);
            if (item) {
                const supplierQADetailSet = await this.apiClient.getQuestionSet(item?.id, item?.questionSetId);
                if (!supplierQADetailSet?.hasError) {
                    this.setState({ supplierQADetailSet: supplierQADetailSet?.result });
                }
            }
        }
    }

    handleChange = (e: any, value: any) => {
        if (value) {
            this.setState({ activeSupplierId: value });
            this.renderQuestionSet(value);
        }
    };

    downloadQASheet = async (questionSetId: any) => {
        const apiUrl = `${baseUrl}/api/Supplier/GetQuestionAnswerPdf?questionid=${questionSetId}`;
        const token = sessionStorage.getItem('token');
        const headers = {
            token
        };
        try {
            const response = await axios({
                method: 'GET',
                url: apiUrl,
                responseType: 'blob',
                headers: headers

            });
            if (response.status !== 200) {
                return 'error';
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'QuestionAnswer.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return 'success';
        } catch (error) {
            return 'error';
        }
    };

    render() {
        const { supplierData, supplierQADetailSet, activeSupplierId } = this.state;
        const activeSupplier = supplierData.find((item: any) => item.id === activeSupplierId);

        return (
            <div className="layout width-100">
                <div className="bg-Color">
                    <Box sx={{ width: "100%" }}>
                        <Tabs
                            value={activeSupplierId}
                            onChange={this.handleChange}
                            textColor="primary"
                            indicatorColor="primary"
                            aria-label="primary tabs example"
                        >
                            {supplierData.map((item: any) => (
                                <Tab key={item.id} value={item.id} label={item.supplierName} />
                            ))}
                        </Tabs>
                        <Grid container spacing={1} direction="row" alignItems="center" className="grid">
                            <Grid item lg={3} xs={6}>
                                {activeSupplier && (
                                    <DefaultButton
                                        className="button"
                                        style={{ marginTop: "15px", borderRadius: '10px', backgroundColor: '#7367f0', color: 'white' }}
                                        text={`${t('BTN_EXPORTEXCEL')}`}
                                        onClick={() => this.downloadQASheet(activeSupplier.questionSetId)}
                                    />
                                )}
                            </Grid>
                            <Grid item lg={7} xs={6} />
                        </Grid>
                    </Box>
                </div>
                <div className='p20' style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
                    {supplierQADetailSet.map((item: any, index: number) => (
                        <Card key={`${index}`} elevation={3} sx={{ marginBottom: 2 }}>
                            <CardContent>
                                <Typography variant="h6">
                                    {index + 1}. {item.questions}
                                </Typography>
                            </CardContent>
                            <CardContent>
                                <Typography variant="body2" color="textSecondary">
                                    answer: {item.answer}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
}

export default SupplierQASheet;
