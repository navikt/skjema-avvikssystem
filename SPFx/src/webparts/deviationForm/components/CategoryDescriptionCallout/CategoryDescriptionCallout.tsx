import React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react';
import { DescriptionType, IDeviationForm } from '../../types';
import strings from 'DeviationFormWebPartStrings';


export interface ICalloutProps {
    display: boolean;
    button: string;
}

interface ICategoryDescriptionCalloutProps {
    buttonId: string;
    calloutProps: ICalloutProps;
    form: IDeviationForm;
    screenReaderTextId: string;
}

const extractContent = (s): string => {
    const span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
};

const CategoryDescriptionCallout: React.FC<ICategoryDescriptionCalloutProps> = ({ buttonId, calloutProps, form, screenReaderTextId }) => {
    if (!form.description || !calloutProps.display || calloutProps.button !== buttonId) {
        return null;
    }
    const [page] = form.pages.filter(p => p.key === form.description.categories.page);
    const categories = page.fields.filter(f => f.key === form.description.categories.field).map(f => f.options).flat();
    const listItems = categories.map(category => `<li>${strings[category]}</li>`).join('');
    const content = form.description.contentTemplate.replace('{categories}', listItems);

    return (
        <>
            <Callout
                target={`#${buttonId}`}
                directionalHint={DirectionalHint.rightCenter}
            >
                {form.description.type === DescriptionType.Text && <div>{content}</div>}
                {form.description.type === DescriptionType.HTML && <div dangerouslySetInnerHTML={{ __html: content }} />}
            </Callout>
            <span
                style={{ height: '1px', width: '1px', position: 'absolute', overflow: 'hidden', margin: '-1px', padding: '0px', border: '0px' }}
                id={screenReaderTextId}
                aria-hidden='true'>
                {extractContent(content)}
            </span>
        </>
    );
};

export default CategoryDescriptionCallout;