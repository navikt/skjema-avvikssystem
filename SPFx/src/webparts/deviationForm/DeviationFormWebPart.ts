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
import { IAppConfig, IOrgUnit, IOrgUnitOption } from './types';
import { AadHttpClient } from '@microsoft/sp-http';
import { spfi, SPFx } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/items/get-all";

export interface IDeviationFormWebPartProps {
  webpartTitle: string;
  functionUrl: string;
}

export default class DeviationFormWebPart extends BaseClientSideWebPart<IDeviationFormWebPartProps> {
  private organization: string;
  private unit: string;
  private reporterEmail: string;
  private reporterNAVIdentId: string;
  private orgUnits: IOrgUnitOption[];

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
    const sp = spfi().using(SPFx(this.context));

    const units = await sp.web.lists.getByTitle('Enheter').items.select('NOMId', 'Title').getAll();

    /*     const body = `{
                            "query": "query { orgEnheter(where: {nomNivaa: ARBEIDSOMRAADE}){ orgEnhet{ id navn nomNivaa gyldigFom gyldigTom organiseringer(retning: under){ orgEnhet{ navn nomNivaa orgEnhetsType gyldigFom gyldigTom } } } } }"
                          }`;
        const parentUnitsBody = `{
                                       "query": "query { orgEnheter(where: { nomNivaa: ARBEIDSOMRAADE }){ orgEnhet{ id navn nomNivaa gyldigFom gyldigTom organiseringer(retning: over){ orgEnhet { navn nomNivaa orgEnhetsType gyldigFom gyldigTom organiseringer(retning: over){ orgEnhet{ navn nomNivaa orgEnhetsType gyldigFom gyldigTom organiseringer(retning: over){ orgEnhet{ navn nomNivaa orgEnhetsType gyldigFom gyldigTom } } } } } } } } }"
                                     }`;
        const nomClient = await this.context.aadHttpClientFactory.getClient('api://prod-gcp.nom.nom-api');
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('target-app', 'nom-api');
        headers.append('target-client-id', '3e962532-1cd2-4bb4-8222-515c83df854a');
        const response = await nomClient.post('https://org-ekstern-proxy.nav.no/graphql', AadHttpClient.configurations.v1, { body, headers });
        const json = await response.json();
        const rawUnits: IOrgUnit[] = json.data.orgEnheter;
    
        const parentUnitsResponse = await nomClient.post('https://org-ekstern-proxy.nav.no/graphql', AadHttpClient.configurations.v1, { body: parentUnitsBody, headers });
        const parentsJson = await parentUnitsResponse.json();
        const rawUnitsOver: IOrgUnit[] = parentsJson.data.orgEnheter;
    
        const filteredUnits = this.filterUnits(rawUnits);
        const filteredUnitsOver = this.filterUnits(rawUnitsOver);
    
        let subUnits = [];
        filteredUnits.forEach(unit => {
          let u = unit.orgEnhet.organiseringer.filter(org => org.orgEnhet.orgEnhetsType === "DIR");
          if (u.length > 0) subUnits = subUnits.concat(u);
        });
    
        let parentUnits: IOrgUnit[] = [];
        filteredUnitsOver.forEach(unit => {
          this.extractOrgUnits(unit, parentUnits);
        });
    
        const unitOptions: IOrgUnitOption[] = uniq(filteredUnits.map(unit => ({ id: unit.orgEnhet.id, name: unit.orgEnhet.navn })).concat(subUnits.map(unit => ({ id: unit.orgEnhet.id, name: unit.orgEnhet.navn })).concat(parentUnits.map(unit => ({ id: unit.orgEnhet.id, name: unit.orgEnhet.navn })))));
     */

    const client: AadHttpClient = await this.context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
    const res = await client.get('https://graph.microsoft.com/v1.0/me?$select=companyName,department,mail,onPremisesSamAccountName', AadHttpClient.configurations.v1);
    const user = await res.json();
    switch (user.companyName) {
      case 'NAV Kommunal':
        this.organization = 'Municipal';
        break;
      case 'NAV Statlig':
        this.organization = 'State';
        break;
      case 'Ikke NAV':
        this.organization = 'External';
        break;
      default:
        this.organization = 'State'
        break;
    }

    this.orgUnits = units.map(unit => ({ id: unit.NOMId, name: unit.Title })); //unitOptions.sort();
    this.unit = user.department;
    this.reporterEmail = user.mail;
    this.reporterNAVIdentId = user.onPremisesSamAccountName;
  }

  private filterUnits(rawUnits: IOrgUnit[]) {
    return rawUnits.filter(unit => ((new Date(unit.orgEnhet.gyldigTom) > new Date() || !unit.orgEnhet.gyldigTom) && unit.orgEnhet.nomNivaa === "ARBEIDSOMRAADE"
      && unit.orgEnhet.organiseringer.length > 0));
  }

  private extractOrgUnits(unit: IOrgUnit, result: IOrgUnit[]): void {
    if (unit.orgEnhet && unit.orgEnhet.organiseringer) {
      for (const org of unit.orgEnhet.organiseringer) {
        result.push(org);
        this.extractOrgUnits(org, result);
      }
    }
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
