import { IIconProps } from "office-ui-fabric-react";

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
}

export interface IDeviationFormField {
    key: string;
    type: string;
    label?: string;
    options?: string[] | string;
    required?: string;
    multiline?: string;
    hidden?: string;
}

export interface IDeviationFormPage {
    key: number;
    title: string;
    type: DeviationFormPageType;
    fields: IDeviationFormField[];
    content: string;
    format: string[];
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