import { createContext } from 'react';
import { IDeviationForm } from './types';

export interface IDeviationFormContext {
    forms: IDeviationForm[];
    organization: string;
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
