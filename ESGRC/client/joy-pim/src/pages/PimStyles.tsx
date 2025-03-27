import {
  FontWeights,
  getTheme,
  IButtonStyles,
  ICheckboxStyles,
  IComboBoxStyles,
  IDropdownStyles,
  IIconProps,
  ILabelStyles,
  IModalStyles,
  ISearchBoxStyles,
  IStyleSet,
  mergeStyles,
  mergeStyleSets,
} from '@fluentui/react';
import { createTheme } from '@mui/material/styles';
const fontFamily = 'Montserrat, sans-serif';
const theme = getTheme();
export const PIMButtons: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
    color: '#002E59',
    marginBottom: '6px',
    borderRadius: '20px'
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const PIMButtons11: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
    color: '#7367f0',
    borderRadius: '5px',
    marginBottom: '6px',
    borderColor: '#7367f0',
  },
};
export const PIMButtons112: IButtonStyles = {
  root: {
    padding: 5,
     width: '49%',
    color: '#28c76f',
    borderRadius: '5px',
    marginBottom: '6px',
    borderColor: '#28c76f',
  },
};
export const PIMButtons113: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
    color: '#FF9F43',
    borderRadius: '5px',
    marginBottom: '6px',
    borderColor: '#FF9F43',
  },
};
export const PIMHearderText = {
  root: {
    fontSize: '23px',
  },
};
export const PIMHearderText1 = {
  root: {
    fontSize: '23px',
    marginBottom: '4px',
    color: 'black',
  },
};
export const PIMButtons1: IButtonStyles = {
  root: {
    width: '30%',
    backgroundColor: '#008B8B',
    color: 'White',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const DeactivateButton: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
  },
};
export const PIMHeaderButtonsQc: IButtonStyles = {
  root: {
    padding: 5,
    width: '85%',
  },
};

export const PIMButtonsQc: IButtonStyles = {
  root: {
    padding: 5,
    width: '85%',
    backgroundColor: '#008B8B',
    color: 'White',
    marginBottom: '6px',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};

export const PIMcontentStylesQC = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: '70%',
    minHeight: '40%',
    height: 'auto',
  },
  QcconfirmContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '60%',
    width: '35%',
    minHeight: '10%',
    height: 'auto',
    borderColor: 'black',
  },
});

export const PIMdropdownStylesDd: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', marginTop: '-2.5%', fontFamily: `${fontFamily}` },
  callout: { minWidth: '150px' },
  dropdownItem: { fontFamily: `${fontFamily}` },
};

export const PIMdropdownStylesQCTab: Partial<IDropdownStyles> = {
  dropdown: {
    width: '89%',
    marginTop: '-39.5%',
    fontFamily: `${fontFamily}`,
    top: '4px',
    marginLeft: '5px',
  },
  callout: {
    minWidth: '150px',
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};
export const AddButton2: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: 'White',
    color: '#35063E',
    borderRadius: '20px',
  },
  rootHovered: {
    backgroundColor: '#35063E',
    color: 'White',
  },
  icon: {
    color: '#35063E',
  },
  iconHovered: {
    color: '#35063E',
  },
};
export const PIMHeaderButtons: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
  },
};
export const DeleteButton: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
    backgroundColor: 'white',
    color: 'red',
    borderColor: 'red',
  },
  rootHovered: {
    backgroundColor: 'red',
    color: 'white',
    borderColor: 'red',
  },
};

export const BorderShadowButton: Partial<IButtonStyles> = {
  root: {
    color: '#008B8B',
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    borderColor: 'white',
    width: '100%',
  },
};

export const searchIcon: IIconProps = { iconName: 'Search' };
export const removeIcon: IIconProps = { iconName: 'Delete' };

export const PIMattributeSelect: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
    backgroundColor: 'white',
    borderColor: 'white',
  },
};

export const PIMsearchBoxStyles: Partial<ISearchBoxStyles> = {
  root: {
    width: '100%',
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    marginBottom: 10,
    borderRadius: '20px',
  },
};

export const PIMDropdownStyles: Partial<IDropdownStyles> = {
  root: {
    whiteSpace: 'nowrap',
  },
};

