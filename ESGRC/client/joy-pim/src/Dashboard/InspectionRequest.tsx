import React, { Suspense } from 'react';
import { Stack } from '@fluentui/react';
import { ITextProps, Text } from '@fluentui/react/lib/Text';
import { withTranslation } from 'react-i18next';

class InspectionRequest extends React.Component<any, any> {
    render() {

        return (
            <div className='layout width-100'>
                <div className="bg-Color" >
                    <Stack>
                        <Text className="color-blue text" key={'xxLarge'} variant={'xxLarge' as ITextProps['variant']} nowrap block >
                            {`${this.props.t('Need To Implement')}`}
                        </Text>
                    </Stack>
                </div>
            </div>
        );
    }
}

//export default Overview;
const ComponentTranslated = withTranslation()(InspectionRequest);

function App() {
    return (
        <Suspense fallback="">
            <ComponentTranslated />
        </Suspense>
    );
}

export default App;
