import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import ApiManager from '@/services/ApiManager';
import Util from '@/services/Util';
import NotificationManager from '@/services/NotificationManager';
import '@fortune-sheet/react/dist/index.css';
import { Workbook } from '@fortune-sheet/react';
import { t } from 'i18next';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import { Grid } from '@mui/material';
interface FileDataValueState {
  spreadsheetdata: any[];
  loading: boolean;
  deparment: any[];
  dropdownOptions1: IDropdownOption[];
  dropdownOptions2: IDropdownOption[];
  jsonvaluedata: [];
  selectedDropdownValue1: string | number | undefined;
  selectedDropdownValue2: string | number | undefined;
  sheetData: {
    name: string;
    celldata: {
      r: number;
      c: number;
      v: { m: string; v: string; bg?: string; bl?: number; fc?: string };
    }[];
    config: {
      borderInfo: {
        rangeType: string;
        value: {
          row_index: number;
          col_index: number;
          l: { style: number; color: string };
          r: { style: number; color: string };
          t: { style: number; color: string };
          b: { style: number; color: string };
        };
      }[];
      columnlen: { [key: number]: number };
      rowlen: { [key: number]: number };
      //   merge: { r: number; c: number; rs: number; cs: number };
    };
  }[];
}

class FileDataValue extends React.Component<{}, FileDataValueState> {
  apiClient: any;
  util: any;
  notify: NotificationManager;

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.util = new Util();
    this.apiClient = new ApiManager().CreateApiClient();
    this.notify = new NotificationManager();
    this.state = {
      spreadsheetdata: [],
      loading: true,
      deparment: [],
      dropdownOptions1: [],
      dropdownOptions2: [],
      selectedDropdownValue1: undefined,
      selectedDropdownValue2: undefined,
      jsonvaluedata: [],
      sheetData: [
        {
          name: 'Sheet1',
          celldata: [],
          config: {
            borderInfo: [],
            columnlen: {},
            rowlen: {},
            // merge: {}
          },
        },
      ],
    };
  }

  async componentDidMount() {
    await this.refresh();
  }

  async refresh() {
    try {
      const columnData = (await this.apiClient.getDepartment()).result;
      if (columnData) {
        this.Dataconvertor(columnData);
      }
      this.setState({
        spreadsheetdata: columnData,
        loading: false,
      });
    } catch (error) {
      console.error('Error during refresh:', error);
    }
    await this.fetchDropdownData1();
    await this.fetchDropdownData2();
  }

  async fetchDropdownData1() {
    try {
      const apiResponse = await this.apiClient.getYear();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.year,
          text: item.year,
        })) || [];
      this.setState({ dropdownOptions1: options });
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      this.notify.showErrorNotify(e.message);
    }
  }

  async fetchDropdownData2() {
    try {
      const apiResponse = await this.apiClient.getMonths();
      const options =
        apiResponse?.result?.map((item: any) => ({
          key: item.id,
          text: item.name,
        })) || [];
      this.setState({ dropdownOptions2: options });
    } catch (e: any) {
      console.error('Error fetching dropdown data:', e);
      this.notify.showErrorNotify(e.message);
    }
  }
  handleDropdownChange1 = async (event: any, option?: IDropdownOption) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue1: option.key }, async () => {
        const { selectedDropdownValue1, selectedDropdownValue2 } = this.state;
        if (selectedDropdownValue1 && selectedDropdownValue2) {
          await this.fetchData(selectedDropdownValue1, selectedDropdownValue2);
        }
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  handleDropdownChange2 = async (event: any, option?: IDropdownOption) => {
    if (option?.key !== undefined) {
      this.setState({ selectedDropdownValue2: option.key }, async () => {
        const { selectedDropdownValue1, selectedDropdownValue2 } = this.state;
        if (selectedDropdownValue1 && selectedDropdownValue2) {
          await this.fetchData(selectedDropdownValue1, selectedDropdownValue2);
        }
      });
    } else {
      console.error('Selected option has no key:', option);
    }
  };

  async fetchData(year: any, month: any) {
    try {
      const apiResponse = await this.apiClient.excelDataView(year, month);
      const data: any = apiResponse?.result || [];
      this.setState({ jsonvaluedata: data });
      debugger;
    } catch (e: any) {
      console.error('Error fetching data:', e);
      this.notify.showErrorNotify(e.message);
    }
  }

  Dataconvertor(datas: any[]) {
    debugger;
    const headerCell = {
      r: 0, // Row 1
      c: 2, // Column C (starting point of the merged range)
      v: {
        m: 'AIR EMISSION of Process Stack of Steel Industry (Month)', // The header text
        v: 'AIR EMISSION of Process Stack of Steel Industry (Month)', // The actual value
        fc: '#000000', // Font color
        ht: 0, // Horizontal alignment: center
      },
    };

    const departmentCell = {
      r: 2, // Row 3 (0-indexed)
      c: 0, // Column A (0-indexed)
      v: {
        m: 'Department', // Text content for cell A3
        v: 'Department', // Actual value for cell A3
        fc: '#000000', // Font color (black)
        ht: 0, // Horizontal alignment: center
        bl: 1,
      },
    };
    const stackCell = {
      r: 2,
      c: 1,
      v: {
        m: 'Stack',
        v: 'Stack',
        fc: '#000000',
        ht: 0,
        bl: 1,
      },
    };

    const celldata = datas.map((data, index) => ({
      r: 3 + index,
      c: 0,
      v: {
        m: data.name,
        v: data.name,
      },
    }));

    celldata.unshift(headerCell);
    celldata.unshift(stackCell);
    celldata.unshift(departmentCell);

    this.setState((prevState) => ({
      sheetData: [
        {
          ...prevState.sheetData[0],
          celldata,
          config: {
            ...prevState.sheetData[0].config,
            columnlen: { 0: 150, 2: 450 },
            rowlen: { 0: 50 },
          },
        },
      ],
    }));
  }

  createBorderInfo(row: number, col: number) {
    return {
      rangeType: 'cell',
      value: {
        row_index: row,
        col_index: col,
        l: { style: 1, color: '#000000' },
        r: { style: 1, color: '#000000' },
        t: { style: 1, color: '#000000' },
        b: { style: 1, color: '#000000' },
      },
    };
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <Grid container spacing={2} direction="row" alignItems="center" justifyContent="center">
          {/* Dropdown for Year */}
          <Grid item lg={3} xs={12}>
            <Dropdown
              placeholder={t('SELECT_YEAR')}
              options={this.state.dropdownOptions1}
              onChange={this.handleDropdownChange1}
              styles={{ dropdown: { width: '100%' } }}
            />
          </Grid>

          {/* Dropdown for Month */}
          <Grid item lg={3} xs={12}>
            <Dropdown
              placeholder={t('SELECT_MONTH')}
              options={this.state.dropdownOptions2}
              onChange={this.handleDropdownChange2}
              styles={{ dropdown: { width: '100%' } }}
            />
          </Grid>
        </Grid>

        {/* Workbook Section */}
        <div className="layout width-100">
          <Workbook data={this.state.sheetData} />
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(FileDataValue);

function App() {
  return (
    <Suspense fallback="Loading...">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
