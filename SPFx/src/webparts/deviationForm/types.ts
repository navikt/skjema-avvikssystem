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
    fields: IDeviationFormField[];
    actions: IDeviationFormAction[];
}

export interface IDeviationForm {
    title: string;
    pages: IDeviationFormPage[];
    conditionalOptions?: IDeviationFormConditionalOptions;
}