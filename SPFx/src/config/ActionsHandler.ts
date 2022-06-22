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
}