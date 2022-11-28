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

    private async Submit({ values, formSubmitURL, stateVariable, state, resultVariable }) {
        this._setState({ ...state, [stateVariable]: true });
        const body = JSON.stringify(values);
        const response = await fetch(formSubmitURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });
        const result = await response.text();
        this._setState({ ...state, [stateVariable]: false, [resultVariable]: result });
    }
}