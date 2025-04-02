declare interface IDeviationFormWebPartStrings {
  SettingsGroupName: string;
  WebpartTitleLabel: string;
  FunctionURLLabel: string;
  EnvironmentSettingLabel: string;
  EnvironmentProd: string;
  EnvironmentTest: string;
  On: string;
  Off: string;
  DebugModeToggleLabel: string;
  DebugNAVIdentSettingLabel: string;
  DebugOrganizationSettingLabel: string;
  DebugUnitNumberSettingLabel: string;
  SelectFormText: string;
  SummaryConfirmationPersonaldata: string
  SummaryConfirmation: string;
  SearchCaseButtonText: string;
  SearchCaseSafetyRepresentativeButtonText: string;
  SearchCaseHeaderText: string;
  Yes: string;
  No: string;
}

declare module 'DeviationFormWebPartStrings' {
  const strings: IDeviationFormWebPartStrings;
  export = strings;
}
