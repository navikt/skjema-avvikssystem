import { PrimaryButton } from '@microsoft/office-ui-fabric-react-bundle';
import { Dropdown } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState } from 'react';
import ActionsHandler from '../../../../config/ActionsHandler';
import { IDeviationForm, IDeviationFormAction, IDeviationFormField } from '../../types';

export interface IDeviationFormProps {
    form: IDeviationForm;
}

const DeviationForm = ({ form }: IDeviationFormProps) => {
    const [state, setState] = useState({ currentPageNumber: 1, values: {} });
    const actionsHandler = new ActionsHandler(setState);

    const renderField = (field: IDeviationFormField) => {
        switch (field.type) {
            case 'Choice':
                return (
                    <Dropdown
                        label={field.label}
                        required={eval(field.required)}
                        options={field.options.map(o => ({ key: o, text: o }))}
                        onChange={(_, option) => setState({ ...state, values: { ...state.values, [field.key]: option.text } })}
                    />
                );

            default:
                break;
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
        return functionParams;
    };

    const renderAction = (action: IDeviationFormAction) => {
        const params = getFunctionParams(action.invoke.params);
        return <PrimaryButton text={action.label} disabled={eval(action.disabled)} onClick={() => actionsHandler.invoke(action.invoke.functionName, params)} />;
    };

    return (
        <div>
            <header>{form.title}</header>
            {form.pages.filter(page => page.key === state.currentPageNumber)
                .map(page => (
                    <div>
                        {page.fields?.map(field => renderField(field))}
                        {page.actions?.map(action => renderAction(action))}
                    </div>
                ))}
        </div>
    );
};

export default DeviationForm;