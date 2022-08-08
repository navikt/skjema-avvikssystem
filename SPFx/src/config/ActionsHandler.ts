export default class ActionsHandler {
    private _setState;

    constructor(setState: any) {
        this._setState = setState;
    }

    public invoke(functionName: string, params: any) {
        this[functionName](params);
    }

    private NextPage({ currentPageNumber, stateVariable, state }) {
        this._setState({ ...state, [stateVariable]: currentPageNumber + 1 });
    }

    private PreviousPage({ currentPageNumber, stateVariable, state }) {
        this._setState({ ...state, [stateVariable]: currentPageNumber - 1 });
    }

    private async Submit({ values }) {
        console.log(values);
        const body = JSON.stringify(values);
        const response = await fetch('http://localhost:7071/api/avviksskjema', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });
        const result = await response.json();
        console.log(result);

    }
}