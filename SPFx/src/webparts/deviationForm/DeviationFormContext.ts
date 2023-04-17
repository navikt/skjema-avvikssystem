import { createContext } from 'react';
import { IAppConfig } from './types';

export interface IDeviationFormContext {
    config: IAppConfig;
    organization: string;
    unit: string;
    reporterEmail: string;
    reporterNAVIdentId: string;
    functionUrl: string;
    orgUnits: string[];
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
