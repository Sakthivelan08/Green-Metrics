import React, { Component } from "react";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import { OrganizationChart } from 'primereact/organizationchart';
import { staticDataWithPic } from './DataSet';
import { cardStyles } from './CardStyles';
import ApiManager from "@/services/ApiManager";

class Chart extends Component<any, any> {
    apiClient = new ApiManager().CreateApiClient();
    constructor(props: any) {
        super(props);
        this.state = {
            chartView: "staticdata",
            hierarchyData: []
        }
    }

    componentDidMount = async (): Promise<void> => {
        const parentChartData = await this.apiClient.getParentChartDetails();
        if (!parentChartData?.hasError && parentChartData?.result && parentChartData?.result?.length > 0) {
            const parentL1Data = parentChartData?.result.find((f: any) => f?.parentcode == null);
            const l1ChildData = parentChartData?.result.filter((f: any) => f?.parentcode === parentL1Data?.code);
            const parentTreeSet: any = [{ code: parentL1Data?.code, isParent: true, className: cardStyles.cardSelection, label: parentL1Data?.name, expanded: true, children: [] }];
            const children: any = [];
            l1ChildData.forEach((item: any) => {
                children.push({ code: item?.code, label: item?.name, expanded: true, children: [] });
            });
            parentTreeSet[0].children = children;
            this.setState({ hierarchyData: parentTreeSet });
        }
    }

    nodeTemplate = (node: any) => {
        console.log(node);
        return (
            <div >
                <img
                    alt={node.label}
                    src={node.src}
                    className={cardStyles.imgStyle}
                />
                <div className="mt-3 font-medium text-lg">{node.label}</div>
            </div>
        );
    };

    getAndConstructData = async (code: any) => {
        const response = await this.apiClient.getChildNodeDetails(code);
        const childNodeSet: any = [];
        let childDataSet: any = [];
        if (response && !response?.hasError && response?.result && response?.result?.length > 0) {
            const data = response?.result;
            const filteredChildData = data.filter((f:any) => f?.code != code);
            const levelSet = Array.from(new Set(filteredChildData.map((e:any) => e.level)));
            let levelSetData: any = [];
            levelSet.forEach((level: any) => {
                let parentTreeCode: any = [];
                let lvlFilteredData = filteredChildData.filter((lvlData: any) => lvlData?.level === level);
                lvlFilteredData = lvlFilteredData.map((e:any) => { return { ...e, pnArray: e?.pathnames?.split('->'), treeArray: e?.tree?.split('->') } });
                lvlFilteredData = lvlFilteredData.map((trArr: any) => {
                    return { ...trArr, nodeName: trArr?.pnArray[trArr?.pnArray?.length - 1], parentTreeCode: parseInt(trArr?.treeArray[trArr?.treeArray?.length - 2]) }
                });
                levelSetData.push({ level, parentTreeCode, data: lvlFilteredData });
            });
            const reversedLvlSet = levelSet.toSorted((a: any, b: any) => b - a);
            const filteredTopLevelSet: any = levelSetData.find((f: any) => f?.level === reversedLvlSet[0]);
            filteredTopLevelSet?.data?.forEach((element: any) => {
                childDataSet.push({ code: element?.code, parentTreeCode: element?.parentTreeCode, label: element?.nodeName, expanded: true, children: [] });
            });
            reversedLvlSet.forEach((level: any, index: number) => {
                if (index > 0) {
                    const tempChildSet: any = [];
                    const filteredMidLevelSet: any = levelSetData.find((f: any) => f?.level === level);
                    filteredMidLevelSet?.data?.forEach((element: any) => {
                        const dataSet: any = [];
                        const filteredSubData: any = childDataSet.filter((f: any) => f?.parentTreeCode === element?.code);
                        if (filteredSubData) {
                            tempChildSet.push({ code: element?.code, parentTreeCode: element?.parentTreeCode, label: element?.nodeName, expanded: true, children: filteredSubData });
                        } else {
                            tempChildSet.push({ code: element?.code, parentTreeCode: element?.parentTreeCode, label: element?.nodeName, expanded: true, children: [] });
                        }

                    });
                    childDataSet = tempChildSet;
                }
            });
            console.log(childDataSet);
        }
        return childDataSet;
    }

    handleUpdate = (nodes: any, code: any, dataToAdd: any) => {
        return nodes?.map((node: any) => {
            if (node?.code === code) {
                return { ...node, children: dataToAdd };
            }
            else if (node?.children) {
                node.children = this.handleUpdate(node?.children, code, dataToAdd);
            }
            return node;
        });
    }

    onSelectionChange = async (e: any): Promise<void> => {
        if (e?.node && e.node?.code && !e?.node?.isParent && (!e?.node?.children || e?.node?.children?.length === 0)) {
            const response = await this.getAndConstructData(e.node?.code);
            this.setState((prevState:any) => {
                let hierarchyData = prevState?.hierarchyData;
                hierarchyData = this.handleUpdate(hierarchyData, e?.node?.code, response);
                console.log(hierarchyData);
                return { hierarchyData };
            });
        }
    }


    render() {
        const { chartView, hierarchyData } = this.state;
        return (
            <div>
                {chartView == "staticdata" &&
                    <div className={cardStyles.card}>
                        {hierarchyData && hierarchyData?.length > 0 &&
                            <OrganizationChart
                                value={hierarchyData}
                                selectionMode="multiple"
                                onNodeSelect={(e: any) => { this.onSelectionChange(e) }}
                            />
                        }
                    </div>
                }
                {chartView == "staticdatawithpic" &&
                    <div className={cardStyles.card}>
                        <OrganizationChart value={staticDataWithPic} nodeTemplate={this.nodeTemplate} />
                    </div>
                }
            </div>
        )
    }
}

export default Chart;