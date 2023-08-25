import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState, useContext } from 'react';
import { DeviationFormContext } from '../../DeviationFormContext';
import styles from './SearchResult.module.scss';
import { omit } from 'lodash';
import { ISearchResultField } from '../../types';

export interface ISearchResultProps {
    result: any;
}

const renderItemField = (item: any, field: ISearchResultField) => {
    let value = item[field.name];
    switch (field.type) {
        case "string":
            return <span>{value}</span>;
        case "date":
            value = new Date(value);
            return <span>{value.toLocaleDateString()}</span>;
        case "boolean":
            return <span>{value ? "Ja" : "Nei"}</span>;
        case "user":
            return <span>{value.Name}</span>;
        default:
            break;
    }
};

console.log('Test');

const SearchResult = ({ result }: ISearchResultProps) => {
    const context = useContext(DeviationFormContext);
    const item = omit(result, ['attributes', 'id', 'OwnerId']);
    
    return (
        <>
            {result &&
                <div className={styles.wrapper}>
                    {result.status === 'Failed' ?
                        <MessageBar className={styles.messageBar} messageBarType={MessageBarType.error}>{result?.message}</MessageBar> :
                        <div>
                            {context.config.searchResult.fields.map(field => {
                                if (item.hasOwnProperty(field.name)) return (
                                    <div className={styles.searchResult}>
                                        <label className={styles.label}>{field.displayName}</label>
                                        {renderItemField(item, field)}
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
            }
        </>
    );
};

export default SearchResult;