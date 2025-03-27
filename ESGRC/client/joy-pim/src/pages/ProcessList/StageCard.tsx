import React from 'react';
import { Card, CardContent, Typography, Avatar, Grid } from '@mui/material';
import { t } from 'i18next';
import { useDrag } from 'react-dnd';

export const StageCard = ({
  template,
  isContainer,
  isDraggable,
}: {
  template: any;
  isContainer: boolean;
  isDraggable: boolean;
}) => {
  const { templateName, roleName, stageLevel, stageActionName } = template;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BOX',
    item: { template },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Card style={{ width: 250 }} ref={isDraggable ? drag : undefined}>
      <CardContent>
        <Grid container={isContainer} spacing={2} alignItems="flex-start" wrap="nowrap">
          <Grid item alignItems={'flex-start'}>
            <Avatar>A</Avatar>
          </Grid>
          <Grid item xs rowGap={5}>
            <Typography
              padding={'2px 0'}
              variant="body2"
              color="textSecondary"
              noWrap
              component={'p'}
              className="text-overflow"
            >
              <strong>{t('TEMPLATE_NAME')}</strong>
              <div>{templateName}</div>
            </Typography>
            <Typography padding={'2px 0'} variant="body2" color="textSecondary" component="p">
              <strong>{t('ADD_STAGE_ROLE')}</strong>
              <div>{roleName}</div>
            </Typography>
            <Typography padding={'2px 0'} variant="body2" color="textSecondary" component="p">
              <strong>{t('STAGE_LEVEL')}</strong>
              <div>{stageLevel}</div>
            </Typography>
            <Typography padding={'2px 0'} variant="body2" color="textSecondary" component="p">
              <strong>{t('STAGE_ACTION')}</strong>
              <div>{stageActionName}</div>
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StageCard;
