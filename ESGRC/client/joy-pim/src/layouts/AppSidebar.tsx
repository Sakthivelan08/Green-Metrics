import AuthManagerService from '@/services/AuthManagerService';
import { getTheme, Icon } from '@fluentui/react';
import { Sidebar } from '@uifabric/experiments';
import { t } from 'i18next';
import { IButtonStyles, Stack } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { initializeIcons } from '@fluentui/react';
import ApiManager from '@/services/ApiManager';

initializeIcons();


const AppSidebar = (props: any) => {
  const apiClient = new ApiManager().CreateApiClient();

  const History = useHistory();

  const fontFamily = 'Montserrat, sans-serif';
  const bgcolor = '#002E59 !important';
  const color = 'white !important';
  const hoverBgColor = 'white !important';
  const hoverTextColor = '#002E59 !important';
  const authManager = new AuthManagerService();
  const token = sessionStorage.getItem('token');
  const decode: any = jwt_decode(token || '');
  const isAuthenticated = authManager.isAuthenticated();
  const user = isAuthenticated ? authManager.getUserData() : null;
  const roleId: any[] = user?.roleId || [];
  const fullPathName = window.location.pathname;
  const pathName = fullPathName.substring(1);
  const customButtonStyles: IButtonStyles = {
    root: {
      backgroundColor: '#002E59',
      borderRadius: '20px',
      marginLeft: '4px !important',
      width: '95% !important',
      minWidth: '0% !important',
    },
    rootHovered: {
      backgroundColor: '#bbbbbb !important',
      borderRadius: '20px !important',
    },
    rootPressed: {
      backgroundColor: '#002E59',
      //  borderRadius: '20px !important',
    },
  };
  const navigationFn = (navTo: any) => {
    props.history.push(navTo);
  };
  const [collapse, setCollapse] = useState(false);

  const navItemRenderValidation = (e: any): boolean => {
    if (e) {
      const hasItemInAccess: any = props?.navigationData?.filter(
        (item: any) => item?.accessName?.toLowerCase()?.trim() === e?.toLowerCase()?.trim(),
      );
      if (hasItemInAccess?.length > 0) {
        return true;
      }
      return false;
    }
    return false;
  };

  const handleCollapseChanged = () => {
    setCollapse(!collapse);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: bgcolor,
      }}
    >
      <div style={{ flexGrow: 1 }}>
        <>
          <Sidebar
            className="sidebar"
            style={{
              height: '100%',
              fontFamily: 'Montserrat, sans-serif',
              overflow: 'auto ',
              backgroundColor: bgcolor,
            }}
            buttonStyles={customButtonStyles}
            theme={getTheme()}
            collapsible={true}
            items={[

              {
                key: 'environment',
                name: `${t('Environment')}`,
                iconProps: {
                  iconName: 'Globe',
                  styles: {
                    root: {
                      color: 'white',
                      fontSize: 30,
                    },
                  },
                },
                isVisible: navItemRenderValidation('/home/environment') &&
                  navItemRenderValidation('/home') &&
                  props.location.pathname?.split('/')[1] == 'home',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('environment') ? '#20B2AA' : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: `${color}`,
                  },
                },
                active: false,
                onClick: () => {
                  navigationFn('/home/environment');
                  sessionStorage.setItem('Tableclicked', 'false');
                },
                items: [

                  ...(navItemRenderValidation('/home/group') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 1
                    ? [

                      {
                        key: 'metricsgroup',
                        className: 'sidebar',
                        name: `${t('MENU_METRICS_GROUP')}`,
                        iconProps: {
                          iconName: 'Group',
                          styles: {
                            root: {
                              color:
                                pathName.includes('/group')
                                  ? `${hoverTextColor}`
                                  : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/group') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor:
                              pathName.includes('/group')
                                ? `${hoverBgColor}`
                                : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color:
                              pathName.includes('/group')
                                ? `${hoverTextColor}`
                                : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/group');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },

                      {
                        key: 'materialdataview',
                        className: 'sidebar',
                        name: `${t('MENU_MATERIAL_DATA_VIEW')}`,
                        iconProps: {
                          iconName: 'Group',
                          styles: {
                            root: {
                              color:
                                pathName.includes('materialgroup') && !pathName.includes('/assessmentgroup')
                                  ? `${hoverTextColor}`
                                  : `${color}`,
                            },
                          },
                        },
                        isVisible: true,
                        // navItemRenderValidation('/home/group') &&
                        // navItemRenderValidation('/home') &&
                        // props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor:
                              pathName.includes('materialgroup')
                                ? `${hoverBgColor}`
                                : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color:
                              pathName.includes('materialgroup')
                                ? `${hoverTextColor}`
                                : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/materialgroup');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },

                      {
                        key: 'templates',
                        className: 'sidebar',
                        name: `${t('SUBMENU_TEMPLATE')}`,
                        iconProps: {
                          iconName: 'Document',
                          styles: {
                            root: {
                              color: pathName.includes('templates') ? `${hoverTextColor}` : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/templates') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor: pathName.includes('templates')
                              ? `${hoverBgColor}`
                              : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color: pathName.includes('templates') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/templates');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },]
                    : []),
                  ...(navItemRenderValidation('/home/complianceList') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 29
                    ? [{
                      key: 'complianceList',
                      className: 'sidebar',
                      name: `${t('SUBMENU_COMPLIANCE_LIST')}`,
                      iconProps: {
                        iconName: 'ProductList',
                        styles: {
                          root: {
                            color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                      },
                      isVisible:
                        navItemRenderValidation('/home/complianceList') &&
                        navItemRenderValidation('/home') &&
                        props.location.pathname?.split('/')[1] == 'home',
                      //isVisible: true,
                      styles: {
                        root: {
                          backgroundColor: pathName.includes('complianceList')
                            ? `${hoverBgColor}`
                            : `${bgcolor}`,
                        },
                        label: {
                          fontFamily: `${fontFamily}`,
                          color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                        },
                      },
                      onClick: () => {
                        navigationFn('/home/complianceList');
                        // History.push('/overview');
                        const clicked = 'false';
                        sessionStorage.setItem('Tableclicked', clicked);
                      },
                    },] : []),
                  ...(navItemRenderValidation('/home/complianceList') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 31
                    ? [{
                      key: 'complianceList',
                      className: 'sidebar',
                      name: `${t('SUBMENU_COMPLIANCE_LIST')}`,
                      iconProps: {
                        iconName: 'ProductList',
                        styles: {
                          root: {
                            color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                      },
                      isVisible:
                        navItemRenderValidation('/home/complianceList') &&
                        navItemRenderValidation('/home') &&
                        props.location.pathname?.split('/')[1] == 'home',
                      //isVisible: true,
                      styles: {
                        root: {
                          backgroundColor: pathName.includes('complianceList')
                            ? `${hoverBgColor}`
                            : `${bgcolor}`,
                        },
                        label: {
                          fontFamily: `${fontFamily}`,
                          color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                        },
                      },
                      onClick: () => {
                        navigationFn('/home/complianceList');
                        // History.push('/overview');
                        const clicked = 'false';
                        sessionStorage.setItem('Tableclicked', clicked);
                      },
                    },] : []), ...(navItemRenderValidation('/home/complianceList') &&
                      navItemRenderValidation('/home') &&
                      props.location.pathname?.split('/')[1] === 'home' &&
                      roleId[0] === 7
                      ? [{
                        key: 'complianceList',
                        className: 'sidebar',
                        name: `${t('SUBMENU_COMPLIANCE_LIST')}`,
                        iconProps: {
                          iconName: 'ProductList',
                          styles: {
                            root: {
                              color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/complianceList') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        //isVisible: true,
                        styles: {
                          root: {
                            backgroundColor: pathName.includes('complianceList')
                              ? `${hoverBgColor}`
                              : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/complianceList');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },] : [])

                ],
              },
              {
                key: 'social',
                name: `${t('Social')}`,
                iconProps: {
                  iconName: 'Home',
                  styles: {
                    root: {
                      color: 'white',
                      fontSize: 30,
                    },
                  },
                },
                isVisible: navItemRenderValidation('/home/social') &&
                  navItemRenderValidation('/home') &&
                  props.location.pathname?.split('/')[1] == 'home',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('social') ? '#20B2AA' : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: `${color}`,
                  },
                },
                active: false,
                onClick: () => {
                  navigationFn('/home/social');
                  sessionStorage.setItem('Tableclicked', 'false');
                },
                items: [

                  ...(navItemRenderValidation('/home/group') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 1
                    ? [
                      {
                        key: 'metricsgroup',
                        className: 'sidebar',
                        name: `${t('MENU_METRICS_GROUP')}`,
                        iconProps: {
                          iconName: 'Group',
                          styles: {
                            root: {
                              color:
                                pathName.includes('/group')
                                  ? `${hoverTextColor}`
                                  : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/group') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor:
                              pathName.includes('/group')
                                ? `${hoverBgColor}`
                                : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color:
                              pathName.includes('/group')
                                ? `${hoverTextColor}`
                                : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/group');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },
                      {
                        key: 'materialdataview',
                        className: 'sidebar',
                        name: `${t('MENU_MATERIAL_DATA_VIEW')}`,
                        iconProps: {
                          iconName: 'Group',
                          styles: {
                            root: {
                              color:
                                pathName.includes('materialgroup') && !pathName.includes('/assessmentgroup')
                                  ? `${hoverTextColor}`
                                  : `${color}`,
                            },
                          },
                        },
                        isVisible: true,
                        // navItemRenderValidation('/home/group') &&
                        // navItemRenderValidation('/home') &&
                        // props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor:
                              pathName.includes('materialgroup')
                                ? `${hoverBgColor}`
                                : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color:
                              pathName.includes('materialgroup')
                                ? `${hoverTextColor}`
                                : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/materialgroup');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },
                      {
                        key: 'templates',
                        className: 'sidebar',
                        name: `${t('SUBMENU_TEMPLATE')}`,
                        iconProps: {
                          iconName: 'Document',
                          styles: {
                            root: {
                              color: pathName.includes('templates') ? `${hoverTextColor}` : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/templates') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor: pathName.includes('templates')
                              ? `${hoverBgColor}`
                              : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color: pathName.includes('templates') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/templates');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },]
                    : []),
                  //for social check
                  ...(navItemRenderValidation('/home/complianceList') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 31
                    ? [{
                      key: 'complianceList',
                      className: 'sidebar',
                      name: `${t('SUBMENU_COMPLIANCE_LIST')}`,
                      iconProps: {
                        iconName: 'ProductList',
                        styles: {
                          root: {
                            color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                      },
                      isVisible:
                        navItemRenderValidation('/home/complianceList') &&
                        navItemRenderValidation('/home') &&
                        props.location.pathname?.split('/')[1] == 'home',
                      //isVisible: true,
                      styles: {
                        root: {
                          backgroundColor: pathName.includes('complianceList')
                            ? `${hoverBgColor}`
                            : `${bgcolor}`,
                        },
                        label: {
                          fontFamily: `${fontFamily}`,
                          color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                        },
                      },
                      onClick: () => {
                        navigationFn('/home/complianceList');
                        // History.push('/overview');
                        const clicked = 'false';
                        sessionStorage.setItem('Tableclicked', clicked);
                      },
                    },] : [])

                ],

              },

              {
                key: 'governence',
                name: `${t('Governence')}`,
                iconProps: {
                  iconName: 'Admin',
                  styles: {
                    root: {
                      color: 'white',
                      fontSize: 30,
                    },
                  },
                },
                isVisible: navItemRenderValidation('/home/governence') &&
                  navItemRenderValidation('/home') &&
                  props.location.pathname?.split('/')[1] == 'home',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('governence') ? '#20B2AA' : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: `${color}`,
                  },
                },
                active: false,
                onClick: () => {
                  navigationFn('/home/governence');
                  sessionStorage.setItem('Tableclicked', 'false');
                },
                items: [

                  ...(navItemRenderValidation('/home/group') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 1
                    ? [
                      {
                        key: 'metricsgroup',
                        className: 'sidebar',
                        name: `${t('MENU_METRICS_GROUP')}`,
                        iconProps: {
                          iconName: 'Group',
                          styles: {
                            root: {
                              color:
                                pathName.includes('/group')
                                  ? `${hoverTextColor}`
                                  : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/group') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor:
                              pathName.includes('/group')
                                ? `${hoverBgColor}`
                                : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color:
                              pathName.includes('/group')
                                ? `${hoverTextColor}`
                                : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/group');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },
                      {
                        key: 'materialdataview',
                        className: 'sidebar',
                        name: `${t('MENU_MATERIAL_DATA_VIEW')}`,
                        iconProps: {
                          iconName: 'Group',
                          styles: {
                            root: {
                              color:
                                pathName.includes('materialgroup') && !pathName.includes('/assessmentgroup')
                                  ? `${hoverTextColor}`
                                  : `${color}`,
                            },
                          },
                        },
                        isVisible: true,
                        // navItemRenderValidation('/home/group') &&
                        // navItemRenderValidation('/home') &&
                        // props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor:
                              pathName.includes('materialgroup')
                                ? `${hoverBgColor}`
                                : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color:
                              pathName.includes('materialgroup')
                                ? `${hoverTextColor}`
                                : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/materialgroup');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },
                      {
                        key: 'templates',
                        className: 'sidebar',
                        name: `${t('SUBMENU_TEMPLATE')}`,
                        iconProps: {
                          iconName: 'Document',
                          styles: {
                            root: {
                              color: pathName.includes('templates') ? `${hoverTextColor}` : `${color}`,
                            },
                          },
                        },
                        isVisible:
                          navItemRenderValidation('/home/templates') &&
                          navItemRenderValidation('/home') &&
                          props.location.pathname?.split('/')[1] == 'home',
                        styles: {
                          root: {
                            backgroundColor: pathName.includes('templates')
                              ? `${hoverBgColor}`
                              : `${bgcolor}`,
                          },
                          label: {
                            fontFamily: `${fontFamily}`,
                            color: pathName.includes('templates') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                        onClick: () => {
                          navigationFn('/home/templates');
                          // History.push('/overview');
                          const clicked = 'false';
                          sessionStorage.setItem('Tableclicked', clicked);
                        },
                      },]
                    : []),
                  ...(navItemRenderValidation('/home/complianceList') &&
                    navItemRenderValidation('/home') &&
                    props.location.pathname?.split('/')[1] === 'home' &&
                    roleId[0] === 30
                    ? [{
                      key: 'complianceList',
                      className: 'sidebar',
                      name: `${t('SUBMENU_COMPLIANCE_LIST')}`,
                      iconProps: {
                        iconName: 'ProductList',
                        styles: {
                          root: {
                            color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                          },
                        },
                      },
                      isVisible:
                        navItemRenderValidation('/home/complianceList') &&
                        navItemRenderValidation('/home') &&
                        props.location.pathname?.split('/')[1] == 'home',
                      //isVisible: true,
                      styles: {
                        root: {
                          backgroundColor: pathName.includes('complianceList')
                            ? `${hoverBgColor}`
                            : `${bgcolor}`,
                        },
                        label: {
                          fontFamily: `${fontFamily}`,
                          color: pathName.includes('complianceList') ? `${hoverTextColor}` : `${color}`,
                        },
                      },
                      onClick: () => {
                        navigationFn('/home/complianceList');
                        // History.push('/overview');
                        const clicked = 'false';
                        sessionStorage.setItem('Tableclicked', clicked);
                      },
                    },] : [])

                ],

              },



              {
                key: 'reportingcompliance',
                name: `${t('Reports')}`,
                iconProps: {
                  iconName: 'ReportDocument', // Use 'ReportDocument' for Reporting & Compliance
                  styles: {
                    root: {
                      color: 'white', // Set icon color to white
                      fontSize: 30, // Adjust size as needed
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/home/reportingCompliance') &&
                  navItemRenderValidation('/home') &&
                  props.location.pathname?.split('/')[1] === 'home',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('reportingCompliance') ? '#20B2AA' : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: `${color}`,
                  },
                },
                active: false,
                onClick: () => {
                  navigationFn('/home/reportingCompliance');
                  sessionStorage.setItem('Tableclicked', 'false');
                },
                items: [
                  {
                    key: 'bsrpdf',
                    className: 'sidebar',
                    name: `${t('SUBMENU_PDF_REPORTS')}`,
                    iconProps: {
                      iconName: 'PDF',
                      styles: {
                        root: {
                          color: pathName.includes('bsrpdf') ? `${hoverTextColor}` : `${color}`,
                        },
                      },
                    },
                    isVisible:
                      navItemRenderValidation('/home/bsrpdf') &&
                      navItemRenderValidation('/home') &&
                      props.location.pathname?.split('/')[1] === 'home',

                    styles: {
                      root: {
                        backgroundColor: pathName.includes('bsrpdf') ? `${hoverBgColor}` : `${bgcolor}`,
                      },
                      label: {
                        fontFamily: `${fontFamily}`,
                        color: pathName.includes('bsrpdf') ? `${hoverTextColor}` : `${color}`,
                      },
                    },
                    onClick: () => {
                      navigationFn('/home/bsrpdf');
                      sessionStorage.setItem('Tableclicked', 'false');
                    },
                  },
                  {
                    key: 'AirReports',
                    className: 'sidebar',
                    name: `${t('SUBMENU_AIR_EMISSION_REPORT')}`,
                    iconProps: {
                      iconName: 'PDF',
                      styles: {
                        root: {
                          color: pathName.includes('AirReports') ? `${hoverTextColor}` : `${color}`,
                        },
                      },
                    },
                    isVisible:
                      navItemRenderValidation('/home/AirReports') &&
                      navItemRenderValidation('/home') &&
                      props.location.pathname?.split('/')[1] === 'home',
                    styles: {
                      root: {
                        backgroundColor: pathName.includes('AirReports') ? `${hoverBgColor}` : `${bgcolor}`,
                      },
                      label: {
                        fontFamily: `${fontFamily}`,
                        color: pathName.includes('AirReports') ? `${hoverTextColor}` : `${color}`,
                      },
                    },
                    onClick: () => {
                      navigationFn('/home/AirReports');
                      sessionStorage.setItem('Tableclicked', 'false');
                    },
                  },
                  {
                    key: 'SelectedReports',
                    className: 'sidebar',
                    name: `${t('SUBMENU_REPORTS')}`,
                    iconProps: {
                      iconName: 'ReportDocument',
                      styles: {
                        root: {
                          color: pathName.includes('SelectedReports')
                            ? `${hoverTextColor}`
                            : `${color}`,
                        },
                      },
                    },
                    isVisible:
                      navItemRenderValidation('/home/SelectedReports') &&
                      navItemRenderValidation('/home') &&
                      props.location.pathname?.split('/')[1] == 'home',

                    styles: {
                      root: {
                        backgroundColor: pathName.includes('SelectedReports')
                          ? `${hoverBgColor}`
                          : `${bgcolor}`,
                      },
                      label: {
                        fontFamily: `${fontFamily}`,
                        color: pathName.includes('SelectedReports') ? hoverTextColor : `${color}`,
                      },
                    },
                    onClick: () => {
                      navigationFn('/home/SelectedReports');
                      const clicked = 'false';
                      sessionStorage.setItem('Tableclicked', clicked);
                    },
                  },


                ],
              },
              {
                key: 'SFTPUpload',
                className: 'sidebar',
                name: `${t('SUBMENU_SFTP_UPLOAD')}`,
                iconProps: {
                  iconName: 'BulkUpload',
                  styles: {
                    root: {
                      color: pathName.includes('SFTPUpload') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/SFTPUpload') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',

                styles: {
                  root: {
                    backgroundColor: pathName.includes('SFTPUpload')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('SFTPUpload') ? hoverTextColor : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/SFTPUpload');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'regulation',
                className: 'sidebar',
                name: `${t('SUBMENU_REGULATIONS')}`,
                iconProps: {
                  iconName: 'DocumentSet',
                  styles: {
                    root: {
                      color: pathName.includes('regulation') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/regulation') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('regulation')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('regulation') ? `${hoverTextColor}` : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/regulation');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'ConversionFormula',
                className: 'sidebar',
                name: `${t('SUBMENU_CONVERSION_FORMULA')}`,
                iconProps: {
                  iconName: 'ChangeEntitlements',
                  styles: {
                    root: {
                      color: pathName.includes('ConversionFormula')
                        ? `${hoverTextColor}`
                        : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/ConversionFormula') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('ConversionFormula')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('ConversionFormula')
                      ? `${hoverTextColor}`
                      : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/ConversionFormula');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              }, {
                key: 'CreateImportTemplate',
                className: 'sidebar',
                name: `${t('SUBMENU_CREATE_IMPORT_TEMPLATE')}`,
                iconProps: {
                  iconName: 'FileTemplate',
                  styles: {
                    root: {
                      color: pathName.includes('CreateImportTemplate')
                        ? `${hoverTextColor}`
                        : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/CreateImportTemplate') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('CreateImportTemplate')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('CreateImportTemplate')
                      ? `${hoverTextColor}`
                      : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/CreateImportTemplate');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'Excelview',
                className: 'sidebar',
                name: `${t('SUBMENU_EXCEL_VIEW')}`,
                iconProps: {
                  iconName: 'ExcelDocument',
                  styles: {
                    root: {
                      color: pathName.includes('Excelview')
                        ? `${hoverTextColor}`
                        : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/Excelview') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                //isVisible: true,
                styles: {
                  root: {
                    backgroundColor: pathName.includes('Excelview')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('Excelview')
                      ? `${hoverTextColor}`
                      : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/Excelview');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              }, {
                key: 'CalculatedDataview',
                className: 'sidebar',
                name: `${t('SUBMENU_TIMEDIMENSION_DATAVIEW')}`,
                iconProps: {
                  iconName: 'AnalyticsView',
                  styles: {
                    root: {
                      color: pathName.includes('CalculatedDataview')
                        ? `${hoverTextColor}`
                        : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/CalculatedDataview') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('CalculatedDataview')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('CalculatedDataview')
                      ? `${hoverTextColor}`
                      : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/CalculatedDataview');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'MetricDataDashboard',
                className: 'sidebar',
                name: `${t('SUBMENU_METRIC_DATA_DASHBOARD')}`,
                iconProps: {
                  iconName: 'BarChartVertical',
                  styles: {
                    root: {
                      color: pathName.includes('MetricDataDashboard') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/MetricDataDashboard') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('MetricDataDashboard') ? `${hoverBgColor}` : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('MetricDataDashboard') ? `${hoverTextColor}` : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/MetricDataDashboard');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'user',
                className: 'sidebar',
                name: `${t('MENU_USERS')}`,
                iconProps: {
                  iconName: 'Group',
                  styles: {
                    root: {
                      color: pathName.includes('users/user')
                        ? `${hoverTextColor}`
                        : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/users/user') &&
                  navItemRenderValidation('/users') &&
                  props.location.pathname?.split('/')[1] == 'users',

                styles: {
                  root: {
                    backgroundColor: pathName.includes('users/user')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('users/user') ? hoverTextColor : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/users/user');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'role',
                className: 'sidebar',
                name: `${t('MENU_ROLE')}`,
                iconProps: {
                  iconName: 'PieSingle',
                  styles: {
                    root: {
                      color: pathName.includes('/role') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/users/role') &&
                  navItemRenderValidation('/users') &&
                  props.location.pathname?.split('/')[1] == 'users',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('role') ? `${hoverBgColor}` : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('role') ? `${hoverTextColor}` : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/users/role');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'metaData',
                className: 'sidebar dir',
                name: `${t('MENU_METADATA')}`,
                iconProps: {
                  iconName: 'PhotoCollection',
                  styles: {
                    root: {
                      color: pathName.includes('metaData') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/metaData') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('metaData')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('metaData') ? `${hoverTextColor}` : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/metaData');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'integration',
                className: 'sidebar dir',
                name: `${t('MENU_INTEGRATION')}`,
                iconProps: {
                  iconName: 'PhotoCollection',
                  styles: {
                    root: {
                      color: pathName.includes('integration') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/integration') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('integration')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('integration') ? `${hoverTextColor}` : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/integration');
                  // History.push('/overview');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'query',
                className: 'sidebar',
                name: `${t('SUBMENU_QUERIES')}`,
                iconProps: {
                  iconName: 'ClipboardList',
                  styles: {
                    root: {
                      color: pathName.includes('queries') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/home/queries') &&
                  navItemRenderValidation('/home') &&
                  props.location.pathname?.split('/')[1] == 'home',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('queries')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('queries') ? hoverTextColor : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/home/queries');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'audit',
                className: 'sidebar',
                name: `${t('SUBMENU_ASSESSMENT_GROUPS')}`,
                iconProps: {
                  iconName: 'ClipboardList',
                  styles: {
                    root: {
                      color: pathName.includes('assessmentgroup')
                        ? `${hoverTextColor}`
                        : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/assessmentgroup') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('assessmentgroup')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('assessmentgroup') ? hoverTextColor : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/assessmentgroup');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },
              {
                key: 'process',
                className: 'sidebar',
                name: `${t('SUBMENU_PROCESS')}`,
                iconProps: {
                  iconName: 'FlowChart',
                  styles: {
                    root: {
                      color: pathName.includes('process') ? `${hoverTextColor}` : `${color}`,
                    },
                  },
                },
                isVisible:
                  navItemRenderValidation('/configuration/process') &&
                  navItemRenderValidation('/configuration') &&
                  props.location.pathname?.split('/')[1] == 'configuration',
                styles: {
                  root: {
                    backgroundColor: pathName.includes('process')
                      ? `${hoverBgColor}`
                      : `${bgcolor}`,
                  },
                  label: {
                    fontFamily: `${fontFamily}`,
                    color: pathName.includes('process') ? `${hoverTextColor}` : `${color}`,
                  },
                },
                onClick: () => {
                  navigationFn('/configuration/process');
                  const clicked = 'false';
                  sessionStorage.setItem('Tableclicked', clicked);
                },
              },




            ].filter((item) => item.isVisible)}
            onCollapseChanged={handleCollapseChanged}
          />
        </>
      </div>
    </div>
  );
};

export default withRouter(AppSidebar);