export const PIMRemoveButton: Partial<IButtonStyles> = {
  root: {
    color: 'red',
  },
  rootHovered: {
    backgroundColor: 'darkred',
    color: 'white',
  },
};
export const PIMfooterButtonCancel: Partial<IButtonStyles> = {
  root: {
    width: '100%',
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    backgroundColor: 'red',
    color: 'White',
    borderRadius: '10px',
  },
  rootHovered: {
    backgroundColor: 'white',
  },
};
export const customModalStyles: Partial<IModalStyles> = {
  main: {
    width: '32%',
    maxWidth: 'none',
  },
};
export const PIMfooterButtonCancel1: Partial<IButtonStyles> = {
  root: {
    width: '100%',
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    backgroundColor: 'red',
    color: 'White',
    borderRadius: '10px',
    marginTop: '6px',
  },
  rootHovered: {
    backgroundColor: 'white',
  },
};
export const iconButtonStylesImg: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    backgroundColor: 'lighblue',
    fontWeight: '999',
    marginRight: '2.5px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};
export const PIMfooterButtonConfirm: Partial<IButtonStyles> = {
  root: {
    width: '100%',
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    backgroundColor: '#008B8B',
    color: 'white',
  },
  rootHovered: {
    backgroundColor: 'white',
  },
};
export const PIMfooterButtonConfirm1: Partial<IButtonStyles> = {
  root: {
    width: '100%',
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    marginTop: '10%',
    backgroundColor: '#008B8B',
    color: 'white',
  },
  rootHovered: {
    backgroundColor: 'white',
  },
};
export const DataButton: Partial<IButtonStyles> = {
  root: {
    marginLeft: '-20%',
    marginRight: '30%',
  },
};
export const CheckboxStyles: Partial<ICheckboxStyles> = {
  root: {
    marginLeft: '20px',
  },
};

export const activeText = mergeStyles({
  alignContent: 'center',
  fontWeight: 'bold',
  fontSize: '18px',
  width: '100%',
  fontFamily: `${fontFamily}`,
  color: 'black',
  display: 'flex',
  justifyContent: 'center',
});
export const activeText1 = mergeStyles({
  alignContent: 'center',
  fontWeight: 'bold',
  fontSize: '18px',
  width: '100%',
  marginTop: '10px',
  fontFamily: `${fontFamily}`,
  color: 'black',
  display: 'flex',
  justifyContent: 'center',
});
export const PIMDropdownStyles1: Partial<IDropdownStyles> = {
  root: {
    whiteSpace: 'nowrap',
  },
  callout: {
    minWidth: '310px',
  },
};

export const PIMDropdownStyles3: Partial<IDropdownStyles> = {
  root: {
    whiteSpace: 'nowrap',
  },
  callout: {
    minWidth: '99px',
  },
};
export const PIMDropdownStyles4: Partial<IDropdownStyles> = {
  root: {
    whiteSpace: 'nowrap',
  },
  callout: {
    minWidth: '138px',
  },
};
export const PIMDropdownStyles11: Partial<IDropdownStyles> = {
  root: {
    whiteSpace: 'nowrap',
  },
  callout: {
    minWidth: '310px',
  },
};
export const PIMdropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', fontFamily: `${fontFamily}` },
  callout: {
    minWidth: '230px',
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};
export const PIMdropdownStyles2: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', marginTop: '-1.5%', fontFamily: `${fontFamily}`, top: '4px' },
  callout: {
    minWidth: '150px',
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};
export const PIMdropdownStyles1: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', fontFamily: `${fontFamily}` },
  callout: {
    minWidth: '150px',
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};
export const PIMdropdownStyles21: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', marginTop: '-2.2%', fontFamily: `${fontFamily}`, top: '3.1px' },
  callout: {
    minWidth: '150px',
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};

export const PIMdropdownStyles22: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', marginTop: '-2.2%', fontFamily: `${fontFamily}`, top: '-0.8px' },
  callout: {
    minWidth: '150px',
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};

