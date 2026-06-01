import { IDeviationFormState, ISkipPage } from '../webparts/deviationForm/types';

export interface ISwitchFormParams {
    formName: string;
    stateVariable: string;
    state: IDeviationFormState;
    key: string;
    value: any;
    skipPage?: ISkipPage;
    bubble: any;
    setBubbleState: (bubble: any) => void;
}

export interface IPageNavigationParams {
    currentPageNumber: number;
    stateVariable: string;
    state: IDeviationFormState;
}

export interface IFormValues {
    unit?: string;
    anonymous?: boolean;
    reporterEmail?: string;
    reporterNAVIdentId?: string;
    form?: string;
    stateOrMunicipalityService?: string;
    selectedMunicipality?: string;
    category?: string;
    categoryDetails?: string;
    personalInfoLost?: any;
    [key: string]: any;
}

export interface ISubmitState {
    otherUnitNumber?: string;
    [key: string]: any;
}

export interface ISubmitParams {
    values: IFormValues;
    functionUrl: string;
    environment: string;
    stateVariable: string;
    state: IDeviationFormState;
    resultVariable: string;
    fieldsToInclude: string[];
}
