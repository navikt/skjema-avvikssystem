import * as React from 'react';
import { useState } from 'react';
import styles from './DeviationForm.module.scss';
import { IDeviationFormProps } from './IDeviationFormProps';
import ActionsHandler from '../../../config/ActionsHandler';

const DeviationForm = ({ title }: IDeviationFormProps) => {
  const actionsHandler = new ActionsHandler();

  const [currentPageNumber, setPageNumber] = useState(1);
  

  return (
    <div className={styles.deviationForm}>
      <header>{title}</header>
    </div>
  );
};

export default DeviationForm;
