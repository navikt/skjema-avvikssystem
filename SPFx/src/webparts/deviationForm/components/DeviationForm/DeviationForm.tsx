import { PrimaryButton } from '@microsoft/office-ui-fabric-react-bundle';
import strings from 'DeviationFormWebPartStrings';
import { flatten, range, padStart, clone } from 'lodash';
import {
    Checkbox,
    ChoiceGroup,
    ComboBox,
    DatePicker,
    DayOfWeek,
    DefaultButton,
    Dialog,
    DialogFooter,
    Dropdown,
    IChoiceGroupOption,
    IconButton,
    mergeStyles,
    MessageBar,
    MessageBarType,
    Spinner,
    SpinnerSize,
    TextField,
    TooltipHost,
    VirtualizedComboBox
} from 'office-ui-fabric-react';

import * as React from 'react';
import { useState, useEffect, useRef, useContext } from 'react';
import ActionsHandler from '../../../../config/ActionsHandler';
import { DeviationFormContext } from '../../DeviationFormContext';
import {
    IDeviationForm,
    IDeviationFormAction,
    IDeviationFormField,
    DeviationFormPageType,
    DeviationActionType,
    DeviationActionIconPosition,
    IDeviationPageConfirmation,
    IDeviationFormMessage,
    IDeviationFormState,
    ISubmitResult,
    IBubbleState,
    Params
} from '../../types';

import TimeSpanField from '../TimeSpanField/TimeSpanField';
import styles from './DeviationForm.module.scss';
import dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import useFunctionParams from './useFunctionParams';

dayjs.extend(customParseFormat.default);

export interface IDeviationFormProps {
    form: IDeviationForm;
    setSelectedForm: (form: IDeviationForm) => void;
    toFormSelection: () => void;
    breadcrumbState: { breadcrumbs: string[], setBreadcrumbs: (breadcrumbs: string[]) => void };
    setBubbleState: React.Dispatch<React.SetStateAction<IBubbleState>>;
}

