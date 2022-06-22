import { createContext } from 'react';
import { IDeviationForm } from './types';

export interface IDeviationFormContext {
    forms: IDeviationForm[];
}

export const DeviationFormContext = createContext<IDeviationFormContext>(null);
