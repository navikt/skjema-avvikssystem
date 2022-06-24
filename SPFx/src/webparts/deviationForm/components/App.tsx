import * as React from 'react';
import { useState, useContext } from 'react';
import styles from './App.module.scss';
import { DeviationFormContext } from '../DeviationFormContext';
import { DefaultButton, Link } from 'office-ui-fabric-react';
import DeviationForm from './DeviationForm/DeviationForm';
import strings from 'DeviationFormWebPartStrings';

export interface IDeviationAppProps {
  title: string;
}

const App = ({ title }: IDeviationAppProps) => {
  const context = useContext(DeviationFormContext);
  const [selectedForm, setSelectedForm] = useState(null);

  return (
    <div className={styles.wrapper}>
      {selectedForm ?
        <header>
          <Link onClick={() => setSelectedForm(null)}>{title}</Link>
          {' > '}
          {selectedForm.title}
        </header>
        : <header>{title}</header>}
      {!selectedForm ?
        <>
          <header>{strings.SelectFormText}</header>
          <div className={styles.forms}>
            {context.forms.map((form) => (
              <DefaultButton text={form.title} onClick={() => setSelectedForm(form)} />
            ))}
          </div>
        </>
        :
        <DeviationForm form={selectedForm} />
      }
    </div>
  );
};

export default App;
