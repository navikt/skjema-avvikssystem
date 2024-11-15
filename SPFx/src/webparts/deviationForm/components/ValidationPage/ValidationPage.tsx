import { MessageBar } from '@fluentui/react';
import styles from './ValidationPage.module.scss';
import React, { useEffect, useContext } from 'react';
import { IDeviationFormState, IRenderCondition } from '../../types';
import { getMessageType } from '../../shared';
import { DeviationFormContext } from '../../DeviationFormContext';

export interface IValidationPageProps {
    currentPageNumber: number;
    previousPageNumber: number;
    renderConditions: IRenderCondition[];
    state: IDeviationFormState;
    setPagenumber: (pageNumber: number) => void;
    toFormSelection: () => void;
}

const ValidationPage: React.FC<IValidationPageProps> = ({ currentPageNumber, previousPageNumber, toFormSelection, state, renderConditions, setPagenumber }: IValidationPageProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const context = useContext(DeviationFormContext);

    const runValidation = async (): Promise<void> => {
        if (renderConditions.every(rc => !eval(rc.condition))) {
            const newPageNumber = currentPageNumber + 1;
            setPagenumber(newPageNumber);
        }
    };

    useEffect(() => {
        if (previousPageNumber > currentPageNumber) {
            const newPageNumber = currentPageNumber - 1;
            if (newPageNumber > 0) {
                setPagenumber(newPageNumber)
            } else toFormSelection();
        } else {
            runValidation();
        }
    }, []);

    return (
        <div className={styles.wrapper}>
            {renderConditions.map(rc => {
                if (eval(rc.condition)) {
                    return (
                        <MessageBar messageBarType={getMessageType(rc.type)}>{rc.message}</MessageBar>
                    )
                }
            })}
        </div>
    );
}

export default ValidationPage;