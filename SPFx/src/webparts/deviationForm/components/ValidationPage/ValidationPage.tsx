import { MessageBar, MessageBarType, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import styles from './ValidationPage.module.scss';
import * as React from 'react';
import { SPFI } from '@pnp/sp';
import { IDeviationFormState, IValidationParams, ValidationType } from '../../types';

export interface IValidationPageProps {
    currentPageNumber: number;
    previousPageNumber: number;
    sp: SPFI;
    params: IValidationParams;
    state: IDeviationFormState;
    setPagenumber: (pageNumber: number) => void;
}

const { useEffect, useState } = React;

const ValidationPage: React.FC<IValidationPageProps> = ({ currentPageNumber, previousPageNumber, sp, params, state, setPagenumber }: IValidationPageProps) => {
    const [showError, setShowError] = useState(false);

    console.log(state);

    const runValidation = async () => {
        for (const v of params.validations) {
            if (v.type === ValidationType.SPList) {
                const value = eval(v.stateVariable);
                const filter = v.filter.replace('{variable}', value);
                const [item] = await sp.web.lists.getByTitle(v.listName).items.filter(filter)();
                if (!item) {
                    setShowError(true);
                } else setPagenumber(currentPageNumber + 1);
            }
        }
    };

    useEffect(() => {
        if (previousPageNumber > currentPageNumber) {
            setPagenumber(currentPageNumber - 1);
        } else {
            runValidation();
        }
    }, []);

    return (
        <div className={styles.wrapper}>
            {showError ? <MessageBar messageBarType={MessageBarType.error}>{params.errorMessage}</MessageBar>
                :
                <Spinner size={SpinnerSize.large} />
            }
        </div>
    );
}

export default ValidationPage;