export const productDropdown: Partial<IDropdownStyles> = {
  dropdown: { width: '100%', fontFamily: `${fontFamily}` },
  callout: {
    minWidth: '300px',
  },
  dropdownItem: { width: '200%', fontFamily: `${fontFamily}` },
};
export const AttributeheadDropdown: Partial<IDropdownStyles> = {
  dropdown: {
    width: '100%',
    backgroundColor: 'blue',
    color: 'blue',
    fontWeight: 'bold',
    fontFamily: `${fontFamily}`,
  },
  dropdownItem: { fontFamily: `${fontFamily}` },
};
export const clearBtnStyle: Partial<IButtonStyles> = { root: { width: '425%' } };
export const PIMComboBoxStyles: Partial<IComboBoxStyles> = {
  root: {
    width: '100%',
    fontFamily: `${fontFamily}`,
  },
  optionsContainerWrapper: {
    width: '200px',
    fontFamily: `${fontFamily}`,
  },
};
export const PIMMessageBarStyle: Partial<any> = {
  root: {
    position: 'absolute',
    zIndex: 9999999,
    boxShadow: '0 0 3px 1px #afafaf',
    width: 'auto',
    alignContent: 'center',
    left: '40%',
    float: 'center',
    height: '20px',
    minWidth: '40px',
  },
};
export const EditButtons: Partial<any> = {
  root: {
    fontWeight: 'bold',
  },
};
export const PIMrootClass = mergeStyles({ width: '100%' });
export const Column = mergeStyles({
  backgroundColor: 'grey',
  color: 'grey',
});
export const columndata = mergeStyles({
  fontSize: '15px',
  fontFamily: `${fontFamily}`,
});
export const HeadText = mergeStyles({ color: 'blue', fontFamily: `${fontFamily}` });
export const columnHeader = mergeStyles({
  fontWeight: 'bold',
  fontSize: '15px',
  fontFamily: `${fontFamily}`,
  color: '#002E59',
});
export const columnHeaderPlano = mergeStyles({
  fontWeight: 'bold',
  fontSize: '15px',
  fontFamily: `${fontFamily}`,
  paddingTop: '4px',
  paddingBottom: '4px',
});
export const hyperlink = mergeStyles({
  color: 'black',
  textDecoration: 'underline',
  cursor: 'pointer',
  transition: 'transform 0.09s ease-in-out',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
      color: 'black',
    },
  },
});

export const HeadInfo = mergeStyles({
  color: 'black',
  fontFamily: `${fontFamily}`,
  fontWeight: 'bold',
  marginTop: '18px',
});
export const customStyles = {
  table: {
    style: {
      backgroundColor: 'var(---table-background-color)', // Table background color
    },
  },
  rows: {
    style: {
      backgroundColor: 'var(---table-background-color)', // Row background color
      // marginBottom: '5px', // Adds space between rows
      // padding: '2px solid #ffffff', // White color between rows (padding effect)
      color: 'var(---table-font-color) !important',
      '&:nth-of-type(odd)': {
        backgroundColor: 'var(---table-background-color)', // Alternate row background color
        color: 'var(---table-font-color) !important'
      },
      '&:hover': {
        backgroundColor: 'var(---table-hover-color) !important', // Hover row background color
        color: 'var(---table-font-color) !important', // Force hover text color to white
      },
      '&:selected': {
        backgroundColor: 'var(---table-hover-color) !important', // Selected row background color
        color: 'var(---table-font-color) !important', // Force selected row text color to white
      },
    },
  },
  headCells: {
    style: {
      backgroundColor: 'var(---table-background-color) !important', // Header background color
      color: 'var(---table-font-color) !important', // Header text color
    },
  },
  cells: {
    style: {
      color: 'var(---table-font-color) !important', // Cell text color
    },
  },
  pagination: {
    style: {
      backgroundColor: 'var(---table-background-color) !important', // Footer background color (pagination section)
      color: 'var(---table-font-color) !important', // Footer text color
    },
  },
  footer: {
    style: {
      backgroundColor: 'var(---table-background-color)', // Custom footer background color
      color: 'var(---table-font-color) !important', // Footer text color
      padding: '10px', // Footer padding for space
    },
  },
};

