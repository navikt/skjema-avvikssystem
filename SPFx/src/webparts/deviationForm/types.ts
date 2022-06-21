export interface IDeviationFormActionInvoke {
    functionName: string;
    params: any;
}

export interface IDeviationFormAction {
    key: string;
    label: string;
    invoke: IDeviationFormActionInvoke;
}

export interface IDeviationFormField {
    key: string;
    label: string;
    type: string;
    options?: string[];
}

export interface IDeviationFormPage {
    pageNumber: number;
    fields: IDeviationFormField[];
    actions: IDeviationFormAction[];
}

export interface IDeviationForm {
    pages: IDeviationFormPage[];
}