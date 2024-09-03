import { createContext } from 'react';
import { IAppConfig, IOrgUnitOption } from './types';
import { SPFI } from '@pnp/sp';

export interface IDeviationFormContext {
    config: IAppConfig;
    sp: SPFI;
    environment: string;
    organization: string;
    unit: string;
    reporterEmail: string;
    reporterNAVIdentId: string;
    functionUrl: string;
    orgUnits: IOrgUnitOption[];
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
