# Avvikssystem

## Oversikt

En SharePoint Framework (SPFx) webdel som lar NAV-ansatte registrere og søke etter avvik i tre hovedkategorier: HMS, Fysisk sikkerhet, og Personvern og informasjonssikkerhet. Løsningen bruker dynamiske JSON-baserte skjemaer og integrerer med Salesforce via Azure Functions for lagring av avvik.

**Hovedfunksjoner:**
- Dynamisk skjemaoppbygging basert på JSON-konfigurasjon
- Integrasjon med SharePoint-liste for organisasjonsdata (NOM-enheter)
- Lagring til Salesforce via Azure Function backend
- Søkefunksjonalitet for eksisterende avvik
- Støtte for anonym registrering
- Multi-miljø støtte (test/prod)

📄 **[Les fullstendig dokumentasjon](DOKUMENTASJON.md)** for detaljert arkitektur, dataflyt og integrasjoner.

## SharePoint Framework versjon

![version](https://img.shields.io/badge/version-1.20-green.svg)

## Forutsetninger

- SharePoint Online miljø
- SharePoint-liste kalt "Enheter" med felter: NOMId, Title, Avtale, UnitNumber
- SharePoint-liste kalt "Databehandleravtaler" med felter: Title, Kommunenavn, Organisasjonsnummer, Kontaktsenter
- Azure Function for backend-integrasjon med Salesforce
- Node.js versjon 18.17.1+
- Tilgang til NAV tenant app-katalog (for produksjonsdeploy)

## Utvikling

```powershell
# Installer avhengigheter
npm install

# Start lokal utviklingsserver
gulp serve --nobrowser

# Bygg pakke (øker patch-versjon, bygger og åpner pakke-mappen)
npm run build-patch

# Bygg pakke med ny funksjonalitet (øker minor-versjon, bygger og åpner pakke-mappen)
npm run build-minor

# Bygg pakke med breaking changes (øker major-versjon, bygger og åpner pakke-mappen)
npm run build-major

# Bygg ny pakke uten å øke versjonsnummer (clean + build)
npm run rebuild
```

**Output:** `sharepoint/solution/deviation-form.sppkg`

### Konfigurasjon av webdel

Etter deployment må følgende properties konfigureres:
- **webpartTitle**: Tittel som vises i webdelen
- **functionUrl**: URL til Azure Function backend
- **environment**: "test" eller "prod"
- **debugMode**: false (true kun for lokal utvikling)

## Funksjoner

Denne løsningen demonstrerer følgende konsepter:

- **JSON-drevet skjemaoppbygging**: Dynamiske skjemaer definert via JSON-filer (HMS.json, Fysisk sikkerhet.json, Personvern og informasjonssikkerhet.json)
- **React Context API**: Deling av konfigurasjon og SharePoint-klient mellom komponenter
- **PnP JS**: Moderne tilgang til SharePoint REST API
- **Fluent UI**: Konsistente UI-komponenter fra Microsoft
- **ActionsHandler pattern**: Sentralisert forretningslogikk for skjemahandlinger
- **Multi-miljø støtte**: Konfigurerbar deployment til test/prod miljøer
- **Azure Functions integrasjon**: Backend-kommunikasjon for Salesforce-integrasjon
- **Versjonering**: Automatisk versjonering via npm scripts

### Arkitektur

```
SharePoint (SPFx Web Part)
    ↓
SharePoint Liste "Enheter" (NOM-data)
    ↓
Azure Function (Backend)
    ↓
Salesforce API (Avvikslagring)
```

Se [DOKUMENTASJON.md](DOKUMENTASJON.md) for detaljert arkitekturdiagram og dataflyt.