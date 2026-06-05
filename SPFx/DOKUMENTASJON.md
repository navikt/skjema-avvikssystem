# Avvikssystem - SPFx Løsningsdokumentasjon

## Oversikt

Dette er en SharePoint Framework (SPFx) webdel som lar NAV-ansatte registrere og søke etter avvik i ulike kategorier. Løsningen integrerer med Salesforce via Azure Functions for å lagre avvik.

### Hovedfunksjoner
- Registrering av avvik i tre hovedkategorier (HMS, Fysisk sikkerhet, Personvern og informasjonssikkerhet)
- Søk i eksisterende avvik basert på avviksnummer
- Dynamisk skjemalogikk basert på JSON-konfigurasjon
- Integrasjon med SharePoint-lister for organisasjonsdata
- Lagring av avvik til Salesforce via Azure Function

## Arkitektur

### Komponenter

```
┌─────────────────────────────────────────────────────────────┐
│                    SharePoint Side                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Avviksskjema Web Part (SPFx)                  │  │
│  │    (JSON-baserte dynamiske skjemaer)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     SharePoint Liste: "Enheter"                       │  │
│  │     (NOMId, Title, Avtale, UnitNumber)                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     SharePoint Liste: "Databehandleravtaler"          │  │
│  │     (Title, Kommunenavn, Organisasjonsnummer,         │  │
│  │      Kontaktsenter)                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
                ┌──────────────────────────┐
                │    Azure Function        │
                │                          │
                │  • POST: Lagre avvik     │
                │  • GET: Søk i avvik      │
                └──────────────────────────┘
                            │
                            │ API-integrasjon
                            ▼
                ┌──────────────────────────┐
                │      Salesforce          │
                │  (Avvikslagring)         │
                └──────────────────────────┘
```

### Komponentbeskrivelse

#### 1. **Web Part (DeviationFormWebPart.ts)**
Hovedkomponenten som:
- Initialiserer SPFx-kontekst
- Henter data fra SharePoint-listene "Enheter" (organisasjonsenheter fra NOM-systemet) og "Databehandleravtaler" (kommuner og kontaktsentre)
- Setter opp konfigurasjonsdata fra `config.ts`
- Leverer context til React-komponenter via `DeviationFormContext`

**Web Part Properties:**
- `webpartTitle`: Tittel som vises i webdelen
- `functionUrl`: URL til Azure Function backend
- `environment`: Miljø (prod/test) for å skille mellom test- og produksjonsmiljø
- `debugMode`: Aktiverer debug-modus
- `debugNAVIdent`, `debugOrganization`, `debugUnitNumber`: Debug-parametere

#### 2. **App.tsx (Hovedcontainer)**
React-hovedkomponent som:
- Viser skjemavelger (tre hovedkategorier)
- Håndterer søkefunksjonalitet for eksisterende avvik
- Administrerer navigasjonsflyt og breadcrumbs
- Viser "Teaching Bubbles" for brukerveiledning

#### 3. **DeviationForm Component**
Dynamisk skjemakomponent som:
- Rendrer skjemasider basert på JSON-konfigurasjon
- Håndterer ulike felttyper (tekstfelt, dropdown, datofelt, etc.)
- Validerer input og viser feilmeldinger
- Styrer navigasjon mellom skjemasider

#### 4. **ActionsHandler**
Forretningslogikk-klasse som håndterer:
- **SwitchForm**: Bytte mellom skjematyper
- **NextPage/PreviousPage**: Navigasjon mellom sider
- **NavigateFromBreachQuestion**: Spesiell logikk for personvernbrudd
- **Submit**: Sender skjemadata til Azure Function
  - Filtrerer felter basert på `fieldsToInclude`
  - Håndterer anonyme vs. navngitte avvik
  - Sender POST-request til Salesforce via Azure Function

#### 5. **Skjemakonfigurasjon (JSON-filer)**
JSON-basert konfigurasjon som definerer:
- Skjemasider (`pages`)
- Felter (`fields`) med type, valideringsregler, betingelser
- Handlinger (`actions`) for knapper
- Betinget logikk (`renderConditions`, `conditionalOptions`)
- Beskrivelser og hjelpetekster

**Eksempel på side-struktur:**
```json
{
  "key": 1,
  "type": "form",
  "fields": [
    {
      "key": "category",
      "type": "choice",
      "label": "Kategori",
      "required": true,
      "options": ["Kategori 1", "Kategori 2"]
    }
  ],
  "actions": [
    {
      "key": "next",
      "label": "Neste",
      "invoke": {
        "functionName": "NextPage"
      }
    }
  ]
}
```

