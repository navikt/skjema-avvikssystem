export default class ActionsHandler {

    public invoke(functionName: string, params: any) {
        this[functionName](params);
    }

    private NextPage(pageNumber: number, setPageNumber: any) {
        setPageNumber(pageNumber + 1)
    }
}