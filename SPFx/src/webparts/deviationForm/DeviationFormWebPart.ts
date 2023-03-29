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
import { IAppConfig } from './types';
import { AadHttpClient } from '@microsoft/sp-http';

export interface IDeviationFormWebPartProps {
  webpartTitle: string;
  functionUrl: string;
}

export default class DeviationFormWebPart extends BaseClientSideWebPart<IDeviationFormWebPartProps> {
  private organization: string;
  private unit: string;
  private reporterEmail: string;
  private reporterNAVIdentId: string;

  public render(): void {
    const value: IDeviationFormContext = {
      config: config as IAppConfig,
      organization: this.organization,
      unit: this.unit,
      reporterEmail: this.reporterEmail,
      reporterNAVIdentId: this.reporterNAVIdentId,
      functionUrl: this.properties.functionUrl
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

  protected async onInit(): Promise<void> {
    await super.onInit();
/*     let body = `query {
      orgEnheter(where: {}) {
           orgEnhet {
             id
             navn
             gyldigFom
             gyldigTom
             organiseringer {
               retning
               orgEnhet {
                 id
               }
             }
           }
       }
   }`
    const testClient = await this.context.aadHttpClientFactory.getClient('api://prod-gcp.nom.nom-api');
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // https://nom.nav.no/nom-api/graphql
    let test = await testClient.post('https://nom.nav.no/nom-api/graphql', AadHttpClient.configurations.v1, { body, headers });
    console.log(test); */
    const client: AadHttpClient = await this.context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
    const res = await client.get('https://graph.microsoft.com/v1.0/me?$select=companyName,officeLocation,mail,onPremisesSamAccountName', AadHttpClient.configurations.v1);
    const user = await res.json();
    switch (user.companyName) {
      case 'NAV Kommunal':
        this.organization = 'Kommunal';
        break;
      case 'NAV Statlig':
        this.organization = 'Statlig';
        break;
      case 'Ikke NAV':
        this.organization = 'Ekstern';
        break;
      default:
        break;
    }
    this.unit = user.officeLocation;
    this.reporterEmail = user.mail;
    this.reporterNAVIdentId = user.onPremisesSamAccountName;
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
                }),
                PropertyPaneTextField('functionUrl', {
                  label: strings.FunctionURLLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
