import { PrimaryButton } from '@microsoft/office-ui-fabric-react-bundle';
import { flatten, range, padStart } from 'lodash';
import { ChoiceGroup, ComboBox, DatePicker, DayOfWeek, DefaultButton, Dropdown, IconButton, mergeStyles, MessageBar, MessageBarType, TextField, TooltipHost } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState, useEffect, useRef, useContext } from 'react';
import ActionsHandler from '../../../../config/ActionsHandler';
import { DeviationFormContext } from '../../DeviationFormContext';
import { IDeviationForm, IDeviationFormAction, IDeviationFormField, DeviationFormPageType, DeviationActionType, DeviationActionIconPosition } from '../../types';
import TimeSpanField from '../TimeSpanField/TimeSpanField';
import styles from './DeviationForm.module.scss';

export interface IDeviationFormProps {
    form: IDeviationForm;
}

const DeviationForm = ({ form }: IDeviationFormProps) => {
    const context = useContext(DeviationFormContext);
    const [state, setState] = useState({ currentPageNumber: 1, values: { stateOrMunicipality: context.organization || null }, valid: false });
    const [fieldTypes, setFieldTypes] = useState<Map<string, string>>(new Map<string, string>());
    const prevPageRef = useRef(state.currentPageNumber);
    const actionsHandler = new ActionsHandler(setState);

    const hours = range(0, 24).map(key => ({ key, text: `${padStart(key.toString(), 2, '0')}` }));
    const minutes = range(0, 60).map(key => ({ key, text: `${padStart(key.toString(), 2, '0')}` }));

    useEffect(() => {
        const types = fieldTypes;
        form.pages.forEach(page => {
            if (page.type === DeviationFormPageType.Input) {
                page.fields.forEach(field => {
                    if (!types.has(field.key)) {
                        types.set(field.key, field.type);
                    }
                });
            }
        });
        setFieldTypes(types);
    }, []);

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

    const renderField = (field: IDeviationFormField) => {
        let options: any[];

        if (!eval(field.hidden)) {
            switch (field.type) {
                case 'Choice':
                    if (typeof field.options === 'string') {
                        options = eval(field.options).map(o => ({ key: o, text: o }));
                    } else options = field.options.map(o => ({ key: o, text: o }));
                    const multiSelect = eval(field.multiselect) || false;
                    return (
                        <div className={styles.field}>
                            <Dropdown
                                label={field.label}
                                selectedKeys={state.values[field.key]}
                                selectedKey={state.values[field.key]}
                                required={eval(field.required)}
                                options={options}
                                multiSelect={multiSelect}
                                onChange={(_, option) => {
                                    let values = [];
                                    if (multiSelect) {
                                        const vals = state.values[field.key] || [];
                                        if (option.selected) {
                                            values = [...vals, option.text];
                                        } else values = vals.filter(v => v !== option.text);
                                    }
                                    setState({ ...state, values: { ...state.values, [field.key]: multiSelect ? values : option.text } });
                                }}
                            />
                        </div>
                    );
                case 'ChoiceGroup':
                    if (typeof field.options === 'string') {
                        options = eval(field.options).map(o => ({ key: o, text: o }));
                    } else options = field.options.map(o => ({ key: o, text: o }));
                    if (field.choiceInfoTexts) {
                        field.choiceInfoTexts.forEach((choiceText, i) => {
                            const optionRootClass = mergeStyles({ display: 'flex', alignItems: 'center', gap: '5px' });
                            const [replaceOption] = options.filter(o => o.key === choiceText.key);
                            const option = {
                                key: choiceText.key,
                                text: choiceText.key,
                                onRenderField: (props, render) => {
                                    return (
                                        <div className={optionRootClass}>
                                            {render!(props)}
                                            <TooltipHost content={choiceText.text} id={`${field.key}-choice-tooltip-${i}`}>
                                                <IconButton styles={{ rootHovered: { background: 'none' }, rootPressed: { background: 'none' } }} iconProps={{ iconName: 'Info' }} />
                                            </TooltipHost>
                                        </div>
                                    );
                                }
                            };
                            options.splice(options.indexOf(replaceOption), 1, option);
                        });
                    }
                    return (
                        <div className={styles.field}>
                            <ChoiceGroup
                                id='choiceGroup'
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
                            description={field.description}
                            styles={{ description: { fontSize: '14px' } }}
                            value={state.values[field.key]}
                            required={eval(field.required)}
                            onChange={(_, value) => setState({ ...state, values: { ...state.values, [field.key]: value } })}
                            multiline={eval(field.multiline)}
                        />
                    );
                case 'Date':
                    return (
                        <DatePicker
                            strings={context.config.calendarString}
                            firstDayOfWeek={DayOfWeek.Monday}
                            formatDate={date => date.toLocaleDateString('nb-NO')}
                            maxDate={new Date()}
                            minDate={eval(field.minDate) || null}
                            disabled={eval(field.disabled)}
                            label={field.label}
                            value={state.values[field.key]}
                            onSelectDate={date => setState({ ...state, values: { ...state.values, [field.key]: date } })}
                            isRequired={eval(field.required)}
                        />
                    );
                case 'DateTime':
                    return (
                        <div className={styles.dateTimeWrapper}>
                            <div className={styles.dateTimeField}>
                                <DatePicker
                                    strings={context.config.calendarString}
                                    firstDayOfWeek={DayOfWeek.Monday}
                                    formatDate={date => date.toLocaleDateString('nb-NO')}
                                    maxDate={new Date()}
                                    minDate={eval(field.minDate) || null}
                                    disabled={eval(field.disabled)}
                                    label={field.label}
                                    value={state.values[field.key]}
                                    onSelectDate={date => setState({ ...state, values: { ...state.values, [field.key]: date } })}
                                    isRequired={eval(field.required)}
                                />
                                <div className={styles.timePicker}>
                                    <div className={styles.timeControls}>
                                        <span>Kl.</span>
                                        <ComboBox
                                            className={styles.input}
                                            options={hours}
                                            autoComplete="on"
                                            calloutProps={{ styles: { root: { maxHeight: '200px', overflow: 'auto', width: '80px' } } }}
                                            selectedKey={new Date(state.values[field.key]).getHours()}
                                            disabled={!state.values[field.key]}
                                            onChange={(_, o) => {
                                                const date: Date = state.values[field.key];
                                                date.setHours(o.key as number);
                                                setState({ ...state, values: { ...state.values, [field.key]: date } });
                                            }}
                                        />
                                        <span> : </span>
                                        <ComboBox
                                            className={styles.input}
                                            options={minutes}
                                            autoComplete="on"
                                            calloutProps={{ styles: { root: { maxHeight: '200px', overflow: 'auto', width: '80px' } } }}
                                            selectedKey={new Date(state.values[field.key]).getMinutes()}
                                            disabled={!state.values[field.key]}
                                            onChange={(_, o) => {
                                                const date: Date = state.values[field.key];
                                                date.setMinutes(o.key as number);
                                                setState({ ...state, values: { ...state.values, [field.key]: date } });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {field.valid !== undefined && state.values[field.key] !== undefined &&
                                !eval(field.valid) && <MessageBar messageBarType={MessageBarType.error}>{field.errorMessage}</MessageBar>}
                        </div>
                    );
                case 'TimeSpan':
                    return <TimeSpanField label={field.label} onChange={(value) => setState({ ...state, values: { ...state.values, [field.key]: value } })} />;
                case 'Number':
                    return (
                        <TextField
                            type='number'
                            label={field.label}
                            value={state.values[field.key]}
                            required={eval(field.required)}
                            onChange={(_, value) => setState({ ...state, values: { ...state.values, [field.key]: value } })}
                        />
                    );

                default:
                    break;
            }
        }
    };

    const renderSummary = (values: any) => {
        const fields = flatten(form.pages.filter(p => p.type === DeviationFormPageType.Input).map(p => p.fields.filter(f => !eval(f.hidden)).map(f => ({ fieldName: f.key, field: f.label || p.title, value: values[f.key] }))));
        const getValue = (field: any) => {
            if (field.value instanceof Date) {
                if (fieldTypes.get(field.fieldName) === 'DateTime') {
                    return `${field.value.toLocaleDateString()} Kl. ${field.value.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
                } else return field.value.toLocaleDateString();
            }
            return field.value;
        };
        return (
            <div className={styles.summaryFields}>
                {fields.map(f => {
                    if (f.value) {
                        return (
                            <div className={styles.summaryField}>
                                <div className={styles.summaryFieldLabel}>{f.field}</div>
                                <div className={styles.summaryFieldValue}>{getValue(f)}</div>
                            </div>
                        );
                    }
                })}
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

    const renderContent = (content: string, format: string[]): JSX.Element => {
        const formatString = (string: string, ...args: string[]) => {
            return string.replace(/{(\d+)}/g, (match, number) => {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
        };
        if (!format || format.length === 0) return <div dangerouslySetInnerHTML={{ __html: content }} />;
        try {
            const resolvedVariables = format.map(f => f.indexOf('state.') !== -1 || f.indexOf('context.') !== -1 ? eval(f) : f);
            if (resolvedVariables.indexOf(undefined) !== -1) throw new Error('Klarte ikke hente nødvendig data.');
            const formattedContent = formatString(content, ...resolvedVariables);
            return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
        } catch (error) {
            return <MessageBar messageBarType={MessageBarType.error}>{error.message}</MessageBar>;
        }
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
                        {page.type === DeviationFormPageType.Info &&
                            renderContent(page.content, page.format)
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