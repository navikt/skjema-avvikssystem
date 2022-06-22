import * as React from 'react';
import { useState, useContext } from 'react';
import styles from './App.module.scss';
import ActionsHandler from '../../../config/ActionsHandler';
import { DeviationFormContext } from '../DeviationFormContext';
import { PrimaryButton } from 'office-ui-fabric-react';
import DeviationForm from './DeviationForm/DeviationForm';

export interface IDeviationAppProps {
  title: string;
}

const App = ({ title }: IDeviationAppProps) => {
  const context = useContext(DeviationFormContext);

  const [selectedForm, setSelectedForm] = useState(null);


  return (
    <div className={styles.wrapper}>
      <header>{title}</header>
      {!selectedForm ?
        context.forms.map((form) => (
          <PrimaryButton text={form.title} onClick={() => setSelectedForm(form)} />
        ))
        :
        <DeviationForm form={selectedForm} />
      }
    </div>
  );
};

export default App;
