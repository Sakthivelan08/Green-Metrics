import SurveyForm from '@/components/SurveyJS/SurveyForm';
import ApiManager from '@/services/ApiManager';
import React, { Component } from 'react';
import { metricDataType, metricValidationEnum, RoleEnum } from '../enumCommon';
import NotificationManager from '@/services/NotificationManager';
import { MetricAnswerOptionDto } from '@/services/ApiClient';
import { baseUrl } from '@/services/Constants';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface Props {
  // template: any | null;
  isReadOnly: any | undefined;
  templateId: any | undefined;
  process: any | undefined;
  roleId: any | undefined;
  disabled: boolean | undefined;
  selectedStage: any | undefined;
  onSubmitComplete: () => void;
}

class MetricSurveyForm extends Component<Props, any> {
  apiClient = new ApiManager().CreateApiClient();
  notificationManager = new NotificationManager();
  constructor(props: Props) {
    super(props);
    this.state = {
      templateId: props?.templateId,
      processId: props?.process,
      templateAttributeData: [],
      isReadOnly: props?.isReadOnly,
      roleId: props?.roleId,

      surveyJson: {
        elements: [],
        completeText: 'Submit',
        description: "click 'esc' to close Questionnaries",
        completedHtml: 'Thank you for your response!',
        showPreviewBeforeComplete: 'showAnsweredQuestions',
        showCompletedPage: false,
      },
      canRenderSurveyForm: false,
      answers: [],
    };
  }

  componentDidMount = async () => {
    if (!this.props?.isReadOnly) {
      await this.getFormData();
    } else {
      await this.fetchMetricAnswers();
    }
  };

