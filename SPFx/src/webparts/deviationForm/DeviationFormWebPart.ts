import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneLabel,
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
  private orgUnits: string[];

  public render(): void {
    const value: IDeviationFormContext = {
      config: config as IAppConfig,
      organization: this.organization,
      unit: this.unit,
      orgUnits: this.orgUnits,
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

    const body = `{
                  "query": "query { orgEnheter(where: {nomNivaa: ARBEIDSOMRAADE}){ orgEnhet{ id navn nomNivaa gyldigFom gyldigTom organiseringer(retning: under){ orgEnhet{ navn nomNivaa orgEnhetsType gyldigFom gyldigTom } } } } }"
                  }`;
    const nomClient = await this.context.aadHttpClientFactory.getClient('api://prod-gcp.nom.nom-api');
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('target-app', 'nom-api');
    headers.append('target-client-id', '3e962532-1cd2-4bb4-8222-515c83df854a');
    const response = await nomClient.post('https://org-ekstern-proxy.nav.no/graphql', AadHttpClient.configurations.v1, { body, headers });
    const json = await response.json();
    const rawUnits = json.data.orgEnheter;
    const filteredUnits = rawUnits.filter(unit => ((new Date(unit.orgEnhet.gyldigTom) > new Date() || !unit.orgEnhet.gyldigTom) && unit.orgEnhet.nomNivaa === "ARBEIDSOMRAADE"
      && unit.orgEnhet.organiseringer.length > 0));
    let subUnits = [];
    filteredUnits.forEach(unit => {
      let u = unit.orgEnhet.organiseringer.filter(org => org.orgEnhet.orgEnhetsType === "DIR");
      if (u.length > 0) subUnits = subUnits.concat(u);
    });
    const allUnitNames = filteredUnits.map(unit => unit.orgEnhet.navn).concat(subUnits.map(unit => unit.orgEnhet.navn));

    const client: AadHttpClient = await this.context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
    const res = await client.get('https://graph.microsoft.com/v1.0/me?$select=companyName,department,mail,onPremisesSamAccountName', AadHttpClient.configurations.v1);
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

    this.orgUnits = allUnitNames.sort();
    this.unit = user.department;
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
                }),
                PropertyPaneLabel('', {
                  text: `v${this.manifest.version}`
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
