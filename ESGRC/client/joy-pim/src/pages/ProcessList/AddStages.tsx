import { Assessment, Role, StageAction, Template, TemplateStages } from '@/services/ApiClient';
import ApiManager from '@/services/ApiManager';
import { DefaultButton, Dropdown, FontIcon, Label, SearchBox, TextField } from '@fluentui/react';
import { Button, Divider, Grid, Switch, Typography } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDrop } from 'react-dnd';
import NotificationManager from '@/services/NotificationManager';
import StageCard from './StageCard';
import { Link } from 'react-router-dom';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { AddFams, PIMHearderText } from '../PimStyles';

function AddNewStages(props: any) {
  const apiClient = new ApiManager().CreateApiClient();
  const notify = new NotificationManager();
  const [auditid, setAuditid] = useState<number | undefined>();
  const [approveid, setApproveid] = useState<number | undefined>();
  const [roleOption, setRoleOption] = useState<any[]>([]);
  const [Isrefresh, setIsrefresh] = useState(0);
  const [Isstage, setIsstage] = useState(0);
  const [stageActionOptions, setStageActionOptions] = useState<any[]>([]);
  const [assessmentOption, setAssessmentOption] = useState<any[]>([]);
  const [TemplateRecords, setTemplateRecords] = useState<any[]>([]);
  const [copyRecord, setCopyRecord] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [templateStagesRecord, setTemplateStagesRecord] = useState<any[]>([]);
  const [allUpdated, setAllUpdated] = useState(false);
  const [process, setProcess] = useState<any>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const processId = parseInt(searchParams.get('id') || '0', 10);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid = false },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<any>({
    mode: 'onChange',
    defaultValues: {},
  });

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BOX',
    drop: (item: any) => addStageToProcess(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    getMasters();
  }, []);

  useEffect(() => {
    if (allUpdated) {
      mapTemplateStages();
      mapTemplateRecords();
    }
    resetForm();
  }, [allUpdated]);

  useEffect(() => {
    if (processId) {
      getProcessById(processId);
    }
  }, [processId]);

  const getProcessById = (id: any): void => {
    apiClient.getProcessById(id).then((res) => setProcess(res.result));
  };

  const getMasters = (list: number[] = [1, 2, 3, 4, 5]) => {
    const search = new URLSearchParams(window.location.search);

    const fetchFunctions = list.map(async (e) => {
      switch (e) {
        case 1:
          return { e, res: await apiClient.getRoles(true) };
        case 2:
          return { e, res: await apiClient.getStageActions() };
        case 3:
          return { e, res: await apiClient.getAllActiveTemplate() };
        case 4: {
          const processId = parseInt(search.get('id') || '0', 10);
          return { e, res: await apiClient.getProcessStages(processId) };
        }
        case 5:
          return { e, res: await apiClient.getAllTemplateStages() };
        default:
          return null;
      }
    });

    Promise.all(fetchFunctions)
      .then((results) => {
        results.forEach(async (result) => {
          if (result && !result.res.hasError) {
            const { e, res } = result;
            if (res.result) {
              switch (e) {
                case 1:
                  setRoleOption(
                    res.result.map((role: Role) => ({ ...role, key: role.id, text: role.name })),
                  );
                  break;
                case 2:
                  setStageActionOptions(
                    res.result.map((action: StageAction) => ({
                      ...action,
                      key: action.id,
                      text: action.name,
                    })),
                  );
                  break;
                case 3:
                  setAssessmentOption(
                    res.result.map((template: Template) => ({
                      ...template,
                      key: template.id,
                      text: template.name,
                    })),
                  );
                  break;
                case 4: {
                  const updatedDatas = res.result.map((element: any, index: number) => ({
                    ...element,
                    stageAction: element.actionId,
                    stageLevel: index + 1,
                  }));
                  const data = updatedDatas.sort((a, b) => a.id - b.id);
                  setTemplateRecords(data);
                  setCopyRecord(data);
                  setAuditid(res?.result[0]?.auditroleid);
                  setApproveid(res?.result[0]?.approverId);
                  break;
                }
                case 5:
                  setTemplateStagesRecord(res?.result);
                  break;
                default:
                  break;
              }
            }
          }
        });
        setAllUpdated(true);
      })
      .catch((error) => {
        console.error('Error in fetching masters:', error);
      });
  };

  const mapTemplateStages = () => {
    if (assessmentOption.length > 0 && templateStagesRecord.length > 0) {
      const response = templateStagesRecord.map((element) => {
        return {
          ...element,
          templateName: assessmentOption.find((e) => e.id === element.templateId)?.name,
          roleName: roleOption.find((e) => e.id === element.roleId)?.name,
          stageActionName: stageActionOptions.find((e) => e.id === element.actionId)?.name,
        };
      });
      setTemplateStagesRecord(response);
    }
  };

  const mapTemplateRecords = () => {
    if (assessmentOption.length > 0 && TemplateRecords.length > 0) {
      const response = TemplateRecords.map((element) => {
        return {
          ...element,
          assessmentName: assessmentOption.find((e) => e.id === element.templateId)?.name,
          roleName: roleOption.find((e) => e.id === element.roleId)?.name,
          stageActionName: stageActionOptions.find((e) => e.id === element.actionId)?.name,
        };
      });
      setTemplateRecords(response);
    }
  };

  const resetForm = () => {
    if (TemplateRecords.length > 0) {
      const { qcId, approverId } = TemplateRecords[0];
      if (qcId || approverId) {
        reset({
          addQc: qcId ? true : false,
          addApprover: approverId ? true : false,
          qcId: qcId,
          approverId: approverId,
        });
        setIsrefresh(Isrefresh + 1);
        setIsstage(Isstage + 1);
        setValue('templateId', null);
        setValue('slaid', undefined);
        setValue('slaid1', undefined);
        setValue('actionId', undefined);
        setValue('roleId', undefined);
        setValue('approverId', undefined);
      } else {
        reset();
      }
    }
    setAllUpdated(false);
  };

  const addStageToProcess = (stage: any) => {
    const body = new TemplateStages(stage?.template);
    const data = getValues('slaid1');
    if (data == undefined) {
      body.approverId = body?.approverId;
      body.auditroleid = body?.auditroleid;
    } else {
      body.auditroleid = data;
      body.approverId = getValues('slaid');
    }
    body.id = undefined;
    addTemplateStagging(body);
  };

  const onSubmit = (data: any) => {
    const body = new TemplateStages(data);
    body.auditroleid = auditid !== undefined ? auditid : data.slaid1;
    body.approverId = approveid !== undefined ? approveid : data.slaid;
    addTemplateStagging(body);
  };

  const addTemplateStagging = (body: any) => {
    const url: any = new URLSearchParams(props.history.location.search);
    const auditid1 = auditid != undefined ? auditid : body.auditroleid;
    const approveid1 = approveid != undefined ? approveid : body.approverId;
    body.auditroleid = auditid1;
    body.approverId = approveid1;
    body.processId = parseInt(url.get('id'), 10);
    body.stageLevel = TemplateRecords.length + 1;
    apiClient.addTemplateStages([body]).then((res) => {
      if (!res.hasError) {
        notify.showSuccessNotify(`${t('ADDED_SUCCESSFULY')}`);
        getMasters([4]);
      }
    });
  };

  const TemplateOptionFilter = (): any[] => {
    const selectedTemplateId = TemplateRecords.map((e) => e.templateId);
    return assessmentOption.filter((e) => !selectedTemplateId.includes(e.id));
  };

  const templateRoleOption = () => {
    if (watch('actionId') === 4) {
      return activeUsers;
    }
    const selectedRoles = TemplateRecords.map((e) => e.roleId);
    return roleOption.filter((e) => !selectedRoles.includes(e.id));
  };

  return (
    <div className="h-90 w-100 p-1 overflow-y-scrollWhidden stagetab">
      <Link to={`/metrics/process`} className="headerText">
        {t('MENU_METRICS')}/{t('SUBMENU_PROCESS')}/{t('ADD_STAGES')}
      </Link>
      <Text
        className="color-blue text"
        key={'xxLarge'}
        variant={'xxLarge' as ITextProps['variant']}
        styles={PIMHearderText}
        nowrap
        block
      >
        {t('ADD_STAGES')}
      </Text>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid item display={'flex'} gap={1} alignItems={'end'}>
          <Grid item xs={6}>
            <div className="d-flex align-item-center justify-content-between">
              <Label>{t('ADD_STAGE_PROCESSNAME')}</Label>
              <TextField
                placeholder={`${t('PLHOLDER_PROCESS_NAME')}`}
                value={process?.name || ''}
                disabled={true}
              />
            </div>
          </Grid>
        </Grid>
        <Grid
          item
          display="flex"
          gap={2}
          alignItems="flex-end"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          {/* <Grid item xs={6} flex="1">
            <div className="d-flex align-item-center justify-content-between">
              <Label className="question-label" style={{ marginRight: '237px' }}>
                {t('ADD_APPROVER_FOR_PROCESS')}
              </Label>
              <Controller
                name="addApprover"
                control={control}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value || TemplateRecords.length !== 0}
                    disabled={TemplateRecords.length > 0}
                  />
                )}
              />
            </div>
          </Grid> */}
          {/* <Grid item xs={6} flex="1">
            <div>
              <Label className="label-font-color font-weight-550">{`${t('APPROVER_TYPE')}`}</Label>
              <Controller
                name="slaid"
                control={control}
                rules={
                  !TemplateRecords.length &&
                  watch('addApprover') && { required: `${t('APPROVER_REQUIRED')}` }
                }
                render={({ field }) => (
                  <Dropdown
                    className="stagedrops"
                    {...field}
                    placeholder="Select an option"
                    disabled={!watch('addApprover') || TemplateRecords.length > 0}
                    selectedKey={approveid != undefined ? approveid : field.value}
                    key={Isrefresh}
                    options={roleOption}
                    onChange={(_event, option) => field.onChange(option?.key)}
                    errorMessage={errors.slaid && errors.slaid?.message?.toString()}
                  />
                )}
              />
            </div>
          </Grid> */}
        </Grid>
        <Grid
          item
          display="flex"
          gap={2}
          alignItems="flex-end"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Grid item xs={6} flex="1">
            <div className="d-flex align-item-center justify-content-between">
              <Label className="question-label" style={{ marginRight: '250px' }}>
                {t('ADD_AUDITOR_FOR_PROCESS')}
              </Label>
              <Controller
                name="addQc"
                control={control}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value || TemplateRecords.length > 0}
                    disabled={TemplateRecords.length > 0}
                  />
                )}
              />
            </div>
          </Grid>
          <Grid item xs={6} flex="1">
            <div>
              <Label className="label-font-color font-weight-550">{`${t('AUDITOR_TYPE')}`}</Label>
              <Controller
                name="slaid1"
                control={control}
                rules={watch('addQc') && { required: `${t('AUDITOR_REQUIRED')}` }}
                render={({ field }) => (
                  <Dropdown
                    className="stagedrops"
                    {...field}
                    placeholder="Select an option"
                    disabled={!watch('addQc')}
                    selectedKey={auditid != undefined ? auditid : field.value}
                    key={Isrefresh}
                    options={roleOption}
                    onChange={(_event, option) => field.onChange(option?.key)}
                    errorMessage={errors.slaid1 && errors.slaid1?.message?.toString()}
                  />
                )}
              />
            </div>
          </Grid>
        </Grid>
        <br />
        <Grid item xs={6}>
          <Divider />
        </Grid>
        <Grid item xs={6}>
          <div className="stagedrop">
            <Label className="label-font-color font-weight-550">{`${t('TEMPLATE_NAME')}`}</Label>
            <Controller
              name="templateId"
              control={control}
              rules={{ required: `${t('TEMPLATE_REQUIRED')}` }}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  placeholder="Select an option"
                  selectedKey={field.value}
                  options={TemplateOptionFilter()}
                  onChange={(_event, option) => field.onChange(option?.key)}
                  errorMessage={errors.templateId && errors.templateId?.message?.toString()}
                />
              )}
            />
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className="stagedrop">
            <Label className="label-font-color font-weight-550">{`${t('ADD_STAGE_ROLE')}`}</Label>
            <Controller
              name="roleId"
              control={control}
              rules={{ required: `${t('ROLE_REQUIRED')}` }}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  placeholder="Select an option"
                  selectedKey={field.value}
                  options={templateRoleOption()}
                  onChange={(_event, option) => field.onChange(option?.key)}
                  errorMessage={errors.roleId && errors.roleId?.message?.toString()}
                />
              )}
            />
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className="stagedrop">
            <Label className="label-font-color font-weight-550">{`${t('STAGE_ACTION')}`}</Label>
            <Controller
              name="actionId"
              control={control}
              rules={{ required: `${t('ACTION_REQUIRED')}` }}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  placeholder="Select an option"
                  key={Isstage}
                  selectedKey={field.value}
                  options={stageActionOptions}
                  onChange={(_event, option) => {
                    field.onChange(option?.key);
                  }}
                  errorMessage={errors.actionId && errors.actionId?.message?.toString()}
                />
              )}
            />
          </div>
        </Grid>
        <br />
        <Grid item xs={10}>
          <DefaultButton styles={AddFams} type="submit" text={`${t('ADD_STAGE')}`} />
        </Grid>
      </form>
      <br />
      <Divider />
      <div>
        <div className="d-flex align-item-center justify-content-between p-1">
          <Label className="header">{t('STAGE_DEPOSITORY')}</Label>
        </div>
        <div
          className="d-flex"
          style={{
            marginTop: '0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          <Grid container spacing={1} xs={9} className="h-85 overflow-y-scrollWhidden">
            {templateStagesRecord.map((template, index) => (
              <Grid item xs={4} key={index}>
                <StageCard template={template} isContainer={true} isDraggable={true} />
              </Grid>
            ))}
          </Grid>
          <Grid
            padding={1}
            paddingTop={0}
            paddingLeft={'3.5px'}
            xs={3}
            ref={drop}
            className="stage-list w-20"
          >
            <Typography variant="h5" padding={'6px 0px'}>
              {/* {t('PROCESS')} */}
              {process?.name || ''}
            </Typography>
            {TemplateRecords.map((template, index) => (
              <Grid item xs={3} key={index} paddingBottom={'10px'}>
                <StageCard template={template} isContainer={true} isDraggable={false} />
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default AddNewStages;