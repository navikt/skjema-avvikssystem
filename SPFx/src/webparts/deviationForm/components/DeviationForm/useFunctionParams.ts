import { useCallback } from 'react';
import { IBubbleState, IDeviationForm, IDeviationFormState, Params } from '../../types';
import { IDeviationFormContext } from '../../DeviationFormContext';
import { flatten } from '@microsoft/sp-lodash-subset';


const useFunctionParams = (
    state: IDeviationFormState,
    context: IDeviationFormContext,
    form: IDeviationForm,
    setBubbleState: React.Dispatch<React.SetStateAction<IBubbleState>>
): (initialParams: Params | undefined, action: string, functionName: string) => Params | undefined => {
    const getFunctionParams = useCallback(
        (initialParams: Params | null,
            action: string,
            functionName: string) => {
            if (!initialParams) return null;

            const actionHandlers = {
                'submit': {
                    params: ['functionParams', 'form'],
                    handler: (functionParams: Params, form: IDeviationForm) => ({
                        ...functionParams,
                        fieldsToInclude: flatten(form.pages.map(p => p.fields).filter(Boolean)).filter(f => !eval(f.hidden)).map(f => f.key)
                    })
                },
                'SwitchForm': {
                    params: ['functionParams', 'setBubbleState'],
                    handler: (functionParams: Params, setBubbleState: React.Dispatch<React.SetStateAction<IBubbleState>>) => ({
                        ...functionParams,
                        setBubbleState
                    })
                }
            };

            const functionParams: Params = Object.entries(initialParams).reduce((acc, [key, value]) => {
                if (key.startsWith('state_')) {
                    return { ...acc, [value]: state[value] };
                }
                if (key.startsWith('context_')) {
                    return { ...acc, [value]: context[value] };
                }
                if (key === 'setstate') {
                    return { ...acc, stateVariable: value, state };
                }
                return { ...acc, [key]: value };
            }, {});

            const handlerInfo = actionHandlers[action] || actionHandlers[functionName];
            if (handlerInfo) {
                const paramValues = {
                    functionParams,
                    form,
                    setBubbleState
                };

                const handlerArgs = handlerInfo.params.map(param => paramValues[param]);

                return handlerInfo.handler(...handlerArgs);
            }

            return functionParams;
        }, [state, context, form, setBubbleState]);

    return getFunctionParams;
};

export default useFunctionParams;