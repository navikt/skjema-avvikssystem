import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import styles from './ValidationPage.module.scss';
import * as React from 'react';

export interface IValidationPageProps {
    currentPageNumber: number;
    previousPageNumber: number;
    setPagenumber: (pageNumber: number) => void;
}

const { useEffect } = React;

const ValidationPage: React.FC<IValidationPageProps> = ({ currentPageNumber, previousPageNumber, setPagenumber }: IValidationPageProps) => {

    useEffect(() => {
        if (previousPageNumber > currentPageNumber) {
            setPagenumber(currentPageNumber - 1);
        } else {
            window.setTimeout(() => {
                setPagenumber(currentPageNumber + 1);
            }, 2000);
        }

    }, []);

    return (
        <div className={styles.wrapper}>
            <Spinner size={SpinnerSize.large} />
        </div>
    );
}

export default ValidationPage;