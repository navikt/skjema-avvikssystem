import * as React from 'react';
import { useState, useContext } from 'react';
import styles from './App.module.scss';
import { DeviationFormContext } from '../DeviationFormContext';
import { Callout, DefaultButton, DirectionalHint, Link } from 'office-ui-fabric-react';
import DeviationForm from './DeviationForm/DeviationForm';
import strings from 'DeviationFormWebPartStrings';
import { DescriptionType } from '../types';

export interface IDeviationAppProps {
  title: string;
}

const App = ({ title }: IDeviationAppProps) => {
  const context = useContext(DeviationFormContext);
  const defaultCalloutProps = { display: false, button: null };
  const [selectedForm, setSelectedForm] = useState(null);
  const [calloutProps, setCalloutProps] = useState(defaultCalloutProps);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
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
              {context.forms.map((form, i) => {
                const buttonId = `callout-button-${i}`;
                return (
                  <>
                    {form.description && calloutProps.display && calloutProps.button === buttonId &&
                      <Callout
                        target={`#${buttonId}`}
                        directionalHint={DirectionalHint.rightCenter}
                      >
                        {form.description.type === DescriptionType.Text && <div>{form.description.content}</div>}
                        {form.description.type === DescriptionType.HTML && <div dangerouslySetInnerHTML={{ __html: form.description.content }} />}
                      </Callout>}
                    <DefaultButton id={buttonId} text={form.title} onClick={() => setSelectedForm(form)} onMouseEnter={() => setCalloutProps({ display: true, button: buttonId })} onMouseLeave={() => setCalloutProps(defaultCalloutProps)} />
                  </>
                );
              })}
            </div>
          </>
          :
          <DeviationForm form={selectedForm} />
        }
      </div>
    </div>
  );
};

export default App;
