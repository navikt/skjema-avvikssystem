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
    label: string;
    type: string;
    options?: string[];
    required?: string;
}

export interface IDeviationFormPage {
    key: number;
    fields: IDeviationFormField[];
    actions: IDeviationFormAction[];
}

export interface IDeviationForm {
    title: string;
    pages: IDeviationFormPage[];
}