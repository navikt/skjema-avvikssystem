import { IIconProps } from "office-ui-fabric-react";

export enum DeviationFormPageType {
    Input = "Input",
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
    actions: IDeviationFormAction[];
}

export interface IDeviationForm {
    title: string;
    pages: IDeviationFormPage[];
    conditionalOptions?: IDeviationFormConditionalOptions;
}