  getFormData = async () => {
    try {
      const response = await this.apiClient.templateMetrics(this.state?.templateId);
      if (!response?.hasError && response?.result) {
        const surveyJsonElements: any = [];
        let metricGroupId: number | undefined;

        response?.result?.forEach((item: any) => {
          const element: any = this.getObjectBasedOnType(item);
          if (element && Object.keys(element)?.length > 0) {
            surveyJsonElements.push(element);
          }
          if (item.metricGroupId) {
            metricGroupId = item.metricGroupId;
          }
        });

        let surveyJsonData = this.state.surveyJson;
        surveyJsonData['elements'] = surveyJsonElements;
        surveyJsonData['title'] = this.props.templateId?.text;
        this.setState(
          {
            templateAttributeData: response?.result,
            surveyJson: surveyJsonData,
            metricGroupId: metricGroupId,
          },
          this.fetchMetricAnswers,
        );
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  fetchMetricAnswers = async (): Promise<void> => {
    const { templateId, processId } = this.state;
    if (templateId && processId) {
      try {
        const response = await this.apiClient.getMetricAnswer(
          templateId,
          this?.props?.selectedStage?.auditId,
        );
        console.log('api response', response);
        const firstResponse = response.result?.[0];
        const firstResponseJson = firstResponse?.responseJson;
        const responseId = firstResponse?.id;

        if (firstResponseJson) {
          console.log('Response JSON:', firstResponseJson);
          const answers = Object.entries(firstResponseJson)
            .filter(([key, value]) => value !== '')
            .map(([key, value]) => ({ key, value }));
          this.setState({ answers, responseId }, this.prefillSurveyJsonWithAnswers);
        } else {
          this.setState({ canRenderSurveyForm: true });
          console.error('No valid responseJson found.');
        }
      } catch (error) {
        console.error('Error fetching metric answers:', error);
      }
    } else {
      this.setState({ canRenderSurveyForm: true });
    }
  };

  prefillSurveyJsonWithAnswers = () => {
    const { answers, surveyJson } = this.state;

    if (answers && surveyJson.elements) {
      surveyJson.elements.forEach((element: any) => {
        const answer = answers.find((ans: { key: string }) => ans.key === element.title);
        if (answer) {
          element.defaultValue = answer.value;
          element.formValue = answer.value;
        }
      });

      console.log(surveyJson.elements);
      this.setState({ surveyJson, canRenderSurveyForm: true });
    } else {
      console.error('No answers or survey elements found.');
    }
  };

  getObjectBasedOnType = (item: any): any => {
    if (item?.dataType) {
      let validationIds = item['validationId'];
      let modifiedVIds = [];
      if (validationIds && validationIds?.length > 0 && typeof validationIds === 'string') {
        validationIds = validationIds.split(',');
        modifiedVIds = validationIds.map((e: any) => {
          return parseInt(e);
        });
      }
      switch (item.dataType) {
        case metricDataType.TextField:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'text';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.NumberField:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['inputType'] = 'number';
          item['type'] = 'text';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.Email:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['inputType'] = 'email';
          item['type'] = 'text';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.File:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'file';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.Image:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'file';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.Boolean:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'boolean';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.DateTime:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'text';
          item['inputType'] = 'datetime-local';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.Percentage:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'text';
          item['inputType'] = 'number';
          item['min'] = 0;
          item['max'] = 100;
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.TextArea:
        case metricDataType.Paragraph:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'comment';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.TextArea:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'text';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.RadioButton:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'radiogroup';
          item['choices'] = this.getChoices(item['optionSet']);
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.SimpleSelect:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'dropdown';
          item['choices'] = this.getChoices(item['optionSet']);
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.MultiSelect:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'tagbox';
          item['choices'] = this.getChoices(item['optionSet']);
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.CheckBox:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'checkbox';
          item['choices'] = this.getChoices(item['optionSet']);
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.Price:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'text';
          item['maskType'] = 'currency';
          item['maskSettings'] = {
            prefix: '₹',
          };
          item['choices'] = this.getChoices(item['optionSet']);
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
        case metricDataType.Quill:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'quill';
          item['defaultValue'] =
            '<p> <em>Entered Your Answer</em></p> <p><strong>Entered Your Answer</strong></p> ';
          return item;
        default:
          item['title'] = item['name'];
          item['name'] = `form_${item?.metricId}`;
          item['type'] = 'text';
          item['isRequired'] = modifiedVIds.includes(metricValidationEnum.required);
          return item;
      }
    } else {
      item['title'] = item['title'];
      item['value'] = item['value'];
      item['name'] = item['name'];
      item['defaultValue'] = item['value'];
      item['type'] = 'text';
      item['isRequired'] = true;
      return item;
    }
  };

  getChoices = (choices: any) => {
    try {
      return JSON.parse(choices);
    } catch (error) {
      return [];
    }
  };

  savePdf = async (_data: any) => {
    const apiUrl = `${baseUrl}/api/Metric/GetQuestionAnswerPdf?assessmentId=${this.state.templateId}&processId=${this.state.processId}`;
    const token = sessionStorage.getItem('token');
    const headers = { token };

    try {
      const response = await axios({
        method: 'POST',
        url: apiUrl,
        responseType: 'blob',
        headers: headers,
      });

      if (response.status !== 200) {
        return 'error';
      }

      const existingPdfBytes = await response.data.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const headerText = 'ANNUAL REPORT |2023-2024|';
        const footerText = `Page ${index + 1}`;
        const headerFontSize = 12;
        const footerFontSize = 10;
        const headerHeight = 30;
        const footerHeight = 30;

        const oliveGreen = rgb(85 / 255, 107 / 255, 47 / 255);

        page.drawRectangle({
          x: 0,
          y: height - headerHeight,
          width,
          height: headerHeight,
          color: oliveGreen,
        });

        const headerTextWidth = boldFont.widthOfTextAtSize(headerText, headerFontSize);
        page.drawText(headerText, {
          x: width - headerTextWidth - 20,
          y: height - headerHeight + headerHeight / 2 - headerFontSize / 2,
          size: headerFontSize,
          color: rgb(1, 1, 1),
          font: boldFont,
        });

        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height: footerHeight,
          color: oliveGreen,
        });

        const footerTextWidth = font.widthOfTextAtSize(footerText, footerFontSize);
        page.drawText(footerText, {
          x: (width - footerTextWidth) / 2,
          y: footerHeight / 2 - footerFontSize / 2,
          size: footerFontSize,
          color: rgb(1, 1, 1),
          font: font,
        });
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'QuestionAnswer.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return 'success';
    } catch (error) {
      console.error('Error generating PDF:', error);
      return 'error';
    }
  };

  onComplete = async (_data: any) => {
    console.log(_data);
    const response = _data?.data?.response;
    const surveyJson = _data?.data?.surveyJson?.pages;
    const auditId = this?.props?.selectedStage?.auditId || 0;
    if (response && surveyJson && this.state.templateId) {
      try {
        const body = new MetricAnswerOptionDto();
        body.templateId = this.state.templateId;
        body.processId = this.state.processId;
        body.auditId = auditId;

        body.responseJson = this.resposeMapping(surveyJson);
        if (this.state.responseId) {
          body.id = this.state.responseId;
        }
        const res = await this.apiClient.addOrUpdateMetricAnswer(body);
        if (!res.hasError) {
          if (!this.state.responseId && res.result?.id) {
            this.setState({ responseId: res.result.id });
          }
          this.notificationManager.showSuccessNotify1('Submitted Successfully');
          this.props.onSubmitComplete();
        }
      } catch (error) {
        console.error('Error submitting metric answer:', error);
      }
    }
  };

  resposeMapping(elements: any[]) {
    console.log(elements);
    const filterData = elements.flatMap((data) =>
      // @ts-ignore
      data.elements.map(({ title, name, formValue }) => ({ title, name, formValue })),
    );
    const dictionary = filterData.reduce((acc: any, current: any) => {
      acc[current.title] = current.formValue.toString();
      return acc;
    }, {});

    return dictionary;
  }

  render() {
    const { surveyJson, canRenderSurveyForm } = this.state;
    return (
      <div className="w-40">
        {(surveyJson?.elements?.length > 0 || surveyJson?.pages?.length > 0) &&
          canRenderSurveyForm === true && (
            <SurveyForm
              surveyJson={surveyJson}
              isReadOnly={this.state.roleId === RoleEnum.Approver || this.props.disabled? true : this?.props?.isReadOnly}
              onComplete={(data: any) => this.onComplete(data)}
              savePdf={this.savePdf}
            />
          )}
      </div>
    );
  }
}

export default MetricSurveyForm;