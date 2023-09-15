export class ResultField {
    public Value: any;
    public Type: string;
    public DisplayName: string;

    constructor(result) {
        this.DisplayName = result.ledetekst;
        this.Type = result.felttype;
        this.Value = result.verdi;
    }
}

export const mapResultFields = (result): ResultField[] => {
    if (result) {
        if (result.status === 'Failed') return;
        return result.map((field) => {
            return new ResultField(field);
        });
    }
};