import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import * as React from 'react';
import strings from 'DeviationFormWebPartStrings';
import styles from './SearchResult.module.scss';
import { ResultField, mapResultFields } from './ResultFields';

export interface ISearchResultProps {
    result: any;
}

const renderItemField = (field: ResultField) => {
    switch (field.Type) {
        case "date":
            field.Value = new Date(field.Value);
            return <span>{field.Value.toLocaleDateString()}</span>;
        case "datetime":
            field.Value = new Date(field.Value);
            return <span>{field.Value.toLocaleString()}</span>;
        case "boolean":
            return <span>{eval(field.Value) ? "Ja" : "Nei"}</span>;
        default:
            return <span>{strings[field.Value] || field.Value}</span>;
    }
};

const SearchResult = ({ result }: ISearchResultProps) => {
    const fields = mapResultFields(result);

    return (
        <>
            {result &&
                <div className={styles.wrapper}>
                    {result.status === 'Failed' ?
                        <MessageBar className={styles.messageBar} messageBarType={MessageBarType.error}>{result?.message}</MessageBar> :
                        <div>
                            {fields.map(field => {
                                if (field.Value) {
                                    return (
                                        <div className={styles.searchResult}>
                                            <label className={styles.label}>{field.DisplayName}</label>
                                            {renderItemField(field)}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    }
                </div>
            }
        </>
    );
};

export default SearchResult;