import React, { Component, RefObject } from "react";
import { ElementFactory, Question, Serializer } from "survey-core";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    ReactQuestionFactory,
    SurveyQuestionElementBase
} from "survey-react-ui";

const CUSTOM_TYPE = "quill";

// Create a question model
export class QuestionQuillModel extends Question {
    getType() {
        return CUSTOM_TYPE;
    }
    get height() {
        return this.getPropertyValue("height");
    }
    set height(val) {
        this.setPropertyValue("height", val);
    }
}

// Create a class that renders Quill
export class SurveyQuestionQuill extends SurveyQuestionElementBase {
    quillEditorContainerRef: RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.quillEditorContainerRef = React.createRef<HTMLDivElement>();
    }

    get question() {
        return this.questionBase;
    }
    get value() {
        return this.question.value;
    }
    handleValueChange = (val: any) => {
        this.question.value = val;
    };
    // Support the read-only and design modes
    get style() {
        return { height: this.question.height };
    }

    componentDidMount() {
        const targetNode = this.quillEditorContainerRef.current;
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    console.log('A child node has been added or removed.');
                }
            }
        });

        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        }

        // Clean up observer on component unmount
        this.componentWillUnmount = () => {
            observer.disconnect();
        };
    }

    renderQuill() {
        const isReadOnly = this.question.isReadOnly || this.question.isDesignMode;
        return (
            <div ref={this.quillEditorContainerRef}>
                <ReactQuill
                    readOnly={isReadOnly}
                    value={this.value}
                    onChange={this.handleValueChange}
                />
            </div>
        );
    }

    renderElement() {
        return <div style={this.style}>{this.renderQuill()}</div>;
    }
}

export class RegisterQuillComponent extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {}
    }
    componentDidMount(): void {
        // Register the model in `ElementFactory`
        ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
            return new QuestionQuillModel(name);
        });

        // Add question type metadata for further serialization into JSON
        Serializer.addClass(
            CUSTOM_TYPE,
            [{ name: "height", default: "200px", category: "layout" }],
            function () {
                return new QuestionQuillModel("");
            },
            "question"
        );
        // Register `SurveyQuestionQuill` as a class that renders `quill` questions
        ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
            return React.createElement(SurveyQuestionQuill, props);
        });
    }
}
