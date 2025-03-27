import React, { Suspense } from 'react';

import { withTranslation } from 'react-i18next';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ApiManager from '@/services/ApiManager';
import Util from '@/services/Util';
import NotificationManager from '@/services/NotificationManager';
import Grid from '@mui/material/Grid';
import { Calendar, momentLocalizer } from 'react-big-calendar';

const localizer = momentLocalizer(moment);

class SchedulerView extends React.Component<any, any> {
  util = new Util();
  apiClient = new ApiManager().CreateApiClient();
  notify = new NotificationManager();
  token: any = sessionStorage.getItem('token');

  constructor(props: any) {
    super(props);
    this.state = {
      events: [],
      selectedSlot: null,
      currentDate: new Date(),
    };
  }

  componentDidMount() {
    this.refresh();
  }

  async refresh() {}

  render() {
    const { events, currentDate } = this.state;

    return (
      <div className="layout width-100">
        <div className="bg-Color">
          <Grid lg={12} item container spacing={2} direction={'row'}>
            <Grid item lg={3} xs={12}></Grid>
            <Grid item lg={9} xs={12} />
          </Grid>
          <Calendar
            localizer={localizer}
            events={events}
            style={{ height: 500, fontSize: '15px', width: '100%' }}
            defaultView="week"
            date={currentDate}
            onNavigate={(date: any) => this.setState({ currentDate: date })}
            dayLayoutAlgorithm={'no-overlap'}
            selectable
            popup={true}
            views={['month', 'week', 'day']}
          />
        </div>
      </div>
    );
  }
}

const ComponentTranslated = withTranslation()(SchedulerView);

function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}

export default App;
