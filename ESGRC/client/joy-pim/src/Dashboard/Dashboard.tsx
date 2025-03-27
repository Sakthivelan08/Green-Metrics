import { Icon } from '@fluentui/react';
import React, { Suspense } from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { withTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';
import {
  DataVizPalette,
  IChartDataPoint,
  PieChart,
} from '@fluentui/react-charting';

class Dashboardview extends React.Component<any, any> {
  points: IChartDataPoint[] | undefined;
  private _colors = [
    [DataVizPalette.color3, DataVizPalette.color1, DataVizPalette.color2]
  ];
    

  constructor(props: any) {
    super(props);

    this.state = {
      rowData: [],
      rowData1: [],
      isRecord: false,
      enableEditButton: false,
      enableActiveButton: false,
      inActivePage: false,
      selectedRowData: [],
      columns: [],
      statusOption: [],
      A_D_Visible: false,
      Visible: false,
      ViewItems: false,
      dynamicData: [
        { x: 'Environment', y: 60 },
        { x: 'Governence', y: 15 },
        { x: 'Scocial', y: 25 },

      ],
      colors: this._colors[0],
      width: 600,
      height: 350,
      statusKey: 0,
      statusMessage: '',
    };
  }

  async componentDidMount() {
    this.setState({
      isRecord: true,
    });
    // this.refresh();
  }

  perpage = () => {
    const recordCont = [25, 50, 100, 150, 200];
    return recordCont;
  };
  Defaultperpage = () => {
    const recordCont = 25;
    return recordCont;
  };

  hardcodedValues = () => [];

  render() {
    const { t } = this.props;
    const { isChecked } = this.state;
    return (
      <>
        <div
          className="page-wrapper"
          style={{ overflow: 'auto', height: '100vh', width: '100%', backgroundColor: '#f1f1f8' }}
        >
          <div className="layout width-1001">
            <Grid container spacing={2} direction="row" alignItems="center" className="grid">
              <img
                src="https://danubedev.blob.core.windows.net/images/hand%201.gif"
                style={{ margin: '10px', height: '50px' }}
              />
              <Grid item lg={3} xs={10}>
                <strong>{`${t('WEL_DASHBOARD')}`}</strong>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row" alignItems="center" className="grid">
              {/* <Text style={{ margin: '35px' }}>{`${t('WEL_DASHBOARD')}`}</Text> */}
            </Grid>

            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgb(255, 255, 255)',
                margin: '10px',
                borderRadius: '10px',
              }}
            >
              <Grid lg={12} item container spacing={2} direction={'row'} style={{ margin: '10px' }}>
                <Grid
                  item
                  lg={3}
                  xs={6}
                  className="count-box1"
                  style={{ margin: '15px', backgroundColor: '#eceef6' }}
                >
                  <div className="count-bg bg2">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.3rem',
                      }}
                    >
                      <Text>
                        <b>E</b>
                      </Text>
                      <div
                        style={{
                          backgroundColor: '#22ccb2',
                          borderRadius: '1rem',
                          width: '4rem',
                        }}
                      >
                        <Icon
                          style={{ fontSize: '2rem', margin: '0.75rem 0', color: 'white' }}
                          iconName="Money"
                          className="moneyCss"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        marginLeft: '12px',
                        backgroundColor: '.bg h3',
                        borderRadius: '5rem',
                      }}
                    >
                      <strong>60%</strong>
                    </div>
                    <div>
                      <Icon iconName="LineChart" style={{ backgroundColor: '#22ccb2' }} />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex' }}>
                      <small>60% Period of time </small>
                    </div>
                  </div>
                </Grid>
                <Grid item lg={1} xs={6} />
                <Grid
                  item
                  lg={3}
                  xs={6}
                  className="count-box1"
                  style={{ margin: '15px', backgroundColor: '#ffffff' }}
                >
                  <div className="count-bg bg4">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.3rem',
                      }}
                    >
                      <Text>
                        <b>S</b>
                      </Text>
                      <div
                        style={{
                          backgroundColor: '#e8618c',
                          borderRadius: '1rem',
                          width: '4rem',
                        }}
                      >
                        <Icon
                          style={{ fontSize: '2rem', margin: '0.75rem 0', color: '#ffffff' }}
                          iconName="ShoppingCart"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        marginLeft: '12px',
                        backgroundColor: '.bg h3',
                        borderRadius: '5rem',
                      }}
                    >
                      <strong>25%</strong>
                    </div>
                    <div>
                      <Icon iconName="LineChart" style={{ backgroundColor: '#e8618c' }} />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex' }}>
                      <small>25% Period of time </small>
                    </div>
                  </div>
                </Grid>
                <Grid item lg={1} xs={6} />
                <Grid
                  item
                  lg={3}
                  xs={6}
                  className="count-box1"
                  style={{ margin: '15px', backgroundColor: '#eceef6' }}
                >
                  <div className="count-bg bg5">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.3rem',
                      }}
                    >
                      <Text>
                        <b>G</b>
                      </Text>
                      <div
                        style={{
                          backgroundColor: '#636ae8',
                          borderRadius: '1rem',
                          width: '4rem',
                        }}
                      >
                        <Icon
                          style={{ fontSize: '2rem', margin: '0.75rem 0', color: 'white' }}
                          iconName="AccountManagement"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        marginLeft: '12px',
                        backgroundColor: '.bg h3',
                        borderRadius: '5rem',
                      }}
                    >
                      <strong>15%</strong>
                    </div>
                    <div>
                      <Icon
                        iconName="LineChart"
                        style={{
                          backgroundColor: '#636ae8',
                        }}
                      />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex' }}>
                      <small>15 Period of time </small>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>

            <Grid lg={12} item container spacing={2} direction={'row'} style={{ margin: '10px' }}>
              <Grid
                item
                lg={12}
                xs={6}
                style={{ margin: '5px', backgroundColor: 'white', borderRadius: '10px' }}
              >
                <div>
                  <h3> ESGRC Environment Overview</h3>
                </div>
                <hr />
                <PieChart
                  width={this.state.width}
                  height={this.state.height}
                  data={this.state.dynamicData}
                  // chartTitle="Pie Chart dynamic example"
                  colors={this.state.colors}
                />
              </Grid>

            </Grid>



          </div>
        </div>
      </>
    );
  }
}

const ComponentTranslated = withTranslation()(Dashboardview);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
