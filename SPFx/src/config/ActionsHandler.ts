import { includes } from 'lodash';
import { IDeviationForm, IDeviationFormState } from '../webparts/deviationForm/types';

export default class ActionsHandler {
    private _setState;
    private _setForm;
    private _forms: IDeviationForm[];

    constructor(setState: React.Dispatch<React.SetStateAction<IDeviationFormState>>, setForm: (form: IDeviationForm) => void, forms: IDeviationForm[]) {
        this._setState = setState;
        this._setForm = setForm;
        this._forms = forms;
    }

    public invoke(functionName: string, params: any) {
        this[functionName](params);
    }

    private ToFormSelection() {
        this._setForm(null);
    }

    private SwitchForm({ formName, stateVariable, state, key, value, skipPage, bubble, setBubbleState }) {
        const [form] = this._forms.filter((f) => f.title === formName);
        this._setState({ ...state, currentPageNumber: 1, [stateVariable]: { ...state[stateVariable], form: formName, [key]: value }, skipPage: skipPage });
        this._setForm(form);
        setBubbleState(bubble);
    }

    private NextPage({ currentPageNumber, stateVariable, state }) {
        this._setState({ ...state, [stateVariable]: currentPageNumber + 1 });
    }

    private PreviousPage({ currentPageNumber, stateVariable, state }) {
        this._setState({ ...state, [stateVariable]: currentPageNumber - 1 });
    }

    private async Submit({ values, functionUrl, environment, stateVariable, state, resultVariable, fieldsToInclude }) {
        fieldsToInclude = [...fieldsToInclude, 'stateOrMunicipalitySector', 'form'];
        if (!values.anonymous) fieldsToInclude = [...fieldsToInclude, 'reporterEmail', 'reporterNAVIdentId'];
        this._setState({ ...state, [stateVariable]: true });
        for (const key in values) {
            if (!includes(fieldsToInclude, key) || key === 'personalInfoLost') {
                delete values[key];
            }
        }

        const body = JSON.stringify(values);
        const response = await fetch(`${functionUrl}&mode=post&environment=${environment}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });
        const result = await response.text();
        this._setState({ ...state, [stateVariable]: false, [resultVariable]: { status: response.status, text: result } });
    }
}