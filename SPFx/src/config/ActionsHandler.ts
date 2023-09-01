import { includes } from 'lodash';

export default class ActionsHandler {
    private _setState;
    private _setForm;

    constructor(setState: any, setForm: any) {
        this._setState = setState;
        this._setForm = setForm;
    }

    public invoke(functionName: string, params: any) {
        this[functionName](params);
    }

    private ToFormSelection() {
        this._setForm(null);
    }

    private NextPage({ currentPageNumber, stateVariable, state }) {
        this._setState({ ...state, [stateVariable]: currentPageNumber + 1 });
    }

    private PreviousPage({ currentPageNumber, stateVariable, state }) {
        this._setState({ ...state, [stateVariable]: currentPageNumber - 1 });
    }

    private async Submit({ values, functionUrl, stateVariable, state, resultVariable, fieldsToInclude }) {
        fieldsToInclude = [...fieldsToInclude, 'stateOrMunicipality', 'form'];
        if (!values.anonymous) fieldsToInclude = [...fieldsToInclude, 'reporterEmail', 'reporterNAVIdentId'];
        this._setState({ ...state, [stateVariable]: true });
        for (const key in values) {
            if (!includes(fieldsToInclude, key)) {
                delete values[key];
            }
        }

        const body = JSON.stringify(values);
        console.log(body);
        const response = await fetch(`${functionUrl}&mode=post`, {
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