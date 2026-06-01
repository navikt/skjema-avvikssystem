import { includes } from 'lodash';
import { IDeviationForm, IDeviationFormState } from '../webparts/deviationForm/types';
import { IDeviationFormContext } from '../webparts/deviationForm/DeviationFormContext';
import { 
    ISwitchFormParams, 
    IPageNavigationParams, 
    IFormValues, 
    ISubmitState, 
    ISubmitParams 
} from './ActionsHandlerTypes';

export default class ActionsHandler {
    private _setState: React.Dispatch<React.SetStateAction<IDeviationFormState>>;
    private _setForm: (form: IDeviationForm) => void;
    private _forms: IDeviationForm[];
    private _context: IDeviationFormContext;

    constructor(setState: React.Dispatch<React.SetStateAction<IDeviationFormState>>, setForm: (form: IDeviationForm) => void, forms: IDeviationForm[], context: IDeviationFormContext) {
        this._setState = setState;
        this._setForm = setForm;
        this._forms = forms;
        this._context = context;
    }

    public invoke(functionName: string, params: any): void {
        (this as any)[functionName](params);
    }

    private ToFormSelection(): void {
        this._setForm(null);
    }

    private SwitchForm({ formName, stateVariable, state, key, value, skipPage, bubble, setBubbleState }: ISwitchFormParams): void {
        const [form] = this._forms.filter((f) => f.title === formName);
        this._setState({ ...state, currentPageNumber: 1, [stateVariable]: { ...state[stateVariable], form: formName, [key]: value }, skipPage: skipPage });
        this._setForm(form);
        setBubbleState(bubble);
    }

    private NextPage({ currentPageNumber, stateVariable, state }: IPageNavigationParams): void {
        this._setState({ ...state, [stateVariable]: currentPageNumber + 1 });
    }

    private PreviousPage({ currentPageNumber, stateVariable, state }: IPageNavigationParams): void {
        this._setState({ ...state, [stateVariable]: currentPageNumber - 1 });
    }

    private isSelectedUnitKontaktsenter(values: IFormValues, state: ISubmitState): boolean {
        if (values.unit === 'Annen enhet' && state.otherUnitNumber) {
            const selectedAgreement = this._context.agreementOptions?.find(
                option => option.unit === state.otherUnitNumber
            );
            return selectedAgreement?.data?.kontaktsenter === true;
        } else return this._context.unitIsKontaktsenter;
    }

    private async Submit({ values, functionUrl, environment, stateVariable, state, resultVariable, fieldsToInclude }: ISubmitParams): Promise<void> {
        fieldsToInclude = [...fieldsToInclude, 'stateOrMunicipalitySector', 'form'];
        if (!values.anonymous) fieldsToInclude = [...fieldsToInclude, 'reporterEmail', 'reporterNAVIdentId'];
        this._setState({ ...state, [stateVariable]: true });
        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                if (values.form === 'Physical security') values.stateOrMunicipalityService = 'Unsure';
                if (values[key] === '') delete values[key];
                if (key === 'selectedMunicipality' && this.isSelectedUnitKontaktsenter(values, state)) delete values[key];
                if (!includes(fieldsToInclude, key) || key === 'personalInfoLost') {
                    delete values[key];
                } else if (key === 'category' && values[key] === 'Violation of privacy requirements') {
                    values.form = 'Privacy';
                    values.category = values.categoryDetails;
                    delete values.categoryDetails;
                }
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