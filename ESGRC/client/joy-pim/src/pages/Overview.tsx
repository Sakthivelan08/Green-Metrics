import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';

class Overview extends React.Component<any, any> {
  render() {
    return (
      <div className='layout width-100'>
        <div className="bg-Color" >
          <h1 className="color-blue text">{`${this.props.t('WELCOME_MSG')}`}</h1>
        </div>
      </div>
    );
  }
}
const ComponentTranslated = withTranslation()(Overview);
function App() {
  return (
    <Suspense fallback="">
      <ComponentTranslated />
    </Suspense>
  );
}
export default App;
