import * as React from 'react';
import { useState, useContext } from 'react';
import styles from './App.module.scss';
import { DeviationFormContext } from '../DeviationFormContext';
import { Callout, DefaultButton, DirectionalHint, Link, PrimaryButton, SearchBox, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import DeviationForm from './DeviationForm/DeviationForm';
import strings from 'DeviationFormWebPartStrings';
import { DescriptionType } from '../types';
import SearchResult from './SearchResult/SearchResult';

export interface IDeviationAppProps {
  title: string;
}

const App = ({ title }: IDeviationAppProps) => {
  const context = useContext(DeviationFormContext);
  const defaultCalloutProps = { display: false, button: null };
  const initialSearchState = { search: false, caseId: null, result: null, searching: false };
  const [selectedForm, setSelectedForm] = useState(null);
  const [calloutProps, setCalloutProps] = useState(defaultCalloutProps);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [searchState, setSearchState] = useState(initialSearchState);

  const toFormSelection = () => {
    setSelectedForm(null);
    setBreadcrumbs([]);
    setSearchState(initialSearchState);
  };

  const getCase = async () => {
    setSearchState({ ...searchState, searching: true });
    const values = {
      reporterNAVIdentId: context.reporterNAVIdentId,
      avvikNumber: searchState.caseId
    };
    const body = JSON.stringify(values);
    const response = await fetch(`${context.functionUrl}&mode=get`, {
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
          <header>Fyll inn id på avviket</header>
          <div className={styles.search}>
            <SearchBox
              className={styles.searchBox}
              disabled={searchState.searching}
              value={searchState.caseId}
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
      <div className={styles.content}>
        {selectedForm &&
          <header>
            <Link onClick={() => toFormSelection()}>{title}</Link>
            {' > '}
            {selectedForm.title}
            {breadcrumbs.length > 0 &&
              <>
                {' > '}
                {breadcrumbs.join(' > ')}
              </>
            }
          </header>
        }
        {!selectedForm ?
          <>
            <header>
              <h1>{strings.SelectFormText}</h1>
            </header>
            <div className={styles.forms}>
              {context.config.forms.map((form, i) => {
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
                    <DefaultButton
                      id={buttonId}
                      ariaDescription={extractContent(form.description?.content)}
                      text={form.title}
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
            <header>
              <h1>{strings.SearchCaseHeaderText}</h1>
            </header>
            <DefaultButton
              className={styles.searchButton}
              text={strings.SearchCaseButtonText}
              iconProps={{ iconName: 'Search' }}
              onClick={() => setSearchState({ ...searchState, search: true })}
            />
          </>
          :
          <DeviationForm form={selectedForm} setSelectedForm={setSelectedForm} toFormSelection={toFormSelection} breadcrumbState={{ breadcrumbs, setBreadcrumbs }} />
        }
      </div>
    </div>
  );
};

const extractContent = (s) => {
  var span = document.createElement('span');
  span.innerHTML = s;
  return span.textContent || span.innerText;
};

export default App;
