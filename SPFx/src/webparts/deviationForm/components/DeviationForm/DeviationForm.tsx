import { PrimaryButton } from '@microsoft/office-ui-fabric-react-bundle';
import { flatten } from '@microsoft/sp-lodash-subset';
import { ChoiceGroup, DatePicker, DefaultButton, Dropdown, getDatePartHashValue, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import ActionsHandler from '../../../../config/ActionsHandler';
import { IDeviationForm, IDeviationFormAction, IDeviationFormField, DeviationFormPageType, DeviationActionType, DeviationActionIconPosition } from '../../types';
import styles from './DeviationForm.module.scss';

export interface IDeviationFormProps {
    form: IDeviationForm;
}

const DeviationForm = ({ form }: IDeviationFormProps) => {
    const [state, setState] = useState({ currentPageNumber: 1, values: {}, valid: false });
    const prevPageRef = useRef(state.currentPageNumber);
    const actionsHandler = new ActionsHandler(setState);

    useEffect(() => {
        const [page] = form.pages.filter(p => p.key === state.currentPageNumber);
        if (page.type === DeviationFormPageType.Input) {
            const valid = page.fields.filter(f => eval(f.required)).every(f => state.values[f.key]);
            setState({ ...state, valid });
            if (page.fields.every(f => eval(f.hidden))) {
                const nextPageNumber = prevPageRef.current < state.currentPageNumber ? state.currentPageNumber + 1 : state.currentPageNumber - 1;
                setState({ ...state, currentPageNumber: nextPageNumber });
            }
        }

        prevPageRef.current = state.currentPageNumber;
    }, [state.values, state.currentPageNumber]);

    console.log(state.currentPageNumber);

    const renderField = (field: IDeviationFormField) => {
        let options;

        if (!eval(field.hidden)) {
            switch (field.type) {
                case 'Choice':
                    if (typeof field.options === 'string') {
                        options = eval(field.options).map(o => ({ key: o, text: o }));
                    } else options = field.options.map(o => ({ key: o, text: o }));
                    return (
                        <div className={styles.field}>
                            <Dropdown
                                label={field.label}
                                selectedKey={state.values[field.key]}
                                required={eval(field.required)}
                                options={options}
                                onChange={(_, option) => setState({ ...state, values: { ...state.values, [field.key]: option.text } })}
                            />
                        </div>
                    );
                case 'ChoiceGroup':
                    if (typeof field.options === 'string') {
                        options = eval(field.options).map(o => ({ key: o, text: o }));
                    } else options = field.options.map(o => ({ key: o, text: o }));
                    return (
                        <div className={styles.field}>
                            <ChoiceGroup
                                label={field.label}
                                selectedKey={state.values[field.key]}
                                required={eval(field.required)}
                                options={options}
                                onChange={(_, option) => setState({ ...state, values: { ...state.values, [field.key]: option.text } })}
                            />
                        </div>
                    );
                case 'Text':
                    return (
                        <TextField
                            label={field.label}
                            value={state.values[field.key]}
                            required={eval(field.required)}
                            onChange={(_, value) => setState({ ...state, values: { ...state.values, [field.key]: value } })}
                            multiline={eval(field.multiline)}
                        />
                    );
                case 'Date':
                    return (
                        <DatePicker
                            label={field.label}
                            value={state.values[field.key]}
                            onSelectDate={date => setState({ ...state, values: { ...state.values, [field.key]: date } })}
                            isRequired={eval(field.required)}
                        />
                    );

                default:
                    break;
            }
        }
    };

    const renderSummary = (values: any) => {
        const fields = flatten(form.pages.filter(p => p.type === DeviationFormPageType.Input).map(p => p.fields.filter(f => !eval(f.hidden)).map(f => ({ field: f.label || p.title, value: values[f.key] }))));
        console.log(fields);
        const getValue = (value: any) => {
            if (value instanceof Date) return value.toLocaleDateString();
            return value;
        };
        return (
            <div className={styles.summaryFields}>
                {fields.map(f => (
                    <div className={styles.summaryField}>
                        <div className={styles.summaryFieldLabel}>{f.field}</div>
                        <div className={styles.summaryFieldValue}>{getValue(f.value)}</div>
                    </div>
                ))}
            </div>
        );
    };

    const getFunctionParams = (params: any) => {
        let functionParams = {};
        for (const key in params) {
            if (key.indexOf('state_') === 0) {
                functionParams[params[key]] = state[params[key]];
            } else if (key === 'setstate') {
                functionParams = { ...functionParams, stateVariable: params[key], state };
            } else functionParams[key] = params[key];
        }
        return functionParams;
    };

    const renderAction = (action: IDeviationFormAction) => {
        const params = getFunctionParams(action.invoke.params);
        const iconRightStyles = { flexContainer: { flexDirection: 'row-reverse' } };
        if (action.type === DeviationActionType.Default)
            return <DefaultButton styles={action.iconPosition === DeviationActionIconPosition.Right && iconRightStyles} iconProps={action.iconProps} text={action.label} disabled={eval(action.disabled)} onClick={() => actionsHandler.invoke(action.invoke.functionName, params)} />;
        if (action.type === DeviationActionType.Primary)
            return <PrimaryButton iconProps={action.iconProps} text={action.label} disabled={eval(action.disabled)} onClick={() => actionsHandler.invoke(action.invoke.functionName, params)} />;
    };

    return (
        <div>
            {form.pages.filter(page => page.key === state.currentPageNumber)
                .map(page => (
                    <div className={styles.page}>
                        <header>{page.title}</header>
                        {page.type === DeviationFormPageType.Input &&
                            page.fields?.map(field => renderField(field))
                        }
                        {page.type === DeviationFormPageType.Summary &&
                            renderSummary(state.values)
                        }
                        <div className={styles.actions}>
                            {page.actions?.map(action => renderAction(action))}
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default DeviationForm;