export enum dataTypes {
  optionSet = 1,
  yesNo = 2,
  dateTime = 3,
  number = 4,
  text = 5,
}
export enum IsActive {
  true = 1,
  false = 0,
}

export const API_ENDPOINT = 'https://localhost:5001';

export class AddorUpdateUser {
  firstName: string | undefined;
  lastName: string | undefined;
  mobile: string | undefined;
  email: string | undefined;
}

export enum geoGraphyEnum {
  country = 'Country',
  state = 'State',
  zone = 'Zone',
  district = 'District',
  city = 'City',
}

export enum metricDataType {
  Boolean = 1,
  Percentage = 2,
  Paragraph = 3,
  NumberField = 4,
  TextArea = 5,
  TextField = 6,
  Quill = 7,
  Price = 8,
  File = 9,
  Image = 10,
  CheckBox = 11,
  LookUp = 12,
  Measurements = 13,
  MultiSelect = 14,
  Identity = 15,
  DateTime = 16,
  RadioButton = 17,
  SimpleSelect = 18,
  Email = 19,
}

export enum metricValidationEnum {
  required = 4,
  mobileNumber = 5,
  email = 1,
}

export enum TemplateStageApprovalEnum {
  Completed = 1,
  Error = 2,
  QueryRaised = 3,
  Rejected = 4,
  Success = 5,
  Pending = 6,
  Yettostart = 7,
  Approved = 8,
  Expired = 9,
  Responded = 10,
}

export enum RoleEnum {
  Admin = 10,
  PowerUser = 11,
  SocialUser = 22,
  GovernanceUser = 23,
  Approver = 24,
}

export enum queriesEnum {
  Queryraised = 'QueryRaised',
  QueryResponsed = 'QueryResponsed',
}

export enum RegulationTypeEnum {
  Regulation = 4,
  Control = 5,
}
