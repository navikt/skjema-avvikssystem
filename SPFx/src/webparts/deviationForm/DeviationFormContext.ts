import { createContext } from 'react';
import { IAppConfig, IOrgUnitOption } from './types';
import { SPFI } from '@pnp/sp';
import { IDropdownOption } from '@fluentui/react';

export interface IDeviationFormContext {
    config: IAppConfig;
    sp: SPFI;
    environment: string;
    organization: string;
    unit: string;
    unitDataAgreement: boolean;
    reporterEmail: string;
    reporterNAVIdentId: string;
    functionUrl: string;
    orgUnits: IOrgUnitOption[];
    agreementOptions: IDropdownOption[];
    municipalityOrgNumber?: string;
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
