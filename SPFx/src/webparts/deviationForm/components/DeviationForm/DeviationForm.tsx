import { PrimaryButton } from '@microsoft/office-ui-fabric-react-bundle';
import { ChoiceGroup, Dropdown, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState } from 'react';
import ActionsHandler from '../../../../config/ActionsHandler';
import { IDeviationForm, IDeviationFormAction, IDeviationFormField } from '../../types';
import styles from './DeviationForm.module.scss';

export interface IDeviationFormProps {
    form: IDeviationForm;
}

const DeviationForm = ({ form }: IDeviationFormProps) => {
    const [state, setState] = useState({ currentPageNumber: 1, values: {} });
    const actionsHandler = new ActionsHandler(setState);

    const renderField = (field: IDeviationFormField) => {
        let options;
        if (!field.hidden) {
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

                default:
                    break;
            }
        }
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
        console.log(functionParams);
        return functionParams;
    };

    const renderAction = (action: IDeviationFormAction) => {
        const params = getFunctionParams(action.invoke.params);
        return <PrimaryButton text={action.label} disabled={eval(action.disabled)} onClick={() => actionsHandler.invoke(action.invoke.functionName, params)} />;
    };

    console.log(state.currentPageNumber);
    console.log(form.pages);

    return (
        <div>
            <header>{form.title}</header>
            {form.pages.filter(page => page.key === state.currentPageNumber)
                .map(page => (
                    <div className={styles.page}>
                        <header>{page.title}</header>
                        {page.fields?.map(field => renderField(field))}
                        <div className={styles.actions}>
                            {page.actions?.map(action => renderAction(action))}
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default DeviationForm;