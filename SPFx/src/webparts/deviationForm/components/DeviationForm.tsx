import * as React from 'react';
import styles from './DeviationForm.module.scss';
import { IDeviationFormProps } from './IDeviationFormProps';

const DeviationForm = ({ title }: IDeviationFormProps) => {
  return (
    <div className={styles.deviationForm}>
      <header>{title}</header>
    </div>
  );
};

export default DeviationForm;