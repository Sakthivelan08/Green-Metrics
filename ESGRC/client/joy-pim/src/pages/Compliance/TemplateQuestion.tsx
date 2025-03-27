import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ApiManager from '@/services/ApiManager';
import { withTranslation } from 'react-i18next';
import { MetricAnswerOptions } from '@/services/ApiClient';
import { DatePicker, PrimaryButton, TextField, Stack } from '@fluentui/react';
import { Button } from '@mui/material';
import { Textarea } from '@fluentui/react-components';
import { t } from 'i18next';

interface IState {
    templateMetrics: any[];
    answers: { [key: number]: string };
}

class TemplateQuestion extends Component<any, IState> {
    apiClient = new ApiManager().CreateApiClient();

    constructor(props: any) {
        super(props);
        this.state = {
            templateMetrics: [],
            answers: {}
        };
    }

    componentDidMount(): void {
        const templateId = this.props.match.params.templateId;
        this.fetchTemplateMetrics(templateId);
    }

    fetchTemplateMetrics = (templateId: number): void => {
        this.apiClient.templateMetrics(templateId).then(res => {
            if (!res.hasError && res.result) {
                this.setState({ templateMetrics: res.result });
                this.fetchMetricAnswers();
            }
        });
    }

    fetchMetricAnswers = (): void => {
        const { templateMetrics } = this.state;
        templateMetrics.forEach(metric => {
            if (metric.metricId !== undefined) {
                this.apiClient.getMetricAnswers(metric.metricId).then((res:any) => {
                    if (!res.hasError && res.result) {
                        const answers = res.result.reduce((acc: { [key: number]: string }, answer:any) => {
                            if (answer.metricQuestionId !== undefined && answer.title !== undefined) {
                                acc[answer.metricQuestionId] = answer.title;
                            }
                            return acc;
                        }, {});

                        this.setState(prevState => ({
                            answers: {
                                ...prevState.answers,
                                ...answers
                            }
                        }));
                    }
                }).catch((error:any) => {
                    console.error('Error getting metric answers..:', error);
                });
            }
        });
    }
    handleInputChange = (metricId: number, value: string | Date | null) => {
        const stringValue = value instanceof Date ? value.toISOString() : value ?? '';
        this.setState(prevState => ({
            answers: {
                ...prevState.answers,
                [metricId]: stringValue
            }
        }));
    }

    handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const { answers, templateMetrics } = this.state;
        const metricAnswers = Object.keys(answers).map(key => {
            const metricId = parseInt(key, 10);
            const metric = templateMetrics.find(m => m.metricId === metricId);
            if (metric) {
                return {
                    metricQuestionId: metricId,
                    title: answers[metricId],
                    typeId: metric.dataType
                };
            }
            return null;
        }).filter(answer => answer !== null) as MetricAnswerOptions[];
        metricAnswers.forEach(metricAnswer => {
            this.apiClient.addOrUpdateMetricAnswer(metricAnswer).then(response => {
            }).catch(error => {
                console.error('API call error:', error);
            });
        });
    }

    render() {
        const { templateMetrics, answers } = this.state;
        return (
            <div className='Tqscroll'>
                <form onSubmit={this.handleSubmit}>
                    <Stack tokens={{ childrenGap: 15 }} className='tqul'>
                        {templateMetrics.map((metric) => (
                            <Stack.Item key={metric.metricId}>
                                <p
                                >{metric.metricsQuestion}</p>
                                {metric.dataType === 6 ? (
                                    <DatePicker
                                        className='tqalign'
                                        value={answers[metric.metricId] ? new Date(answers[metric.metricId]) : undefined}
                                        onSelectDate={(date) => this.handleInputChange(metric.metricId, date || null)}
                                    />
                                ) : metric.dataType === 5 || metric.dataType === 8 || metric.dataType === 9 || metric.dataType === 12 ? (
                                    <TextField
                                        className='tqalign'
                                        value={answers[metric.metricId] as string || ''}
                                        onChange={(e) => this.handleInputChange(metric.metricId, (e.target as HTMLInputElement).value)}
                                    />
                                ) : metric.dataType === 1 || metric.dataType === 13 ? (
                                    <Button
                                        className="tqalign"
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                    >
                                        <input
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={(e) => this.handleInputChange(metric.metricId, e.target.files?.[0]?.name || '')}
                                        />
                                        {answers[metric.metricId] || 'Upload File'}
                                    </Button>

                                ) : (
                                    <Textarea
                                        className='tqalign tqtextarea'
                                        value={answers[metric.metricId] as string || ''}
                                        onChange={(e) => this.handleInputChange(metric.metricId, e.target.value)}
                                    />
                                )}
                            </Stack.Item>
                        ))}
                    </Stack>
                    {templateMetrics.length > 0 && (
                        <div className="p-1 d-flex align-item-center justify-content-center">
                            <PrimaryButton type="submit" text={`${t('BTN_SUBMIT')}`} />
                        </div>
                    )}
                </form>
            </div>
        );
    }
}

export default withTranslation()(withRouter(TemplateQuestion));



















