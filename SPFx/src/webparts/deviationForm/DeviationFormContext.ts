import { createContext } from 'react';
import { IAppConfig } from './types';

export interface IDeviationFormContext {
    config: IAppConfig;
    organization: string;
    unit: string;
    reporterEmail: string;
    reporterNAVIdentId: string;
    formSubmitURL: string;
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
