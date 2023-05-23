import { IDatePickerStrings, IIconProps } from "office-ui-fabric-react";

export enum DeviationFormPageType {
    Input = "Input",
    Info = "Info",
    Summary = "Summary"
}

export enum DeviationActionType {
    Default = "default",
    Primary = "primary"
}

export enum DeviationActionIconPosition {
    Left = "left",
    Right = "right"
}

export enum DescriptionType {
    Text = "text",
    HTML = "html"
}

export interface IDeviationFormConditionalOptions {
    [key: string]: string[];
}

export interface IDeviationFormActionInvoke {
    functionName: string;
    params: any;
}

export interface IDeviationFormAction {
    key: string;
    label: string;
    invoke: IDeviationFormActionInvoke;
    type: DeviationActionType;
    iconProps?: IIconProps;
    iconPosition?: DeviationActionIconPosition;
    disabled?: string;
    addtobreadcrumbs?: string;
    removefrombreadcrumbs?: string;
}

export interface IChoiceInfoText {
    key: string;
    text: string;
}

export interface IDeviationFieldAdditionalData {
    key: string;
    value: string;
}

export interface IDeviationFormField {
    key: string;
    type: string;
    label?: string;
    placeholder?: string;
    description?: string;
    options?: string[] | string;
    multiselect?: string;
    choiceInfoTexts?: IChoiceInfoText[];
    required?: string;
    disabled?: string;
    combobox?: string;
    minDate?: string;
    multiline?: string;
    hidden?: string;
    valid?: string;
    errorMessage?: string;
    defaultValue?: string;
    dynamicValue?: IDynamicValue;
    disabledOptions?: string[];
    additionalData?: IDeviationFieldAdditionalData[];
    infoText?: string;
}

export interface IDeviationPageConfirmation {
    required: boolean;
    field?: IDeviationFormField;
}

export interface IDeviationFormMessage {
    display: string;
    type: string;
    content: string;
}

export interface IDeviationFormPage {
    key: number;
    title: string;
    type: DeviationFormPageType;
    fields: IDeviationFormField[];
    content: string;
    format: string[];
    confirmation?: IDeviationPageConfirmation;
    messages?: IDeviationFormMessage[];
    actions: IDeviationFormAction[];
}

export interface IDeviationFormDescription {
    type: DescriptionType;
    content: string;
}

export interface IDeviationForm {
    title: string;
    description: IDeviationFormDescription;
    pages: IDeviationFormPage[];
    conditionalOptions?: IDeviationFormConditionalOptions;
}
export interface ISearchResultField {
    name: string;
    displayName: string;
    type: string;
}
export interface ISearchResult {
    fields: ISearchResultField[];
}
export interface IAppConfig {
    forms: IDeviationForm[];
    datePickerStrings: IDatePickerStrings;
    searchResult: ISearchResult;
}

export interface IDynamicValue {
    variable: string;
    condition: string;
    value: string;
}

export interface IDeviationFormState {
    currentPageNumber: number;
    values: any;
    valid: boolean;
    summaryConfirmed: boolean;
    submitting: boolean;
    submitResult: string;
}