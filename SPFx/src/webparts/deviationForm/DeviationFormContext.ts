import { createContext } from 'react';
import { IAppConfig, IOrgUnitOption, IAgreementOption } from './types';
import { SPFI } from '@pnp/sp';

export interface IDeviationFormContext {
    config: IAppConfig;
    sp: SPFI;
    environment: string;
    organization: string;
    unit: string;
    unitDataAgreement: boolean;
    unitIsKontaktsenter: boolean;
    reporterEmail: string;
    reporterNAVIdentId: string;
    functionUrl: string;
    orgUnits: IOrgUnitOption[];
    agreementOptions: IAgreementOption[];
    unitNumber: string;
    municipalityOrgNumber?: string;
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