export const PIMcontentStyles = mergeStyleSets({
  Approver: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '30%',
    width: 'auto',
    minHeight: '10%',
    height: 'auto',
    borderColor: 'black',
  },
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: '30%',
    minHeight: '40%',
    height: 'auto',
    maxHeight: 'calc(100% - 28px)',
  },
  confirmContaineruser: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '26%',
    width: 'auto',
    minHeight: '19%',
    height: 'auto',
    borderColor: 'black',
    borderRadius: '20px'
  },
  container1: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: '30%',
    minHeight: '30%',
    height: 'auto',
  },
  attributeContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: '35%',
    minHeight: '40%',
    height: 'auto',
    borderRadius: '20px'
  },
  tableContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '30%',
    width: 'auto',
    minHeight: '50%',
    maxHeight: '90%',
    height: 'auto',
    marginTop: '4%',
    borderRadius: '20px'
  },
  confirmContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    borderRadius: '20px',
    minWidth: '28%',
    width: 'auto',
    minHeight: '10%',
    height: 'auto',
    borderColor: 'black',
  },
  confirmContainerStudio: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    borderRadius: '20px',
    minWidth: '30%',
    width: '35%',
    minHeight: '10%',
    height: 'auto',
    borderColor: 'black',
    position: 'fixed',
  },
  confirmContainer1: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '35%',
    width: 'auto',
    minHeight: '25%',
    height: 'auto',
    borderColor: 'black',
    borderRadius: '2px',
  },
  ExcelContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '40%',
    height: 'auto',
    borderRadius: '20px'
  },
  ExcelContainer1: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '40%',
    minheight: '-30%',
  },
  ExcelContainerPS: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '35%',
    minheight: '-100%',
  },
  header: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '9px 14px 2px 14px',
      height: '60px',
    },
  ],
  header2: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '9px 7px px 5px',
      height: '30px',
    },
  ],
  header1: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '17px 0px 9px 24px',
      height: '60px',
    },
  ],
  popupHeader: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: FontWeights.semibold,
      padding: '9px 14px 2px 14px',
      height: '60px',
    },
  ],
  confirmHeaderUser: [
    {
      flex: '1 1 auto',
      alignItems: 'center',
      height: '21%',
      padding: '10px 0px 0px 322px',
      marginBottom: '-10%',
    },
  ],
  confirmHeader: [
    {
      flex: '1 1 auto',
      alignItems: 'center',
      height: '10px',
      padding: '12px 12px 14px 24px',
      display: 'flex',
      marginBottom: '-10%',
    },
  ],
  body: {
    flex: '4 4 auto',
    overflowY: 'hidden',
    display: 'block',
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    minHeight: '35%',
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: '5%',
    fontFamily: 'Montserrat, sans-serif',
  },
  attributeBody: {
    flex: '4 4 auto',
    display: 'block',
    alignItems: 'center',
    width: '100%',
    overflowY: 'hidden',
  },
  attributeBody1: {
    marginLeft: '43px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  attributeBody12: {
    marginLeft: '35px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  attributeBodyStudio: {
    marginTop: '2%',
    marginLeft: '38px',
    fontWeight: 'bold',
    marginBottom: '-8px',
  },
  attributeBodyStudioActive: {
    // marginTop: '-1%',
    marginLeft: '38px',
    fontWeight: 'bold',
    // marginBottom: '-5px',
  },
  attributeBody2: {
    marginLeft: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  confirmbody: {
    flex: '4 4 auto',
    overflowY: 'hidden',
    display: 'block',
    alignItems: 'center',
    width: 'auto',
    marginTop: '10%',
    marginLeft: '5%',
    marginRight: '2%',
  },
  confirmbody1: {
    flex: '4 4 auto',
    overflowY: 'hidden',
    display: 'block',
    alignItems: 'center',
    width: 'auto',
    marginTop: '5%',
    marginBottom: '2%',
    marginRight: '2%',
  },
  confirmbody2: {
    flex: '4 4 auto',
    overflowY: 'hidden',
    display: 'block',
    alignItems: 'center',
    width: 'auto',
    marginTop: '10%',
    marginLeft: '8%',
    marginRight: '2%',
    minWidth: '38%',
    minHeight: '20%',
  },
  confirmbody3: {
    flex: '4 4 auto',
    overflowY: 'hidden',
    display: 'block',
    alignItems: 'center',
    width: 'auto',
    marginTop: '10%',
    marginLeft: '15%',
    marginRight: '2%',
    minWidth: '38%',
    minHeight: '20%',
  },
  rejectPopup: {
    flex: '4 4 auto',
    overflowY: 'hidden',
    display: 'block',
    alignItems: 'center',
    width: '85%',
    height: 'auto',
    minHeight: '35%',
    marginLeft: '8%',
    marginRight: '5%',
    marginBottom: '5%',
    fontFamily: 'Montserrat, sans-serif',
  },
  progressBarModal: {
    width: '30vw !important',
    height: '10vh !important',
    minHeight: '0px !important',
  },
  footer: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
      width: 'auto',
      // minWidth: '50%',
      // marginLeft: '20%',
      // marginRight: '20%',
    },
  ],
  footers: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '0px 0px 20px 0px',
      width: 'auto',
    },
  ],
  editFooter: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
      width: 'auto',
      minWidth: '50%',
    },
  ],
  Excelfooter: {
    flex: '1 1 auto',
    color: theme.palette.neutralPrimary,
    display: 'flex',
    alignItems: 'center',
    fontWeight: FontWeights.semibold,
    padding: '12px 12px 14px 24px',
    width: 'auto',
    marginLeft: '20%',
    marginRight: '20%',
  },
  imageContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '500px',
    width: 'auto',
    minHeight: '500px',
    height: 'auto',
  },
  fullImageContainer: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  imageContainerPhotoshote: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '400px',
    width: '60%',
    minHeight: '500px',
    height: 'auto',
  },
  SaveContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    minWidth: '500px',
    width: 'auto',
    minHeight: '150px',
    height: 'auto',
    borderRadius: '4px',
  },
  imagebody: {
    flex: '4 4 auto',
    // overflowY: 'auto',
    display: 'block',
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    minHeight: '300px',
    minWidth: '300px',
    marginLeft: '5%',
    marginRight: '5%',
    marginBottom: '5%',
  },
});

