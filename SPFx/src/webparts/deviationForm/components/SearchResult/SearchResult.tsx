import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState, useContext } from 'react';
import { DeviationFormContext } from '../../DeviationFormContext';
import styles from './SearchResult.module.scss';
import { omit } from 'lodash';

export interface ISearchResultProps {
    result: any;
}

const SearchResult = ({ result }: ISearchResultProps) => {
    const context = useContext(DeviationFormContext);
    return (
        <>
            {result &&
                <div>
                    {result.status === 'Failed' ?
                        <MessageBar className={styles.messageBar} messageBarType={MessageBarType.error}>{result?.message}</MessageBar> :
                        <div>
                            {Object.keys(omit(result, ['attributes', 'id', 'OwnerId'])).map(key => (
                                <div>{result[key].toString()}</div>
                            ))}
                        </div>
                    }
                </div>
            }
        </>
    );
}

export default SearchResult;