import { IDatePickerStrings, IDropdownOption, IIconProps } from '@fluentui/react'

export enum DeviationFormPageType {
    Input = "Input",
    Info = "Info",
    Summary = "Summary",
    Validation = "Validation"
}

export enum DeviationActionType {
    Default = "default",
    Primary = "primary"
}

export enum MessagePosition {
    Top = "top",
    Bottom = "bottom"
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

export type Params = {
    [key: string]: string;
};

export interface IDeviationFormActionInvoke {
    functionName: string;
    params: Params;
    conditionalInvoke?: IConditionalInvoke;
}
export interface IConditionalInvoke {
    condition: string;
    functionName: string;
    params: Params;
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
    dynamicKey?: string;
}

export interface IDeviationFieldAdditionalData {
    key: string;
    value: string;
    fallback?: string;
}

export interface IChoiceFieldOptionType {
    type: string;
    key?: string;
    text?: string;
}

export interface IDeviationFormField {
    key: string;
    type: string;
    label?: string;
    placeholder?: string;
    description?: string;
    options?: string[] | string;
    optionType?: IChoiceFieldOptionType;
    multiselect?: boolean;
    choiceInfoTexts?: IChoiceInfoText[];
    showInSummary?: string;
    required?: string;
    disabled?: string;
    searchable?: boolean;
    minDate?: string;
    multiline?: boolean;
    maxLength?: number;
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
    position: MessagePosition;
}

export interface IDeviationFormPage {
    key: number;
    type: DeviationFormPageType;
    title?: string;
    fields?: IDeviationFormField[];
    content?: string;
    format?: string[];
    disabled?: string;
    renderConditions?: IRenderCondition[];
    confirmation?: IDeviationPageConfirmation;
    messages?: IDeviationFormMessage[];
    actions?: IDeviationFormAction[];
}

export interface ICalloutCategoryDefinition {
    page: number;
    field: string;
}

export interface IDeviationFormDescription {
    type: DescriptionType;
    categories: ICalloutCategoryDefinition;
    contentTemplate: string;
}

export interface IDeviationForm {
    title: string;
    description: IDeviationFormDescription;
    pages: IDeviationFormPage[];
    conditionalOptions?: IDeviationFormConditionalOptions;
}
export interface IAppConfig {
    forms: IDeviationForm[];
    datePickerStrings: IDatePickerStrings;
}

export interface IDynamicValue {
    variable: string;
    condition: string;
    value: string;
}

export interface ISubmitResult {
    status: number;
    text: string;
}

export interface ISkipPage {
    page: number;
    addtobreadcrumbs: string;
}

export interface IFilteredOptions {
    [key: string]: IDropdownOption[];
}

export interface IDeviationFormState {
    currentPageNumber: number;
    values: any;
    valid: boolean;
    summaryConfirmed: boolean;
    submitting: boolean;
    submitResult: ISubmitResult;
    skipPage?: ISkipPage;
    filteredOptions: IFilteredOptions;
    agreement?: boolean;
}

export interface IGetCaseParameters {
    reporterNAVIdentId: string;
    avvikNumber: string;
    isVerneombud?: boolean;
}

export interface IBubbleState {
    showBubble: boolean;
    bubbleTitle?: string;
    bubbleText?: string;
}

export interface IOrgUnit {
    orgEnhet: {
        id?: string;
        navn: string;
        nomNivaa: string | undefined;
        orgEnhetsType?: string | undefined;
        gyldigFom: string;
        gyldigTom: string | undefined;
        organiseringer?: IOrgUnit[];
    };
}

export interface IOrgUnitOption {
    id: string;
    name: string;
    agreement?: boolean;
}

export interface IRenderCondition {
    condition: string;
    message: string;
    type: string;
}