export const PIMsearchBoxStyles123: Partial<ISearchBoxStyles> = {
  root: {
    boxShadow: '0 5px 10px rgb(0 0 0 / 0.4)',
    borderColor: 'white',
    marginLeft: '6.6%',
    maxWidth: '85%',
    width: '100%',
  },
};
export const PIMButtons123: IButtonStyles = {
  root: {
    // marginTop: '100%',
    width: '100%',
    backgroundColor: '#008B8B',
    color: 'White',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};

export const PIMuploadInput = mergeStyles({
  position: 'relative',
  maxWidth: '400px',
  height: '46px',
  zIndex: 2,
  cursor: 'pointer',
  opacity: 0,
  width: '100%',
});

export const PIMuploadButton: Partial<IButtonStyles> = {
  root: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'blue',
    backgroundColor: 'white',
    fontSize: '1.1rem',
    cursor: 'pointer',
    borderRadius: '4px',
    outline: 'none',
    transitionTimingFunction: 'backgroundColor 0.4s',
    boxShadow: '0px 8px 24px rbga(149, 157, 165, 0.4)',
  },
};
export const PIMfileUpload = mergeStyleSets({
  fileCard: {
    border: '1px grey',
    minHeight: '200px',
    width: '100%',
    height: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  fileInput: {
    position: 'relative',
    marginBottom: '1.5em',
    marginLeft: '15%',
    marginRight: '15%',
  },
  listItem: {
    backgroundColor: 'lightgrey',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '50px',
    marginBottom: 5,
  },
  p: {
    flex: 2,
    fontSize: '0.9em',
    marginLeft: 5,
    marginTop: 10,
    width: '90%',
  },
  actions: {
    justifySelf: 'flexEnd',
    cursor: 'pointer',
  },
  fileList: {
    width: '100%',
    height: '2%',
    marginRight: '',
    marginLeft: '',
  },
});

export const chatBoxStyles = mergeStyleSets({
  border: '2px solid rgba(0, 0, 0, 0.05)',
  height: '40%',
  padding: '10px',
  backgroundColor: '#bbdaf8',
});
export const boxStyles = mergeStyleSets({
  border: '2px solid #797775',
  height: 'auto',
  padding: '10px',
  marginTop: '10px',
});
export const ImgIcons = mergeStyleSets({
  width: '85%',
  marginTop: '6px',
});
export const ImgIcons1 = mergeStyleSets({
  width: '50%',
});
export const customTableStyles1 = {
  rows: {
    style: {
      backgroundColor: 'rgb(237, 243, 241)',
    },
  },
};

export const Alartmessage = {
  color: 'red',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '18px',
  borderRadius: '10px',
};

export const CardAlignment = mergeStyleSets({
  card: {
    width: '200%',
    maxWidth: 1150,
    minWidth: 500,
    margin: 20,
    padding: 20,
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    position: 'fixed',
    overflowy: 'auto',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  headerText1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
    textAlign: 'center',
    marginLight: '12px'
  },
  headerText2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  headerText3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    display: 'flex', position: 'relative', justifyContent: 'center'
  },
});
export const CardAlignment1 = mergeStyleSets({
  card: {
    width: '110%',
    maxWidth: 1150,
    minWidth: 500,
    margin: 20,
    padding: 20,
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  headerText3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    display: 'flex', position: 'relative', justifyContent: 'center'
  },
});
export const AddButton: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: '#002E59',
    color: 'White',
    borderRadius: '20px',
    left: '30px',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const CancelButton: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: '#002E59',
    color: 'White',
    borderRadius: '20px',
    left: '10px',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const AddButtonDea: IButtonStyles = {
  root: {
    padding: 5,
    width: '100%',
    backgroundColor: '#002E59',
    color: 'White',
    marginBottom: '6px',
    borderRadius: '20px'
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const AddButton1: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: '#7367f0',
    color: 'White',
    borderRadius: '10px',
    marginTop: '10vh',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const CancelBtn: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: '#C21807',
    color: 'White',
    borderRadius: '10px',
  },
  rootHovered: {
    backgroundColor: '#FF7F7F ',
    color: 'white',
  },
};
export const CancelBtn1: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: 'red',
    color: 'White',
    borderRadius: '10px',
    marginTop: '10vh',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};