const DeviationForm = ({ form, setSelectedForm, breadcrumbState, toFormSelection, setBubbleState }: IDeviationFormProps) => {
    const context = useContext(DeviationFormContext);
    const [state, setState] = useState<IDeviationFormState>({
        currentPageNumber: 1,
        values: {
            stateOrMunicipalitySector: form.title === 'HSE' ? context.organization : null,
            reporterEmail: context.reporterEmail,
            reporterNAVIdentId: context.reporterNAVIdentId,
            form: form.title
        },
        valid: false,
        summaryConfirmed: false,
        submitting: false,
        submitResult: null
    });
    const getFunctionParams = useFunctionParams(state, context, form, setBubbleState);
    const [fieldTypes, setFieldTypes] = useState<Map<string, string>>(new Map<string, string>());
    const prevPageRef = useRef(state.currentPageNumber);
    const actionsHandler = new ActionsHandler(setState, setSelectedForm, context.config.forms);

    const hours = range(0, 24).map(key => ({ key, text: `${padStart(key.toString(), 2, '0')}` }));
    const minutes = range(0, 60).map(key => ({ key, text: `${padStart(key.toString(), 2, '0')}` }));

    const isFirstRender = useRef(true);

    useEffect(() => {
        const types = fieldTypes;
        setState(prevState => {
            let stateValues = clone(prevState.values);
            form.pages.forEach(page => {
                if (page.type === DeviationFormPageType.Input) {
                    page.fields.forEach(field => {
                        let values = new Map<string, string>();
                        if (field.additionalData) {
                            field.additionalData.forEach(d => {
                                values.set(d.key, eval(d.value) || d.fallback);
                            });
                        }
                        if (!types.has(field.key)) {
                            types.set(field.key, field.type);
                        }
                        if (field.defaultValue) {
                            stateValues = {
                                ...stateValues,
                                [field.key]:
                                    field.additionalData && values.has(field.defaultValue)
                                        ? values.get(field.defaultValue)
                                        : eval(field.defaultValue),
                            };
                        }
                    });
                }
            });
            return { ...prevState, values: stateValues };
        });
        setFieldTypes(types);
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Skip the second useEffect on the first render
        }
        const [page] = form.pages.filter(p => p.key === state.currentPageNumber);
        if (page.type === DeviationFormPageType.Input) {
            const valid = page.fields
                .filter(f => eval(f.required))
                .every(f => state.values[f.key] && (f.valid !== undefined ? eval(f.valid) : true));

            let updatedState = { ...state, valid };

            if (page.fields.every(f => eval(f.hidden)) || state?.skipPage?.page === state.currentPageNumber) {
                const nextPageNumber = prevPageRef.current < state.currentPageNumber ? state.currentPageNumber + 1 : state.currentPageNumber - 1;
                updatedState = { ...updatedState, currentPageNumber: nextPageNumber, skipPage: null };
                if (state?.skipPage?.addtobreadcrumbs) breadcrumbState.setBreadcrumbs([...breadcrumbState.breadcrumbs, eval(state.skipPage.addtobreadcrumbs)])
            }

            setState(updatedState);
        }

        prevPageRef.current = state.currentPageNumber;
    }, [state.values, state.currentPageNumber]);

    const onParseDateFromString = (value: string): Date => {
        const formats = ['DD/MM/YYYY', 'DD.MM.YYYY', 'DD-MM-YYYY', 'DD.MM.YY', 'DD-MM-YY', 'DD/MM/YY', 'D/M/YYYY', 'D/M/YY', 'D.M.YY', 'D.M.YYYY', 'D-M-YY', 'D-M-YYYY'];
        let date: dayjs.Dayjs = null;
        let valid = false;

        formats.forEach(format => {
            if (!valid) {
                date = dayjs(value, format, 'no', true);
                valid = date.isValid();
            } else return;
        });

        if (valid) return date.toDate();
        else return null;
    };


    const renderField = (field: IDeviationFormField) => {
        let options: any[];
        if (!eval(field.hidden)) {
            switch (field.type) {
                case 'Choice':
                    if (typeof field.options === 'string') {
                        if (field.optionType?.type === 'object') {
                            const objects = eval(field.options);
                            options = objects.map(o => ({ key: o[field.optionType.key], text: strings[o[field.optionType.text]] || o[field.optionType.text] }));
                        } else if (field.optionType?.type === 'string') {
                            options = eval(field.options).map(o => ({ key: o, text: strings[o] || o }));
                        }
                    } else options = field.options.map(o => ({ key: o, text: strings[o] || o }));
                    const multiSelect = field.multiselect || false;
                    if (eval(field.combobox)) {
                        return (
                            <div className={styles.field}>
                                <VirtualizedComboBox
                                    label={field.label}
                                    selectedKey={state.values[field.key]}
                                    allowFreeform
                                    autoComplete="on"
                                    options={options}
                                    required={eval(field.required)}
                                    onChange={(_, option) => {
                                        let selectedValues = [];
                                        if (multiSelect) {
                                            const vals = state.values[field.key] || [];
                                            if (option.selected) {
                                                selectedValues = [...vals, option.key];
                                            } else selectedValues = vals.filter(v => v !== option.key);
                                        }
                                        setState({ ...state, values: { ...state.values, [field.key]: multiSelect ? selectedValues : option.key } });
                                    }}
                                />
                            </div>
                        );
                    }
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
                                    let selectedValues = [];
                                    if (multiSelect) {
                                        const vals = state.values[field.key] || [];
                                        if (option.selected) {
                                            selectedValues = [...vals, option.key];
                                        } else selectedValues = vals.filter(v => v !== option.key);
                                    }
                                    setState({ ...state, values: { ...state.values, [field.key]: multiSelect ? selectedValues : option.key } });
                                }}
                            />
                        </div>
                    );
                case 'ChoiceGroup':
                    let values = new Map<string, string>();
                    if (field.additionalData) {
                        field.additionalData.forEach(d => {
                            values.set(d.key, eval(d.value) || d.key);
                        });
                    }
                    if (typeof field.options === 'string') {
                        options = eval(field.options).map(o => ({ key: values.has(o) ? values.get(o) : o, text: strings[o] || o }));
                    } else options = field.options.map(o => ({ key: values.has(o) ? values.get(o) : o, text: strings[o] || o, disabled: field.disabledOptions?.length > 0 && field.disabledOptions.indexOf(o) !== -1 }));
                    if (field.choiceInfoTexts) {
                        field.choiceInfoTexts.forEach((choiceText, i) => {
                            const optionRootClass = mergeStyles({ display: 'flex', alignItems: 'center', gap: '5px' });
                            const choiceKey = choiceText.dynamicKey ? eval(choiceText.dynamicKey) || choiceText.key : choiceText.key;
                            const [replaceOption] = options.filter(o => o.key === choiceKey);
                            const screenReaderTextId = `screenReaderText-${field.key}-choice-tooltip-${i}`;
                            let key = choiceText.key;
                            if (field.additionalData) {
                                const [match] = field.additionalData.filter(d => d.key === choiceText.key);
                                key = match?.key ? eval(match.value) || choiceText.key : choiceText.key;
                            }

                            if (options.indexOf(replaceOption) !== -1) {
                                const option: IChoiceGroupOption = {
                                    key: key,
                                    text: strings[choiceText.key] || choiceText.key,
                                    "aria-describedby": screenReaderTextId,

                                    onRenderField: (props, render) => {
                                        return (
                                            <div className={optionRootClass}>
                                                {render!(props)}
                                                <span
                                                    style={{ height: '1px', width: '1px', position: 'absolute', overflow: 'hidden', margin: '-1px', padding: '0px', border: '0px' }}
                                                    id={screenReaderTextId}
                                                    aria-hidden='true'
                                                >
                                                    {choiceText.text}
                                                </span>
                                                <TooltipHost content={choiceText.text} id={`${field.key}-choice-tooltip-${i}`}>
                                                    <IconButton tabIndex={-1} aria-hidden='true' styles={{ rootHovered: { background: 'none' }, rootPressed: { background: 'none' } }} iconProps={{ iconName: 'Info' }} />
                                                </TooltipHost>
                                            </div>
                                        );
                                    }
                                };
                                options.splice(options.indexOf(replaceOption), 1, option);
                            }
                        });
                    }

                    // Removed label displaying unit name. Commented out in case it needs to be reintroduced.
                    /*                     if (field.additionalData) {
                                            field.additionalData.forEach((additionalData, i) => {
                                                const optionRootClass = mergeStyles({ display: 'flex', alignItems: 'center', gap: '20px' });
                                                const [replaceOption] = options.filter(o => o.text === additionalData.key);
                                                const value = eval(additionalData.value) || additionalData.key;
                                                if (options.indexOf(replaceOption) !== -1) {
                                                    const option = {
                                                        key: value,
                                                        text: additionalData.key,
                    
                                                                                            onRenderField: (props, render) => {
                                                                                                return (
                                                                                                    <div className={optionRootClass}>
                                                                                                        {render!(props)}
                                                                                                        {value ? <span className={styles.additionalDataValue}>{value}</span>
                                                                                                            : <MessageBar messageBarType={MessageBarType.error}>Klarte ikke hente nødvendig data.</MessageBar>
                                                                                                        }
                                                                                                    </div>
                                                                                                );
                                                                                            } 
                                                    };
                                                    options.splice(options.indexOf(replaceOption), 1, option);
                                                }
                                            });
                                        } */

                    if (field.dynamicValue) {
                        const { variable, value, condition } = field.dynamicValue;
                        if (eval(condition.replace('{variable}', variable))) {
                            const [option] = (options as IChoiceGroupOption[]).filter(o => o.text === value);
                            if (state.values[field.key] !== option.key) {
                                setState({ ...state, values: { ...state.values, [field.key]: option.key } });
                            }
                        }
                    }
                    return (
                        <div className={styles.field}>
                            <ChoiceGroup
                                id='choiceGroup'
                                label={field.label}
                                selectedKey={state.values[field.key]}
                                required={eval(field.required)}
                                disabled={eval(field.disabled)}
                                options={options}
                                onChange={(_, option) => {
                                    setState({ ...state, values: { ...state.values, [field.key]: option.key } });
                                }}
                            />
                        </div>
                    );
                case 'Text':
                    return (
                        <TextField
                            label={field.label}
                            description={field.description}
                            styles={{ description: { fontSize: '14px' } }}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            value={state.values[field.key]}
                            required={eval(field.required)}
                            onChange={(_, value) => setState({ ...state, values: { ...state.values, [field.key]: value } })}
                            multiline={field.multiline}
                        />
                    );
                case 'Date':
                    return (
                        <DatePicker
                            strings={context.config.datePickerStrings}
                            allowTextInput
                            parseDateFromString={onParseDateFromString}
                            firstDayOfWeek={DayOfWeek.Monday}
                            formatDate={date => !date ? '' : date.toLocaleDateString('nb-NO')}
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
                                    strings={context.config.datePickerStrings}
                                    allowTextInput
                                    parseDateFromString={onParseDateFromString}
                                    firstDayOfWeek={DayOfWeek.Monday}
                                    formatDate={date => !date ? '' : date.toLocaleDateString('nb-NO')}
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
                                !eval(field.valid) && <MessageBar styles={{ root: { marginTop: '5px' } }} messageBarType={MessageBarType.error}>{field.errorMessage}</MessageBar>}
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
                case 'Checkbox':
                    const checkboxRootClass = mergeStyles({ display: 'flex', alignItems: 'center', gap: '5px' });
                    const screenReaderCheckboxTextId = `screenReaderText-${field.key}-tooltip`;
                    if (field.infoText) {
                        return (
                            <div className={styles.checkboxContainer}>
                                <div className={checkboxRootClass}>
                                    <Checkbox
                                        label={field.label}
                                        checked={state.values[field.key]}
                                        onChange={(_, checked) => setState({ ...state, values: { ...state.values, [field.key]: checked } })}
                                    />
                                    <span
                                        style={{ height: '1px', width: '1px', position: 'absolute', overflow: 'hidden', margin: '-1px', padding: '0px', border: '0px' }}
                                        id={screenReaderCheckboxTextId}
                                        aria-hidden='true'
                                    >
                                        {field.infoText}
                                    </span>
                                    <TooltipHost content={field.infoText} id={`${field.key}-choice-tooltip`}>
                                        <IconButton tabIndex={-1} aria-hidden='true' styles={{ rootHovered: { background: 'none' }, rootPressed: { background: 'none' } }} iconProps={{ iconName: 'Info' }} />
                                    </TooltipHost>
                                </div>
                                {field.description &&
                                    <span className={styles.checkBoxDescription}>{field.description}</span>
                                }
                            </div>
                        );
                    } else return (
                        <Checkbox
                            label={field.label}
                            checked={state.values[field.key]}
                            onChange={(_, checked) => setState({ ...state, values: { ...state.values, [field.key]: checked } })}
                        />
                    );
                default:
                    break;
            }
        }
    };

    const renderSummary = (values: any) => {
        const fields = flatten(form.pages.filter(p => p.type === DeviationFormPageType.Input).map(p => p.fields.filter(f => !eval(f.hidden) && eval(f.showInSummary) !== false).map(f => ({ fieldName: f.key, field: f.label || p.title, value: values[f.key], options: f.options, optionType: f.optionType }))));
        const getValue = (field: any) => {
            if (field.value instanceof Date) {
                if (fieldTypes.get(field.fieldName) === 'DateTime') {
                    return `${field.value.toLocaleDateString('no')} Kl. ${field.value.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
                } else return field.value.toLocaleDateString('no');
            } else if (field.optionType?.type === 'object') {
                if (typeof field.options === 'string') field.options = eval(field.options);
                const [option] = field.options.filter(o => o[field.optionType.key] === field.value);
                return strings[option[field.optionType.text]] || option[field.optionType.text];
            } else if (field.value instanceof Array) {
                return field.value.map(v => strings[v]).join(', ');
            }
            else if (typeof field.value === 'boolean') {
                return field.value ? strings.Yes : strings.No;
            }
            return strings[field.value] || field.value;
        };

        return (
            <div className={styles.summaryFields}>
                {fields.map(f => {
                    if (f.value !== undefined) {
                        return (
                            <div className={styles.summaryField}>
                                <div className={styles.summaryFieldLabel}>{f.field}</div>
                                <div className={styles.summaryFieldValue}>{getValue(f)}</div>
                            </div>
                        );
                    }
                })}
                <Checkbox
                    className={styles.checkbox}
                    checked={state.summaryConfirmed}
                    label={state.values.category === 'Personal information' ? strings.SummaryConfirmationPersonaldata : strings.SummaryConfirmation}
                    onChange={(_, checked) => setState({ ...state, summaryConfirmed: checked })}
                />
            </div>
        );
    };
    const renderAction = (action: IDeviationFormAction) => {
        const invoke = action.invoke.conditionalInvoke && eval(action.invoke.conditionalInvoke.condition)
            ? action.invoke.conditionalInvoke
            : action.invoke;

        const functionName = invoke.functionName;
        const invokeParams = invoke.params;

        const params: Params = getFunctionParams(invokeParams, action.key, functionName);
        const iconRightStyles = { flexContainer: { flexDirection: 'row-reverse' } };
        if (action.type === DeviationActionType.Default)
            return <DefaultButton
                styles={action.iconPosition === DeviationActionIconPosition.Right && iconRightStyles}
                iconProps={action.iconProps}
                text={action.label}
                disabled={eval(action.disabled)}
                onClick={() => {
                    if (action.addtobreadcrumbs) breadcrumbState.setBreadcrumbs([...breadcrumbState.breadcrumbs, eval(action.addtobreadcrumbs)]);
                    if (eval(action.removefrombreadcrumbs)) {
                        let crumbs = breadcrumbState.breadcrumbs.slice();
                        crumbs.splice(crumbs.length - 1, 1);
                        breadcrumbState.setBreadcrumbs(crumbs);
                    }
                    actionsHandler.invoke(functionName, params);
                }}
            />;
        if (action.type === DeviationActionType.Primary)
            return <PrimaryButton
                iconProps={action.iconProps}
                text={action.label}
                disabled={eval(action.disabled)}
                onClick={() => {
                    if (action.addtobreadcrumbs) breadcrumbState.setBreadcrumbs([...breadcrumbState.breadcrumbs, eval(action.addtobreadcrumbs)]);
                    if (eval(action.removefrombreadcrumbs)) {
                        let crumbs = breadcrumbState.breadcrumbs.slice();
                        crumbs.splice(crumbs.length - 1, 1);
                        breadcrumbState.setBreadcrumbs(crumbs);
                    }
                    actionsHandler.invoke(functionName, params);
                }}
            />;
    };

    const getMessageType = (type: string): MessageBarType => {
        switch (type) {
            case 'info':
                return MessageBarType.info;
            case 'error':
                return MessageBarType.error;
            case 'severeWarning':
                return MessageBarType.severeWarning;
            case 'success':
                return MessageBarType.success;
            case 'warning':
                return MessageBarType.warning;
            default:
                return MessageBarType.info;
        }
    };

    const renderMessages = (messages: IDeviationFormMessage[]) => {
        if (messages) return messages.map(m => { if (eval(m.display)) return <MessageBar messageBarType={getMessageType(m.type)}>{m.content}</MessageBar>; });
    };

    const renderContent = (content: string, format: string[], confirmation: IDeviationPageConfirmation, messages: IDeviationFormMessage[]): JSX.Element => {
        const formatString = (string: string, ...args: string[]) => {
            return string.replace(/{(\d+)}/g, (match, number) => {
                return typeof args[number] != 'undefined'
                    ? strings[args[number]]?.toLowerCase() || args[number]?.toLowerCase()
                    : strings[match].toLocaleLowerCase() || match.toLocaleLowerCase();
            });
        };
        if (!format || format.length === 0) return <div role='banner' aria-label={content} dangerouslySetInnerHTML={{ __html: content }} />;
        try {
            const resolvedVariables = format.map(f => f.indexOf('state.') !== -1 || f.indexOf('context.') !== -1 ? (eval(f) as string) : f);
            if (resolvedVariables.indexOf(undefined) !== -1) throw new Error('Klarte ikke hente nødvendig data.');
            const formattedContent = formatString(content, ...resolvedVariables);
            return (
                <>
                    <div role='banner' aria-label={formattedContent} dangerouslySetInnerHTML={{ __html: formattedContent }} />
                    {confirmation?.field &&
                        renderField(confirmation.field)
                    }
                </>
            );
        } catch (error) {
            return <MessageBar messageBarType={MessageBarType.error}>{error.message}</MessageBar>;
        }
    };

    const getSubmitResultSubtext = (result: ISubmitResult) => {
        if (!result) return;
        const { status, text } = result;
        if (range(200, 299).indexOf(status) === -1) return `Innsending feilet. Prøv igjen senere eller meld feil i Porten. Feilmelding: ${text}`;
        return text;
    };

    return (
        <div className={state.submitting && styles.spinner}>
            {form.pages.filter(page => page.key === state.currentPageNumber)
                .map(page => (
                    <div className={styles.page}>
                        <Dialog
                            dialogContentProps={{ title: 'Registrer avvik', subText: getSubmitResultSubtext(state.submitResult), showCloseButton: true }}
                            hidden={!state.submitResult}
                            onDismiss={toFormSelection}>
                            <DialogFooter>
                                <DefaultButton text='Lukk' onClick={state.submitResult?.status && range(200, 299).indexOf(state.submitResult.status) === -1 ?
                                    () => setState({ ...state, submitResult: null }) : toFormSelection} />
                            </DialogFooter>
                        </Dialog>
                        {state.submitting ?
                            <Spinner size={SpinnerSize.large} label='Sender inn...' />
                            :
                            <>
                                {page.informationMessages?.map(message => <MessageBar messageBarType={MessageBarType.info}>{message}</MessageBar>)}
                                {page.title &&
                                    <header role='banner' aria-label={page.title}>
                                        <h2>{page.title}</h2>
                                    </header>
                                }
                                {page.type === DeviationFormPageType.Input &&
                                    page.fields?.map(field => renderField(field))
                                }
                                {page.type === DeviationFormPageType.Info &&
                                    renderContent(page.content, page.format, page.confirmation, page.messages)
                                }
                                {page.type === DeviationFormPageType.Summary &&
                                    renderSummary(state.values)
                                }
                                {renderMessages(page.messages)}
                                <div className={styles.actions}>
                                    {page.actions?.map(action => renderAction(action))}
                                </div>
                            </>
                        }
                    </div>
                ))}
        </div>
    );
};

export default DeviationForm;