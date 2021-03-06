import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DeviationFormWebPartStrings';
import App from './components/App';
import config from '../../config/config';
import { DeviationFormContext, IDeviationFormContext } from './DeviationFormContext';
import { IDeviationForm } from './types';

export interface IDeviationFormWebPartProps {
  webpartTitle: string;
}

export default class DeviationFormWebPart extends BaseClientSideWebPart<IDeviationFormWebPartProps> {

  public render(): void {
    const value: IDeviationFormContext = {
      forms: config as IDeviationForm[]
    };

    const element: React.ReactElement<{}> = (
      React.createElement(DeviationFormContext.Provider, { value },
        React.createElement(App,
          {
            title: this.properties.webpartTitle
          }))
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: strings.SettingsGroupName,
              groupFields: [
                PropertyPaneTextField('webpartTitle', {
                  label: strings.WebpartTitleLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