#### 6. **SharePoint-liste: "Enheter"**
Lagrer organisasjonsdata:
- **NOMId**: ID fra NOM
- **Title**: Enhetsnavn
- **Avtale**: Indikerer om enheten har databehandleravtale
- **UnitNumber**: Enhetsnummer

Listen er en eksportert kopi fra NOM og brukes for å:
- Validere brukerens tilhørighet til enhet
- Vise relevante enheter i dropdown
- Sjekke databehandleravtaler

#### 7. **SharePoint-liste: "Databehandleravtaler"**
Lagrer avtaledata for kommuner og kontaktsentre:
- **Title**: Enhetsnavn
- **Kommunenavn**: Navn på kommunen
- **Organisasjonsnummer**: Kommunens organisasjonsnummer
- **Kontaktsenter**: Indikerer om enheten er et kontaktsenter

Listen brukes for å:
- Validere om valgt kommune har databehandleravtale
- Sjekke om enheten er registrert som kontaktsenter
- Vise relevante kommuner i dropdown

#### 8. **Azure Function Backend**
REST API som:
- **POST (mode=post)**: Mottar payload fra webdel, sender til Salesforce API, returnerer avviksnummer
- **POST (mode=get)**: Søker etter eksisterende avvik basert på avviksnummer og brukerrettigheter

**Request-struktur:**
```javascript
// Lagre avvik
POST {functionUrl}&mode=post&environment={environment}
Body: {
  form: "HMS",
  category: "...",
  description: "...",
  reporterEmail: "...",
  // ... andre felter
}

// Søk avvik
POST {functionUrl}&mode=get&environment={environment}
Body: {
  reporterNAVIdentId: "...",
  avvikNumber: "AV-123456",
  isVerneombud: false
}
```

#### 9. **Salesforce**
Sluttmål for avviksdata:
- Lagrer avvik
- Genererer avviksnummer (format: AV-XXXXXX)
- Gjør data tilgjengelig for videre saksbehandling

## Dataflyt

### Registrering av avvik

```
1. Bruker åpner SharePoint-side med webdel
   ↓
2. WebPart.onInit() henter data fra "Enheter"- og "Databehandleravtaler"-listene
   ↓
3. Bruker velger skjematype (HMS/Fysisk sikkerhet/Personvern)
   ↓
4. App.tsx setter selectedForm → DeviationForm renderer
   ↓
5. Bruker fyller ut skjema side for side
   │  • Validering per side
   │  • Dynamisk logikk (betingede felt/sider)
   ↓
6. På siste side: "Send inn"-knapp
   ↓
7. ActionsHandler.Submit() kalles
   │  • Filtrerer/formaterer data
   │  • POST til Azure Function
   ↓
8. Azure Function mottar data
   │  • Validerer
   │  • Sender til Salesforce API
   ↓
9. Salesforce lagrer avvik og returnerer avviksnummer
   ↓
10. Avviksnummer vises til bruker
```

### Søk etter avvik

```
1. Bruker klikker "Søk etter avvik"
   ↓
2. SearchBox vises (App.tsx)
   ↓
3. Bruker skriver inn avviksnummer (AV-XXXXXX)
   ↓
4. getCase() kalles
   │  • POST til Azure Function (mode=get)
   │  • Sender NAVIdentId for tilgangskontroll
   ↓
5. Azure Function søker i Salesforce
   ↓
6. Resultat vises i SearchResult-komponent
```

## Tekniske detaljer

### Teknologier
- **SPFx**: 1.20.0
- **React**: 16.13.1
- **TypeScript**: 4.7.4
- **PnP/sp**: 3.18.0 (SharePoint REST API-wrapper)
- **Fluent UI**: @fluentui/react-hooks

### Filstruktur

```
src/
├── config/
│   ├── config.ts                    # Hovedkonfigurasjon
│   ├── ActionsHandler.ts            # Forretningslogikk
│   ├── ActionsHandlerTypes.ts       # Type-definisjoner
│   └── forms/
│       ├── HMS.json
│       ├── Fysisk sikkerhet.json
│       └── Personvern og informasjonssikkerhet.json
│
└── webparts/
    └── deviationForm/
        ├── DeviationFormWebPart.ts       # Web part entry point
        ├── DeviationFormContext.tsx      # React Context
        ├── types.ts                      # Type-definisjoner
        ├── shared.ts                     # Delte funksjoner
        └── components/
            ├── App.tsx                   # Hovedcontainer
            ├── DeviationForm/            # Skjemakomponent
            ├── ValidationPage/           # Validering
            ├── SearchResult/             # Søkeresultat
            └── ...                       # Andre komponenter
```

