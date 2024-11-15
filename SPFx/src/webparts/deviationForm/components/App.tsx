import * as React from 'react';
import { useState, useContext } from 'react';
import styles from './App.module.scss';
import { DeviationFormContext } from '../DeviationFormContext';
import { DefaultButton, Link, PrimaryButton, SearchBox, Spinner, SpinnerSize, TeachingBubble } from '@fluentui/react';
import DeviationForm from './DeviationForm/DeviationForm';
import strings from 'DeviationFormWebPartStrings';
import { IBubbleState, IGetCaseParameters } from '../types';
import SearchResult from './SearchResult/SearchResult';
import { useId } from '@fluentui/react-hooks';
import CategoryDescriptionCallout from './CategoryDescriptionCallout/CategoryDescriptionCallout';

export interface IDeviationAppProps {
  title: string;
}

const App: React.FC<IDeviationAppProps> = ({ title }: IDeviationAppProps) => {
  const context = useContext(DeviationFormContext);
  const defaultCalloutProps = { display: false, button: null };
  const initialSearchState = { search: false, caseId: null, result: null, searching: false, isVerneombud: false };
  const [selectedForm, setSelectedForm] = useState(null);
  const [calloutProps, setCalloutProps] = useState(defaultCalloutProps);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [searchState, setSearchState] = useState(initialSearchState);
  const [bubbleState, setBubbleState] = useState<IBubbleState>({ showBubble: false });
  const breadcrumbsId = useId('breadcrumbs');

  const toFormSelection = (): void => {
    setSelectedForm(null);
    setBreadcrumbs([]);
    setBubbleState({ showBubble: false });
    setSearchState(initialSearchState);
  };

  const getCase = async (): Promise<void> => {
    setSearchState({ ...searchState, searching: true });
    const values: IGetCaseParameters = {
      reporterNAVIdentId: context.reporterNAVIdentId,
      avvikNumber: searchState.caseId,
      isVerneombud: searchState.isVerneombud
    };

    const body = JSON.stringify(values);
    const response = await fetch(`${context.functionUrl}&mode=get&environment=${context.environment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const result = await response.json();
    setSearchState({ ...searchState, result, searching: false });
  };

  if (searchState.search) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <header>
            <h2>Fyll inn avviksnummer</h2>
          </header>
          <div className={styles.search}>
            <SearchBox
              ariaLabel='Fyll inn avviksnummer'
              className={styles.searchBox}
              disabled={searchState.searching}
              value={searchState.caseId ?? undefined}
              onChange={(_, val) => setSearchState({ ...searchState, caseId: val })}
              onSearch={() => getCase()}
            />
            <PrimaryButton disabled={searchState.searching} text='Søk' onClick={() => getCase()} />
          </div>
          {searchState.searching ? <Spinner className={styles.searchSpinner} size={SpinnerSize.large} label='Søker...' />
            :
            <SearchResult result={searchState.result} />
          }
          <DefaultButton text='Tilbake' onClick={() => toFormSelection()} />
        </div>
      </div>
    );
  } else return (
    <div className={styles.wrapper}>
      <div role='main' aria-label='content' className={styles.content}>
        {selectedForm &&
          <>
            <header id={breadcrumbsId} role='banner' aria-label='breadcrumbs'>
              <Link onClick={() => toFormSelection()}>{title}</Link>
              {' > '}
              {strings[selectedForm.title] || selectedForm.title}
              {breadcrumbs.length > 0 &&
                <>
                  {' > '}
                  {breadcrumbs.map(b => (strings[b] || b)).join(' > ')}
                </>
              }
            </header>
            {bubbleState.showBubble &&
              <TeachingBubble
                target={`#${breadcrumbsId}`}
                primaryButtonProps={{ children: 'Ok', onClick: () => setBubbleState({ showBubble: false }) }}
                onDismiss={() => setBubbleState({ showBubble: false })}
                headline={bubbleState.bubbleTitle}
              >
                {bubbleState.bubbleText}
              </TeachingBubble>
            }
          </>
        }
        {!selectedForm ?
          <>
            <header role='banner' aria-label={strings.SelectFormText}>
              <h1>{strings.SelectFormText}</h1>
            </header>
            <div className={styles.forms}>
              {context.config.forms.map((form, i) => {
                const buttonId = `callout-button-${i}`;
                const screenReaderTextId = `callout-screen-reader-text-${i}`;
                return (
                  <>
                    {form.description && calloutProps.display && calloutProps.button === buttonId &&
                      <CategoryDescriptionCallout buttonId={buttonId} calloutProps={calloutProps} form={form} screenReaderTextId={screenReaderTextId} />}
                    <DefaultButton
                      id={buttonId}
                      aria-describedby={screenReaderTextId}
                      text={strings[form.title] || form.title}
                      onClick={() => setSelectedForm(form)}
                      onFocus={() => setCalloutProps({ display: true, button: buttonId })}
                      onBlur={() => setCalloutProps(defaultCalloutProps)}
                      onMouseEnter={() => setCalloutProps({ display: true, button: buttonId })}
                      onMouseLeave={() => setCalloutProps(defaultCalloutProps)}
                    />
                  </>
                );
              })}
            </div>
            <header role='banner' aria-label={strings.SearchCaseHeaderText}>
              <h1>{strings.SearchCaseHeaderText}</h1>
            </header>
            <DefaultButton
              className={styles.searchButton}
              text={strings.SearchCaseButtonText}
              iconProps={{ iconName: 'Contact' }}
              onClick={() => setSearchState({ ...searchState, search: true })}
            />
            <DefaultButton
              className={styles.searchButton}
              text={strings.SearchCaseSafetyRepresentativeButtonText}
              iconProps={{ iconName: 'ContactLock' }}
              onClick={() => setSearchState({ ...searchState, search: true, isVerneombud: true })}
            />
          </>
          :
          <DeviationForm
            form={selectedForm}
            setSelectedForm={setSelectedForm}
            toFormSelection={toFormSelection}
            breadcrumbState={{ breadcrumbs, setBreadcrumbs }}
            setBubbleState={setBubbleState}
          />
        }
      </div>
    </div>
  );
};

export default App;