export const CancelBtn2: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: 'red',
    color: 'White',
    borderRadius: '10px',
    marginTop: '10px',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};

export const checkMarkIcon = mergeStyleSets({
  color: 'green'
});
export const cancelsIcon = mergeStyleSets({
  color: 'red'
});

export const AddFam: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: '#008000',
    color: 'White',
    borderRadius: '10px',
  },
  rootHovered: {
    backgroundColor: '#50C878',
    color: 'White',
  },
  icon: {
    color: 'White',
  },
  iconHovered: {
    color: 'White',
  },
}
export const AddFams: IButtonStyles = {
  root: {
    width: '11%',
    backgroundColor: '#002e59',
    color: 'White',
    borderRadius: '20px',
  },
  rootHovered: {
    backgroundColor: 'White',
    color: '#002e59',
  },
  icon: {
    color: 'White',
  },
  iconHovered: {
    color: '#002e59',
  },
};
export const pivotLabel: Partial<IStyleSet<ILabelStyles>> = {
  root: { marginTop: 10 }
};

export const PIMsearchBox: Partial<ISearchBoxStyles> = {
  root: {
    width: '100%',
    borderColor: 'white',
    marginBottom: 10,
  },
};
export const PIMsearchBoxs: Partial<ISearchBoxStyles> = {
  root: {
    width: '100%',
    marginBottom: 10,
    borderRadius: '20px',
    selectors: {
      ':focus-within': {
        border: '2px solid #0078d4 !important',
      }
    }
  },
};

export const FamClearBtn: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: 'red',
    color: 'White',
    borderRadius: '10px',
    marginTop: '10px',
  },
  rootHovered: {
    backgroundColor: 'white',
    color: 'black',
  },
};

export const CancelFam: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: 'lightsteelblue',
    color: 'blue',
    borderRadius: '10px',
  },
  rootHovered: {
    backgroundColor: 'lightsteelblue',
    color: 'blue',
  },
  icon: {
    color: 'blue',
  },
  iconHovered: {
    color: 'blue',
  },
};

export const ActiveBTN: IButtonStyles = {
  root: {
    width: '100%',
    backgroundColor: 'blue',
    color: 'White',
    borderRadius: '10px',
  },
  rootHovered: {
    backgroundColor: 'blue',
    color: 'White',
  },
  icon: {
    color: 'White',
  },
  iconHovered: {
    color: 'White',
  },
};

export const expandableTable = mergeStyleSets({
  countCols: {
    border: '1px solid #ddd',
    padding: '8px 16px',
    borderLeft: 'none',
    borderRight: 'none',
    minWidth: '100px',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    WebkitFlexBasis: 0,
  },
  planoDivCol: {
    border: '1px solid #ddd',
    padding: '8px 16px',
    borderLeft: 'none',
    borderRight: 'none',
    minWidth: '105px',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    flexGrow: 1,
    WebkitFlexBasis: 0,
  },
  uidDivCol: {
    border: '1px solid #ddd',
    padding: '8px 16px',
    borderLeft: 'none', borderRight: 'none',
    minWidth: '150px',
    wordWrap: 'break-word',
    flexGrow: 1,
    WebkitFlexBasis: 0,
  },
  expandIconCol: {
    border: '1px solid #ddd',
    padding: '8px 16px',
    borderLeft: 'none',
    borderRight: 'none',
    width: '48px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    maxWidth: '100%'
  },
  row: {
    display: 'flex',
    paddingLeft: '48px'
  },
});

export const UploadBtn: IButtonStyles = {
  root: {
    backgroundColor: '#008000',
    color: 'White',
    borderRadius: '10px',
  },
  rootHovered: {
    backgroundColor: '#50C878',
    color: 'White',
  },
  icon: {
    color: 'White',
  },
  iconHovered: {
    color: 'White',
  },
}

export const createCustomTheme = (primaryColor: string, secondaryColor: string) => {
  return createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
    },
  });
};
