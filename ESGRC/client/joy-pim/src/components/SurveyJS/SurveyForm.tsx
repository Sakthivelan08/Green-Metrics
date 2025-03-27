import React, { Component } from 'react';
import 'survey-core/defaultV2.min.css';
import { ElementFactory, Model, Serializer } from 'survey-core';
import { ReactQuestionFactory, Survey } from 'survey-react-ui';
import { defaultTheme } from './SurveyThemes';
import { metricDataType } from '@/pages/enumCommon';
import { baseUrl } from '@/services/Constants';
import axios from 'axios';
import { QuestionQuillModel, SurveyQuestionQuill } from './QuillComponent';

/*isReadOnly -> type of view
survey.mode = "edit"; //edit mode
survey.mode = "display";// read only mode
*/

const CUSTOM_TYPE = 'quill';
const QUESTIONS_PER_PAGE = 4;
class SurveyForm extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      survey: {},
      canRender: false,
    };
  }

  componentDidMount(): void {
    // Register the model in `ElementFactory`
    ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
      return new QuestionQuillModel(name);
    });

    // Add question type metadata for further serialization into JSON
    Serializer.addClass(
      CUSTOM_TYPE,
      [{ name: 'height', default: '200px', category: 'layout' }],
      function () {
        return new QuestionQuillModel('');
      },
      'question',
    );
    // Register `SurveyQuestionQuill` as a class that renders `quill` questions
    ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
      return React.createElement(SurveyQuestionQuill, props);
    });
    this.renderForm();
  }

  paginateQuestions = (surveyJson: any) => {
    if (!surveyJson.pages || surveyJson.pages.length === 0) {
      const elements = surveyJson.elements || [];
      const pages = [];
      for (let i = 0; i < elements.length; i += QUESTIONS_PER_PAGE) {
        pages.push({
          elements: elements.slice(i, i + QUESTIONS_PER_PAGE),
        });
      }

      surveyJson.pages = pages;
      delete surveyJson.elements;
    }

    return surveyJson;
  };

  renderForm = () => {
    //const survey: any = new Model(this.props.surveyJson)
    let paginatedSurveyJson = this.paginateQuestions(this.props.surveyJson);
    const survey: any = new Model(paginatedSurveyJson);
    survey.onComplete.add((sender: any, options: any) => {
      this.onComplete(sender, options);
    });
    survey.onCompleting.add((sender: any, options: any) => {
      this.onComplete(sender, options);
      options.allow = false;
    });
    survey.addNavigationItem({
      id: 'pdf-export',
      title: 'Save as PDF',
      action: () => {
        const surveyData = survey.data;
        const surveyElements = survey.jsonObj?.elements || [];
        this.props.savePdf({ data: surveyData, elements: surveyElements });
      },
    });

    survey.applyTheme(defaultTheme);

    if (this.props?.isReadOnly) {
      survey.mode = 'display'; // read only mode
    } else {
      survey.mode = 'edit'; //edit mode
    }

    this.setState({ survey: survey, canRender: true });
  };

  onComplete = (sender: any, options: any) => {
    // console.log(JSON.stringify(sender.data, null, 3));
    let jsonObj: any = '';
    // if (sender?.jsonObj) {
    //     jsonObj = sender?.jsonObj;
    //     if (jsonObj.elements?.length > 0) {
    //         jsonObj.elements = jsonObj?.elements?.map((e: any) => {
    //             const value: any = sender?.data[e?.name];
    //             if (value) {
    //                 e["formValue"] = value;
    //             } else {
    //                 e["formValue"] = '';
    //             }
    //             return e;
    //         });
    //     }
    // } else {
    //     let jData: any = [];
    //     if (sender?.runningPages && sender?.runningPages?.length > 0) {
    //         sender.runningPages.forEach((page: any, index: number) => { jData.push({ page: `page ${index + 1}`, jsonObj: page?.jsonObj }) });
    //     }
    //     jData = jData.map((item: any) => {
    //         if (item.jsonObj.elements?.length > 0) {
    //             item.jsonObj.elements = item?.jsonObj?.elements?.map((e: any) => {
    //                 const value: any = sender?.data[e?.name];
    //                 if (value) {
    //                     e["formValue"] = value;
    //                 } else {
    //                     e["formValue"] = '';
    //                 }
    //                 return e;
    //             });
    //         }
    //         return item;
    //     })
    //     jsonObj = jData;
    // }
    const surveyJson = this.props.surveyJson;
    const survey = this.state.survey;
    let response: any = {};
    // if (surveyJson?.pages?.length > 0) {
    //     surveyJson.pages = surveyJson.pages.map((item: any) => {
    //         if (item?.elements && item?.elements?.length > 0) {
    //             item.elements = item?.elements.map((element: any) => {
    //                 if (element["name"]) {
    //                     const formValue = survey.getQuestionByName(element["name"]).value;
    //                     response[element["name"]] = formValue || " ";
    //                     element["formValue"] = formValue || " ";
    //                 } else {
    //                     element["formValue"] = " ";
    //                 }
    //                 return element;
    //             });
    //         }
    //         return item;
    //     });
    // } else if (surveyJson?.elements?.length > 0) {
    //     surveyJson.elements = surveyJson?.elements.map((element: any) => {
    //         if (element["name"]) {
    //             const formValue = survey.getQuestionByName(element["name"]).value;
    //             response[element["name"]] = formValue || " ";
    //             element["formValue"] = formValue || " ";
    //         } else {
    //             element["formValue"] = " ";
    //         }
    //         return element;
    //     });
    // }
    if (surveyJson?.pages?.length > 0) {
      surveyJson.pages = surveyJson.pages.map((item: any) => {
        if (item?.elements && item?.elements?.length > 0) {
          item.elements = item?.elements.map((element: any) => {
            if (element['name']) {
              const formValue = survey.getQuestionByName(element['name']).value;
              response[element['name']] = formValue || ' ';
              element['formValue'] = formValue || ' ';
            } else {
              element['formValue'] = ' ';
            }
            return element;
          });
        }
        return item;
      });
    } else if (surveyJson?.elements?.length > 0) {
      surveyJson.elements = surveyJson.elements.map((element: any) => {
        if (element['name']) {
          const formValue = survey.getQuestionByName(element['name']).value;
          response[element['name']] = formValue || ' ';
          element['formValue'] = formValue || ' ';
        } else {
          element['formValue'] = ' ';
        }
        return element;
      });
    }

    this.props.onComplete({
      data: { response: Object.keys(response)?.length > 0 ? response : sender?.data, surveyJson },
    });
  };

  render() {
    const { survey, canRender } = this.state;
    return <div>{canRender && <Survey model={survey} />}</div>;
  }
}

export default SurveyForm;
