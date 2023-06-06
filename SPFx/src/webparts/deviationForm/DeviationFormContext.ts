import { createContext } from 'react';
import { IAppConfig, IOrgUnitOption } from './types';

export interface IDeviationFormContext {
    config: IAppConfig;
    organization: string;
    unit: string;
    reporterEmail: string;
    reporterNAVIdentId: string;
    functionUrl: string;
    orgUnits: IOrgUnitOption[];
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