### State-håndtering

Løsningen bruker React hooks for state:
- **selectedForm**: Valgt skjematype
- **breadcrumbs**: Navigasjonssti
- **searchState**: Søkefunksjonalitet
- **bubbleState**: Teaching bubbles
- **values**: Skjemadata (i DeviationForm)

Context API (DeviationFormContext) deler:
- SharePoint-klient (PnP)
- Organisasjonsdata
- Konfigurasjon
- Brukerinformasjon

### Valideringslogikk

Validering skjer på flere nivåer:
1. **Feltvalidering**: required, pattern, custom conditions
2. **Sidevalidering**: ValidationPage-komponent kjører `renderConditions`
3. **Pre-submit**: ActionsHandler filtrerer og formaterer data

## Konfigurasjon og deployment

### Lokal utvikling

```powershell
# Installer avhengigheter
npm install

# Start lokal server
gulp serve

# Build for testing
npm run build-patch  # Øker patch-versjon og bygger
npm run build-minor  # Øker minor-versjon og bygger
npm run build-major  # Øker major-versjon og bygger
```

### Build-prosess

Build-scripts (i package.json):
1. **prebuild-patch/minor/major**: Øker versjonsnummer (`npm version`)
2. **build-***: 
   - `gulp bundle --ship`: Bundler kode for produksjon
   - `gulp package-solution --ship`: Lager .sppkg-fil
   - `start "" ".\sharepoint\solution"`: Åpner mappen med pakken

Output: `sharepoint/solution/deviation-form.sppkg`

### Deployment

1. **Test-miljø**:
   - Lokal app-katalog på test-site
   - `environment` property satt til "test"
   - Peker til test-Azure Function

2. **Produksjon**:
   - Tenant app-katalog
   - `environment` property satt til "prod"
   - Peker til prod-Azure Function

### Web Part-konfigurasjon

Ved plassering på SharePoint-side må følgende konfigureres:
- **webpartTitle**: Tittel (f.eks. "Registrer avvik")
- **functionUrl**: URL til Azure Function (inkl. query parameters)
- **environment**: "test" eller "prod"
- **debugMode**: false (sann kun for lokal testing)

## Utvidelse av løsningen

### Legge til nytt skjema

1. Opprett ny JSON-fil i `src/config/forms/`
2. Følg eksisterende skjema-struktur
3. Legg til i `config.ts`:
   ```typescript
   import NyttSkjema from './forms/Nytt skjema.json';
   export default {
     forms: [HMS, FysiskSikkerhet, PersonvernOgInformasjonsSikkerhet, NyttSkjema],
     ...
   }
   ```
4. Legg til lokaliserte strenger i `loc/en-us.js` og `loc/nb-no.js`

### Legge til nytt felttype

1. Utvid `DeviationFormPageType` enum i `types.ts`
2. Opprett ny komponent i `components/`
3. Legg til rendering i `DeviationForm.tsx`

### Legge til ny action

1. Legg til metode i `ActionsHandler.ts`
2. Konfigurer i JSON: `"invoke": { "functionName": "NyMetode" }`

## Avhengigheter

### SharePoint
- Liste "Enheter" må eksistere med korrekt schema (NOMId, Title, Avtale, UnitNumber)
- Liste "Databehandleravtaler" må eksistere med korrekt schema (Title, Kommunenavn, Organisasjonsnummer, Kontaktsenter)
- PnP JS må ha tilgang til begge listene

### Azure
- Azure Function må være tilgjengelig
- Korrekt CORS-konfigurasjon for SharePoint-domener

### Salesforce
- API-integrasjon må være konfigurert i Azure Function
- Riktige felter/objekter må eksistere i Salesforce

## Vedlikehold

### Oppdatering av SharePoint-lister
- **"Enheter"-listen** må periodisk oppdateres fra NOM-systemet for å reflektere organisasjonsendringer
- **"Databehandleravtaler"-listen** må oppdateres når nye kommuner inngår avtaler eller når kontaktsentre endres

### Versjonering
Løsningen bruker semantic versioning (major.minor.patch):
- **Patch**: Bugfixes
- **Minor**: Nye features, bakoverkompatible
- **Major**: Breaking changes

---

**Sist oppdatert**: 2026-06-05
