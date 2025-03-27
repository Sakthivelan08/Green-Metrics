import React, { Component } from 'react';
import { Nav, initializeIcons, FontIcon, mergeStyles } from '@fluentui/react';
import { mergeStyleSets } from '@fluentui/merge-styles';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';

initializeIcons();

interface SidebarProps extends RouteComponentProps, WithTranslation { }

interface SidebarState {
    isCollapsed: boolean;
}

const navLinks: any[] = [
    { key: 'supplierQAForm', name: 'MENU_SUPPLIERFORM', routeUrl: '/supplierQAForm', icon: 'HomeSolid' },
    { key: 'supplierQASheet', name: 'MENU_SUPPLIERSHEET', routeUrl: '/supplierQASheet', icon: 'DocumentSet' },
    { key: 'supplier', name: 'MENU_SUPPLIER', routeUrl: '/supplier', icon: 'AddFriend' },
    { key: 'user', name: 'MENU_USERS', routeUrl: '/user', icon: 'Group' },
    { key: 'QuestionMaster', name: 'MENU_QAMASTER', routeUrl: '/questionMaster', icon: 'SurveyQuestions' },
    // Add more nav links as needed
];

const classNames = mergeStyleSets({
    sidebar: {
        width: 'max-content',
        height: '100%',
        boxSizing: 'border-box',
        borderRight: '1px solid #ccc',
        overflowY: 'auto',
        transition: 'width 0.2s ease',
        backgroundColor: '#eae8fd',
    },
    sidebarCollapsed: {
        width: '50px',
    },
});

const iconClass = mergeStyles({
    fontSize: '20px',
    marginLeft: '7px',
    marginTop: '10px',
    color: 'blue',
});

class Sidebar extends Component<SidebarProps, SidebarState> {
    constructor(props: SidebarProps) {
        super(props);
        this.state = {
            isCollapsed: false,
        };
    }

    toggleCollapse = () => {
        this.setState((prevState) => ({
            isCollapsed: !prevState.isCollapsed,
        }));
    };

    onMenuItemSelect = (e: any, item: any) => {
        if (item?.routeUrl) {
            this.props.history.push(item?.routeUrl);
        }
    };

    render() {
        const { isCollapsed } = this.state;
        const { t } = this.props;

        const translatedNavLinks = navLinks.map((link) => ({
            ...link,
            name: isCollapsed ? '' : t(link.name, { fallback: link.name }), // Using fallback to avoid undefined
        }));

        return (
            <div className={`${classNames.sidebar} ${isCollapsed ? classNames.sidebarCollapsed : ''}`}>
                <div
                    onClick={this.toggleCollapse}
                    className={mergeStyles({ pointerEvents: 'auto', cursor: 'pointer' })}
                >
                    <FontIcon aria-label="Compass" iconName="CollapseMenu" className={iconClass} />
                </div>
                <Nav
                    groups={[
                        {
                            links: translatedNavLinks,
                        },
                    ]}
                    onLinkClick={(e, item) => {
                        this.onMenuItemSelect(e, item);
                    }}
                />
            </div>
        );
    }
}

export default withTranslation()(withRouter(Sidebar));
