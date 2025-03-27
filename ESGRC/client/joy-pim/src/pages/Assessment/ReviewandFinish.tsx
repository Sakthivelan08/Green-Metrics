import React from 'react';
import { Box, Paper, Typography, Button, Link } from '@mui/material';
import ApiManager from '@/services/ApiManager';
import NotificationManager from '@/services/NotificationManager';
import { t } from 'i18next';
import { Assessment } from '@/services/ApiClient';
import { useHistory } from 'react-router-dom';

interface ReviewandFinishProps {
    regulationNames: string[] | null;
    selectedGroup: string | null;
    selectedServiceName: string | null;
    assessmentName: string | null;
    handleEditRegulation: () => void;
    handleEditGroup: () => void;
    handleEditService: () => void;
    handleNext: () => void;
    handleBack: () => void;
    selectedRoleId: number | null;
    SelectedService: number | null;
    selectedMetricGroupIds: string[] | null;
    selectedTemplateId: number | null;
    selectedTemplateName: string | null;

}

const ReviewandFinish: React.FC<ReviewandFinishProps> = ({
    regulationNames,
    selectedGroup,
    selectedServiceName,
    assessmentName,
    handleEditRegulation,
    handleEditGroup,
    handleEditService,
    handleNext,
    handleBack,
    selectedRoleId,
    SelectedService,
    selectedMetricGroupIds,
    selectedTemplateId,
    selectedTemplateName
}) => {

    const history = useHistory();
    const notify = new NotificationManager();
    const apiClient = new ApiManager().CreateApiClient();


    const handleCreateAssessment = async () => {
        const assessmentBody = new Assessment();
        assessmentBody.roleId = selectedRoleId ?? undefined;
        assessmentBody.metricGroupId = selectedMetricGroupIds?.join(',') || '';
        assessmentBody.serviceId = SelectedService ?? undefined;
        assessmentBody.name = assessmentName || "-";
        assessmentBody.templateId = selectedTemplateId ?? undefined;
        try {
            const response = await apiClient.createAssessment(assessmentBody);
            if (response) {
                notify.showSuccessNotify(t('ADDED_SUCCESSFULLY'));
                history.push('/activity/assessment');
            }
        } catch (error) {
            notify.showErrorNotify(t('FAILED'));
        }
    };

    return (
        <Box sx={{ p: 0 }}>
            <Paper sx={{ p: 0.3 }}>
                <Typography variant="h5">{t('REVIEW_AND_REFRESH')}</Typography>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">{t('REGULATION')}</Typography>
                    <Typography variant="body1"><strong>Name:</strong></Typography>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
                        {regulationNames?.join(', ') || 'Not Selected'}
                    </Typography>
                    <Typography variant="body1"><strong>Name:</strong></Typography>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>{selectedTemplateName || 'Not Selected'}</Typography>
                    <Link component="button" variant="body2" onClick={handleEditRegulation} sx={{ mb: 2 }}>
                        {t('EDIT')}
                    </Link>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">{t('ROLE')}</Typography>
                    <Typography variant="body1"><strong>Assessment Name:</strong></Typography>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>{assessmentName || 'Not Provided'}</Typography>
                    <Typography variant="body1"><strong>Group:</strong></Typography>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>{selectedGroup || 'Not Selected'}</Typography>
                    <Link component="button" variant="body2" onClick={handleEditGroup} sx={{ mb: 2 }}>
                        {t('EDIT')}
                    </Link>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">{t('SERVICE')}</Typography>
                    <Typography variant="body1"><strong>Service:</strong></Typography>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>{selectedServiceName || 'Not Selected'}</Typography>
                    <Link component="button" variant="body2" onClick={handleEditService}>
                        {t('EDIT')}
                    </Link>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                    <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
                        {t('BTN_BACK')}
                    </Button>
                    <Button variant="contained" onClick={handleCreateAssessment} sx={{ mt: 2, ml: 1 }}>
                        {t('CREATE_ASSESSMENT')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ReviewandFinish;
