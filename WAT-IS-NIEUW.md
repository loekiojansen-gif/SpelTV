# Spel TV: wat is er nieuw op deze branch

Deze branch (`speltv-pimp`) bouwt verder op `main`. Er is niets verwijderd: alle 16 bestaande
kanalen werken zoals voorheen en opgeslagen gegevens (spelers, routes, scores, eigen kanaalvolgorde)
blijven bewaard.

## Zelf proberen

```bash
bun install
```

```bash
bun run dev
```

Open daarna <http://localhost:3000>. Het leukst op een telefoon: open het netwerkadres dat de
terminal laat zien.

Geen Bun? Met npm werkt het ook, maar dan met een extra vlag (een gewone `npm install` struikelt
over een versieconflict tussen Vite en esbuild dat al in het project zat):

```bash
npm install --legacy-peer-deps
```

```bash
npm run dev
```

Een losse versie om online te zetten (relatieve paden, zonder service worker) maak je met:

```bash
bun run build:artifact
```

Die komt in de map `dist-artifact/` en draait vanaf elke webmap.

## Vijf nieuwe kanalen (pagina 2)

| Kanaal | Wat is het | Bijzonder |
|---|---|---|
| **Op je Kop** | Telefoon op je voorhoofd, de rest omschrijft het woord | Kantel omlaag voor goed en omhoog voor pas (bewegingssensor). Tikken werkt ook. Gebruikt het woordenboek van 30 Seconds plus 5 eigen categorieën. |
| **Spion** | Iedereen kent het geheime woord, behalve de spion | Rol bekijken door een knop ingedrukt te houden, klok, stemmen, punten per ronde. 6 categorieën, 1 of 2 spionnen. |
| **Snelste Vinger** | Reactieduel voor 2 tot 4 spelers op één scherm | Ieder een eigen vlak, nepseinen, strafpunt bij te vroeg tikken, reactietijd in milliseconden. Op een laptop met de toetsen Q, P, Z en M. |
| **Hoger of Lager** | Gok de volgende kaart, de pot loopt op | Kaarten draaien echt om, doorgeven na een reeks, dubbele pot bij een gelijke kaart, slokkenstand per speler. |
| **Ik heb nog nooit** | Stellingen in drie niveaus | 120 stellingen (Gezellig, Feest, Pittig), eigen stellingen toevoegen, kaarten wegvegen. |

De nieuwe kanalen delen één spelerslijst: wie je bij Spion toevoegt, staat ook klaar bij
Op je Kop en Hoger of Lager. Poppetjes van het Spelers Pleintje verschijnen er vanzelf bij.

## Hoofdmenu

- **Bug opgelost:** tegels van de volgende pagina staken aan de rand van het scherm uit.
- **Scherm wordt gevuld:** vierkante tegels op een staande telefoon, 4 x 3 op tablet, laptop en tv,
  6 x 2 op een liggende telefoon. Het artwork schaalt mee.
- **Voorvertoning:** tik op een kanaal en je ziet eerst een groot scherm met de spelregels, het aantal
  spelers en de speelduur, met de knoppen Menu en Start. Uit te zetten via het envelopje.
- **Grotere pijlen**, paginabolletjes en een zenderbalk met wisselende tips.
- **NIEUW-lintje** op kanalen die nog niet geopend zijn.
- **Opstartanimatie:** een beeldbuis die aanspringt met het Spel TV logo (één keer per sessie).
- Een eigen kanaalvolgorde blijft bewaard; nieuwe kanalen schuiven in de lege "Binnenkort" plekken.

## Onder de motorkap

- **Sneller opstarten:** elk kanaal wordt pas geladen als je het opent. De eerste download ging van
  1,1 MB naar 0,5 MB. Kanalen draaien ook niet meer allemaal tegelijk onzichtbaar mee.
- **Animaties die al bedoeld waren:** de klassen `animate-in`, `fade-in`, `zoom-in-95` en
  `slide-in-from-*` stonden op 90 plekken in de code maar hadden geen definitie. Die is toegevoegd,
  waardoor alle bestaande vensters nu vloeiend binnenkomen.
- **Geluid aan/uit** wordt onthouden na herladen.
- **Geen pop-ups meer** in de Bibliotheek: `alert()` en `confirm()` zijn vervangen door een melding en
  een bevestiging in het venster zelf, omdat browsers die in een ingebedde pagina vaak blokkeren.
- Merknamen van Nintendo (Wii, Mii) zijn uit de zichtbare teksten gehaald.
- Er zijn geen nieuwe pakketten toegevoegd en `package.json` is niet gewijzigd.

## Waar staat wat

| Map of bestand | Inhoud |
|---|---|
| `src/components/OpJeKop/`, `Spion/`, `SnelsteVinger/`, `HogerLager/`, `Nooit/` | De vijf nieuwe spellen, elk met eigen woorden of stellingen in een apart databestand |
| `src/components/Shared/` | Gedeelde bouwstenen: spelerslijst, opslag, reset-venster |
| `src/components/WiiHub/ChannelPreview.tsx` | De voorvertoning |
| `src/components/WiiHub/channelMeta.ts` | Spelers, speelduur en kleur per kanaal |
| `src/components/WiiHub/NewChannelVisuals.tsx` | Het artwork van de nieuwe tegels |
| `src/components/WiiHub/BootSplash.tsx` | De opstartanimatie |

## Ideeën voor een volgende ronde

- **Speelavond:** elk spel levert punten op voor één klassement van de avond, met prijzen aan het eind.
- **Tv-stand:** het scorebord groot op een tweede scherm.
- De drie overgebleven "Binnenkort" plekken, bijvoorbeeld voor Teken & Raad.
