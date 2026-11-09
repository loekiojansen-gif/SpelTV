import { CardGame } from './types';

export const DEFAULT_GAMES: CardGame[] = [
  {
    id: 'kingsen',
    title: 'Kingsen',
    subtitle: 'De ultieme studenten- en feestklassieker rondom de koningsbeker',
    category: 'kaarten',
    required: ['Stok kaarten (zonder jokers)', 'Groot bierglas in het midden (de Koningsbeker)', 'Voldoende pils / drank'],
    players: '3 - 12 spelers',
    intensity: 4,
    durationMinutes: '20 - 45 min',
    iconEmoji: '👑',
    coverColor: 'burgundy',
    description:
      'Zet een groot glas (de Koningsbeker) in het midden van de tafel en verspreid een gesloten cirkel van speelkaarten eromheen. De cirkel mag niet verbroken worden! Pak om de beurt een kaart met de klok mee en voer direct de bijbehorende actie uit. Trek je de vierde Koning? Dan moet je de volle koningsbeker in één teug leegdrinken!',
    rulesSteps: [
      {
        title: 'Opstelling & De Cirkel',
        content: 'Plaats het grote glas in het midden. Verspreid alle kaarten in een gesloten kring rondom het glas. Wie de kring verbreekt (zodat er een gat ontstaat) moet direct een flinke strafslok nemen!',
      },
      {
        title: 'Kaart Trekken',
        content: 'Om de beurt trekt een speler met de klok mee een kaart. Toon de kaart aan iedereen en voer direct de kaartbetekenis uit.',
      },
      {
        title: 'De Vier Koningen',
        content: 'De eerste drie spelers die een Koning trekken, gieten een scheut van hun eigen drankje in de centrale Koningsbeker. De speler die de 4e en laatste Koning trekt, moet de hele Koningsbeker adten!',
      },
    ],
    cardMeanings: [
      { key: '2', action: 'Zelf drinken', description: 'Neem zelf 2 slokken van je drankje.' },
      { key: '3', action: 'Uitdelen', description: 'Deel 3 slokken uit aan één of meerdere medespelers.' },
      { key: '4', action: 'Categorie', description: 'De trekker noemt een categorie (bijv. automerken of biersoorten). Ga de kring rond, wie twijfelt of herhaalt drinkt.' },
      { key: '5', action: 'Plaskaart / Mannen drinken', description: 'Traditioneel drinken alle mannen. Kan ook bewaard worden als enige geldige pas om naar het toilet te mogen!' },
      { key: '6', action: 'Opdracht / Waarheid', description: 'Voer een gênante opdracht uit of beantwoord een pikante vraag van de groep. Weigeren = 3 slokken.' },
      { key: '7', action: 'Juffen', description: 'Begin met tellen vanaf 1. Bij 7, veelvouden van 7 (14, 21...) of getallen met een 7 (17, 27) roep je JUF en wisselt de draairichting!' },
      { key: '8', action: 'Regel Maken', description: 'Verzin een nieuwe spelregel (bijv. alleen met links drinken, geen voornamen noemen). Wie hem breekt drinkt.' },
      { key: '9', action: 'Regel Afschaffen', description: 'Schaf een bestaande regel naar keuze af (of bewaar hem als troef).' },
      { key: '10', action: 'Quizmaster', description: 'Jij bent de Quizmaster! Iedereen die antwoord geeft op een vraag van jou moet drinken, totdat de volgende 10 wordt getrokken.' },
      { key: 'Boer (J)', action: 'Wijzen', description: 'Iedereen moet zo snel mogelijk naar de trekker (of het plafond) wijzen. Wie als laatste wijst drinkt.' },
      { key: 'Vrouw (Q)', action: 'Hand omhoog / Vrouwen drinken', description: 'Steek zo snel mogelijk je hand in de lucht (of alle vrouwen aan tafel drinken direct).' },
      { key: 'Heer (K)', action: 'Op het glas (Koning)', description: 'Eerste 3 Koningen: gooi drank in de centrale beker. 4e Koning: drink de hele beker leeg!' },
      { key: 'Aas (A)', action: 'Draai pot / Waterval', description: 'Iedereen begint tegelijk te drinken. Je mag pas stoppen als degene links van je stopt!' },
    ],
    tips: [
      'Gooi bij de Koningsbeker geen giftige mixen bij elkaar tenzij iedereen akkoord is met de studententraditie.',
      'Blijf als Quizmaster subtiel vragen stellen: "Hoe laat is het eigenlijk?" of "Is dit jouw biertje?".',
    ],
  },
  {
    id: 'mexen',
    title: 'Mexen',
    subtitle: 'Het legendarische dobbelspel vol bluf, ridders en dubbele strafslokken',
    category: 'dobbelstenen',
    required: ['Twee dobbelstenen', 'Dobbelbeker en viltje (optioneel)', 'Pils of shotjes'],
    players: '2 - 10 spelers',
    intensity: 4,
    durationMinutes: '15 - 30 min',
    iconEmoji: '🎲',
    coverColor: 'amber',
    description:
      'Gooi omstebeurt met twee dobbelstenen. Het hoogste getal vormt het tiental, het laagste de eenheid (een 5 en 2 is 52). De laagste score aan het einde van de ronde verliest en drinkt. Pas op: elke gegooide Mex (21) verdubbelt de inzet voor de uiteindelijke verliezer (2^aantal mexen)!',
    rulesSteps: [
      {
        title: 'Puntentelling Worpen',
        content: 'Normale worpen: hoogste oog eerst (bijv. 6 en 4 = 64, 4 en 1 = 41). Laagste normale worp is 32. Dubbels zijn meer waard dan normale worpen (11, 22 ... 66). Mex (21) is het allerhoogst!',
      },
      {
        title: 'Aantal Worpen Bepalen',
        content: 'De starter van de ronde mag maximaal 3 keer gooien. Het aantal worpen dat de starter gebruikt, is het maximum voor alle volgende spelers in die ronde.',
      },
      {
        title: 'Verliezer & Mex Verdubbeling',
        content: 'Wie aan het einde van de ronde de laagste score heeft, verliest. De verliezer drinkt: 1 slok standaard, MAAR als er in die ronde Mexen (21) zijn gegooid, drinkt de verliezer 2 tot de macht (aantal keer 21)! Bij 1 mex = 2 slokken, bij 2 mexen = 4 slokken, bij 3 mexen = 8 slokken!',
      },
    ],
    cardMeanings: [
      { key: '21 (Mex)', action: 'De Mex (Allerhoogste Worp)', description: 'Hoogste worp mogelijk! Je bent veilig en de verliezer van de ronde moet 2x zoveel drinken.' },
      { key: '31', action: 'Slok uitdelen & Door', description: 'Gooi je 31? Je deelt direct een slok uit aan een medespeler en mag direct opnieuw gooien.' },
      { key: '100 (Ridder)', action: 'Je wordt de Ridder', description: 'Alle dubbele getallen (11, 22, 33...) die daarna worden gegooid, moet de Ridder meedrinken! Gooi je 100 terwijl je al Ridder bent? Dan benoem je een Co-Ridder.' },
      { key: 'Dubbels (11-66)', action: 'Hoger dan gewone getallen', description: 'Dubbel 1 (11) is hoger dan 65. Dubbel 6 (66) is het hoogste onder de dubbels.' },
      { key: '32', action: 'De Laagste Worp', description: 'De zogenoemde "hondenworp". Vrijwel gegarandeerd dat je aan het einde van de ronde moet zuipen.' },
    ],
    tips: [
      'Stop op tijd als starter: gooi je in je 1e beurt al 65 of een dubbel? Stop direct zodat anderen maar 1 kans hebben!',
      'Houd de Mex-teller goed bij: bij 3 mexen is de verliezer al snel een half biertje of een adtje kwijt.',
    ],
  },
  {
    id: 'mijnenveld',
    title: 'Mijnenveld / Goudmijnen',
    subtitle: 'Een 6x6 raster van gevaar, dobbelcoördinaten en geheime shotjes',
    category: 'kaarten',
    required: ['Stok kaarten (zonder jokers)', '1 Dobbelsteen', 'Aantal gevulde shotglaasjes'],
    players: '3 - 8 spelers',
    intensity: 5,
    durationMinutes: '20 - 40 min',
    iconEmoji: '💣',
    coverColor: 'crimson',
    description:
      'Leg 36 gedekte kaarten in een perfect 6 bij 6 raster op tafel. Zet willekeurig een aantal volle shotglaasjes (mijnen of goudklompen) tussen of op de kaarten. Rol om de beurt 2x met de dobbelsteen: 1e worp voor de horizontale as (1-6), 2e worp voor de verticale as (1-6).',
    rulesSteps: [
      {
        title: 'Het Raster Bouwen',
        content: 'Leg alle kaarten gedekt in 6 rijen van 6 kaarten (36 kaarten in totaal). Plaats 4 tot 8 volle shotjes verspreid op of tussen bepaalde kaarten.',
      },
      {
        title: 'Coördinaten Dobbelen',
        content: 'Gooi 1x voor de X-as (kolom 1 t/m 6) en 1x voor de Y-as (rij 1 t/m 6). Zoek de kaart op de coördinaat.',
      },
      {
        title: 'Mijn Raak? Shotje Drinken!',
        content: 'Staat er een shotje op of direct naast deze kaart? BOEM! Je hebt een mijn geraakt: drink het shotje meteen leeg, vul hem weer en plaats hem op een andere gesloten kaart naar keuze!',
      },
      {
        title: 'Rood of Zwart Voorspellen',
        content: 'Voordat de kaart omgedraaid wordt, raad je ROOD of ZWART. Goed geraden? Je beurt is voorbij en de volgende is aan de beurt. Fout geraden? Neem een strafslok en je moet NOG EEN KEER 2x dobbelen!',
      },
      {
        title: 'Reeds Omgedraaide Kaart?',
        content: 'Kom je op een kaart die al eerder is omgedraaid? Dan mag je gratis een direct aangrenzende gesloten kaart kiezen.',
      },
    ],
    tips: [
      'Strategisch shotjes plaatsen: zet ze op kruispunten van kolommen 3 en 4 omdat spelers daar statistisch vaak op belanden.',
      'Gebruik verschillende likeuren voor de shotjes (bijv. zuur, zoet en pittig) voor extra spanning.',
    ],
  },
  {
    id: 'electric',
    title: 'Electric',
    subtitle: 'Voel de stroomstoot: wie linkt aan zijn buren drinkt het aantal seconden!',
    category: 'kaarten',
    required: ['Stok kaarten (zonder jokers)', 'Bier / mixdrank'],
    players: '4 - 10 spelers',
    intensity: 3,
    durationMinutes: '15 - 25 min',
    iconEmoji: '⚡',
    coverColor: 'sapphire',
    description:
      'Iedere speler krijgt 4 gesloten kaarten voor zich neergelegd. Om de beurt draait een speler één kaart om. Als jouw kaart "linkt" aan die van je directe buurman of buurvrouw, ontstaat er kortsluiting! Iedereen in de stroomketen drinkt het aantal seconden dat op zijn eigen kaart staat.',
    rulesSteps: [
      {
        title: 'Delen',
        content: 'Schud de kaarten en deel aan iedere speler exact 4 gesloten kaarten uit. Leg ze op een rij voor je neer.',
      },
      {
        title: 'Omdraaien & De Schok',
        content: 'Om de beurt draait een speler één van zijn eigen kaarten open. Kijk direct naar de open kaarten van de spelers links en rechts van je.',
      },
      {
        title: 'Wanneer Link je?',
        content: 'Je linkt als je hetzelfde GETAL/PLAATJE hebt (bijv. allebei een 8 of allebei een Boer), OF hetzelfde FIGUUR/SYMBOOL (allebei Harten, allebei Schoppen, etc.).',
      },
      {
        title: 'Kettingreactie & Seconden Drinken',
        content: 'Als je linkt, moet je drinken! Je drinkt het aantal seconden dat op je EIGEN open kaart staat (bijv. een 7 = 7 seconden adten, Boer = 11 sec, Vrouw = 12 sec, Heer = 13 sec, Aas = 14 sec). Een link kan overslaan naar de volgende buurman zolang de connectie doorgaat — de hele keten drinkt tegelijk!',
      },
    ],
    cardMeanings: [
      { key: '2 t/m 10', action: '2 tot 10 seconden drinken', description: 'Je drinkt het aantal seconden gelijk aan de cijferwaarde van de kaart.' },
      { key: 'Boer (J)', action: '11 seconden drinken', description: 'Stevige schok: 11 seconden onafgebroken zuipen.' },
      { key: 'Vrouw (Q)', action: '12 seconden drinken', description: 'Krachtige stroomstoot van 12 seconden.' },
      { key: 'Heer (K)', action: '13 seconden drinken', description: 'Hoogspanning! 13 seconden doordrinken.' },
      { key: 'Aas (A)', action: '14 seconden drinken', description: 'Maximale wattage: 14 tellen lang drinken!' },
    ],
    tips: [
      'Tel hardop en synchroon voor degene die drinkt: "1... 2... 3...".',
      'Als een hele tafel van 6 man tegelijk doorlinkt op hetzelfde symbool, heeft iedereen tegelijk dorst!',
    ],
  },
  {
    id: 'fuckyou',
    title: 'Fuckyou / Naziën',
    subtitle: 'Hoger of lager opgooien en direct een naam roepen voor de klap valt',
    category: 'kaarten',
    required: ['Stok kaarten (zonder jokers)', 'Goed gevulde glazen'],
    players: '3 - 8 spelers',
    intensity: 4,
    durationMinutes: '10 - 20 min',
    iconEmoji: '🖕',
    coverColor: 'crimson',
    description:
      'Verdeel de kaarten onder de spelers. Eén startkaart wordt open op tafel gelegd. Je mag een kaart opgooien die precies ÉÉN HOGER of ÉÉN LAGER is dan de kaart op tafel, terwijl je tegelijkertijd hard de naam van een medespeler roept. Wie geen kaart kan (of te laat reageert), moet drinken!',
    rulesSteps: [
      {
        title: 'Kaarten Verdelen',
        content: 'Schud de stapel en verdeel de kaarten gelijkmatig over alle spelers. Spelers houden hun kaarten in de hand.',
      },
      {
        title: 'Startkaart Openleggen',
        content: 'Draai 1 willekeurige kaart van de overgebleven stapel open in het midden van de tafel.',
      },
      {
        title: 'Opgooien & Naam Roepen',
        content: 'Iedereen speelt tegelijk (geen beurten!). Ligt er een 7? Dan mag iedereen die een 6 of een 8 heeft deze zo snel mogelijk op de stapel smijten en DIRECT een naam van een medespeler roepen: "8, FUCK YOU THOMAS!".',
      },
      {
        title: 'Wie Moet Drinken?',
        content: 'Als niemand meer kan opgooien (of na een stilte van 5 seconden), moet de laatst genoemde naam 2 flinke slokken nemen. De kaarten worden opgeruimd en er start een nieuwe ronde.',
      },
    ],
    tips: [
      'Reactiesnelheid is alles: gooi je kaart op tafel vóórdat iemand anders er een andere waarde oplegt!',
      'Roep de naam luid en duidelijk op het exacte moment van neerleggen.',
    ],
  },
  {
    id: 'fuck_the_dealer',
    title: 'Fuck the Dealer',
    subtitle: 'De legendarische strijd tussen de kaartdealer en dorstige gokkers',
    category: 'kaarten',
    required: ['Stok kaarten (zonder jokers)', 'Bier / shotjes'],
    players: '3 - 10 spelers',
    intensity: 4,
    durationMinutes: '20 - 35 min',
    iconEmoji: '🃏',
    coverColor: 'espresso',
    description:
      'Eén speler is de Dealer en houdt de stapel kaarten gesloten in zijn hand. De spelers gaan de kring rond en proberen de bovenste kaart te raden. Raad je goed? Dan drinkt de dealer! Raad je fout? Dan drink jij. Als er 3 spelers achter elkaar fout raden, wordt de dealer verlost en gaat de stapel door naar de volgende!',
    rulesSteps: [
      {
        title: 'Eerste Gok',
        content: 'De speler links van de dealer doet een 1e gok (bijv. "Een 7"). Als dit meteen goed is, moet de dealer 4 slokken nemen en is de beurt voorbij!',
      },
      {
        title: 'Hoger of Lager Hint',
        content: 'Is de 1e gok fout? Dan vertelt de dealer eerlijk of de geheime kaart HOGER of LAGER is dan het genoemde getal (Aas is hoog).',
      },
      {
        title: 'Tweede Gok',
        content: 'De speler doet een 2e en laatste gok. Is het goed? Dan drinkt de dealer 2 slokken. Is het wéér fout? Dan drinkt de speler zelf het verschil in waarde tussen zijn gok en de werkelijke kaart!',
      },
      {
        title: 'Kaart Openleggen & 3x Fout Regel',
        content: 'De geraden kaart wordt altijd open op tafel gelegd zodat iedereen kan tellen welke kaarten er al uit zijn. Als 3 spelers achter elkaar de kaart niet raden, mag de dealer stoppen en schuift de rol door naar links.',
      },
    ],
    tips: [
      'Houd de open kaarten goed in de gaten! Aan het einde van het spel zitten er van sommige getallen al 3 of 4 kaarten in de aflegstapel, waardoor raden veel makkelijker wordt.',
      'De dealer heeft het in het begin makkelijk, maar aan het einde van het dek wordt de dealer genadeloos afgestraft!',
    ],
  },
  {
    id: 'vrouwen_slaan',
    title: 'Vrouwen slaan',
    subtitle: 'Slapjack studentenstijl: blind tellen, bliksemsnel meppen en de stapel opdrinken',
    category: 'kaarten',
    required: ['Stok kaarten (zonder jokers)', 'Snelle reflexen'],
    players: '3 - 8 spelers',
    intensity: 3,
    durationMinutes: '10 - 20 min',
    iconEmoji: '💥',
    coverColor: 'amethyst',
    description:
      'Verdeel het hele kaartspel blind over alle spelers. Leg omstebeurt met een vloeiende beweging van je af een kaart blind op een centrale stapel terwijl je meetelt: "Aas, 2, 3, 4, 5, 6, 7, 8, 9, 10, Boer, Vrouw, Heer...". Komt het getal overeen met de kaart die je neerlegt? SLAAN! Degene die als laatste op de stapel slaat, moet de hele stapel pakken!',
    rulesSteps: [
      {
        title: 'Kaarten Delen',
        content: 'Verdeel alle 52 kaarten gelijk over iedereen. Niemand mag in zijn eigen handkaarten kijken!',
      },
      {
        title: 'Om de Beurt Omdraaien & Tellen',
        content: 'De eerste speler legt zijn bovenste kaart blind open in het midden en zegt "Aas". De tweede speler legt een kaart neer en zegt "Twee". Dit loopt door tot de Heer, waarna je weer bij Aas begint.',
      },
      {
        title: 'Wanneer Moet Iedereen Slaan?',
        content: 'Iedereen moet zo snel mogelijk met de handpalm op de stapel slaan in 3 situaties:\n1) MATCH: Het getal dat je hardop zegt is identiek aan de kaart die op tafel verschijnt.\n2) DOUBLE: Er worden twee identieke kaarten vlak achter elkaar neergelegd (bijv. twee 8-en).\n3) VROUW (QUEEN): Zodra er een Vrouw wordt neergelegd, moet er ALTIJD geslagen worden!',
      },
      {
        title: 'Straf voor de Traagste',
        content: 'De hand die als allerbovenste op de stapel ligt (de traagste reactie), of wie vals slaat wanneer er niks aan de hand is, pakt de hele centrale stapel op en stopt deze onderaan zijn eigen dek! Daarnaast neemt diegene 1 strafslok per 5 gepakte kaarten.',
      },
    ],
    tips: [
      'Draai de kaart altijd VAN JE AF open, zodat je zelf niet eerder ziet wat er op staat dan je medespelers.',
      'Pas op voor ringen en horloges om blauwe plekken op de tafel te voorkomen!',
    ],
  },
  {
    id: 'bussen',
    title: 'Bussen',
    subtitle: 'Het meest beruchte studentendrinkspel van Nederland in 3 epische fases',
    category: 'kaarten',
    required: ['Stok kaarten (compleet spel)', 'Stevige voorraad bier'],
    players: '3 - 10 spelers',
    intensity: 5,
    durationMinutes: '25 - 45 min',
    iconEmoji: '🚌',
    coverColor: 'burgundy',
    description:
      'Bussen is het ultieme kaartspel waarbij één ongelukkige speler aan het einde "De Bus" in moet. Het spel kent drie fases: 1) Handkaarten verzamelen en raden; 2) De Piramide waarin slokken worden uitgedeeld; 3) De Bus, waar de verliezer 5 kaarten op rij foutloos moet doorstaan!',
    rulesSteps: [
      {
        title: 'Fase 1: Handkaarten Verzamelen (4 Rondes)',
        content: 'Iedereen krijgt 4 kaarten door 4 vragen te beantwoorden:\nRonde 1: Rood of Zwart?\nRonde 2: Hoger of Lager dan je 1e kaart?\nRonde 3: Binnen of Buiten je eerste twee kaarten?\nRonde 4: Welk symbool (Harten, Schoppen, Ruiten of Klaver)?\nFout geraden? Drink een slok! Goed geraden? Je krijgt de kaart in je hand.',
      },
      {
        title: 'Fase 2: De Piramide',
        content: 'Bouw een piramide van gesloten kaarten op tafel (5 rijen: 5, 4, 3, 2, 1 kaart). Draai van onder naar boven kaarten om. Komt de omgedraaide kaart overeen met een kaart in je hand? Leg hem weg en deel het aantal slokken van die rij uit (Rij 1 = 1 slok, Rij 5 = 5 slokken!). Degene die na de piramide de meeste kaarten overhoudt, GAAT DE BUS IN!',
      },
      {
        title: 'Fase 3: De Bus (De Finale)',
        content: 'Leg 5 kaarten gesloten op een rij neer. De verliezer begint bij kaart 1 en raadt of de volgende kaart Hoger of Lager is. Goed geraden? Ga door naar kaart 2. FOUT GERADEN? Neem een slok pils, leg op alle reeds geopende kaarten een nieuwe gesloten kaart en BEGIN WEER HELEMAAL VOORAAN BIJ KAART 1! Pas als je alle 5 kaarten achter elkaar goed hebt, mag je de bus verlaten.',
      },
    ],
    tips: [
      'Gelijke waarde in de bus is altijd FOUT en betekent drinken en opnieuw beginnen!',
      'Moedig de buspassagier aan met luid getoeter wanneer hij voor de vierde keer strandt op kaart 5.',
    ],
  },
  {
    id: 'balzakken',
    title: 'Balzakken',
    subtitle: 'Snel en spannend bluf- en gokdrankspel: Hoger, Lager of BALZAK!',
    category: 'kaarten',
    required: ['Stok kaarten', 'Bier of shotjes'],
    players: '3 - 8 spelers',
    intensity: 4,
    durationMinutes: '15 - 30 min',
    iconEmoji: '🎱',
    coverColor: 'emerald',
    description:
      'Een snel en meeslepend gokdrankspel met kaarten! Er ligt altijd 1 open basiskaart op tafel. Voordat je de volgende kaart trekt, zet je 1 tot 3 slokken in en voorspel je of de getrokken kaart HOGER of LAGER is. Maar pas op voor gelijke kaarten!',
    rulesSteps: [
      {
        title: 'Inzet Bepalen',
        content: 'De speler aan de beurt kiest zijn inzet: 1, 2 of 3 slokken.',
      },
      {
        title: 'Hoger of Lager Raden',
        content: 'Kijk naar de open kaart op tafel en roep luid: "HOGER!" of "LAGER!". Trek vervolgens de bovenste kaart van het dek.',
      },
      {
        title: 'Winst of Verlies',
        content: 'Goed geraden? Deel het aantal ingezette slokken uit aan medespelers. Fout geraden? Drink zelf het ingezette aantal slokken op.',
      },
      {
        title: 'BALZAK! (Exact Gelijke Kaart)',
        content: 'Is de getrokken kaart exact even hoog als de kaart op tafel (bijvoorbeeld een 8 op een 8)? Dan roept iedereen keihard "BALZAK!". De inzet wordt verdubbeld en de speler moet direct een vol glas adten!',
      },
      {
        title: 'Doordubbelen of Passen',
        content: 'Heb je goed geraden? Dan mag je doorspelen met de nieuwe kaart en je inzet laten staan (of verhogen). Na 3 opeenvolgende goede gokken mag je passen en proost de hele tafel!',
      },
    ],
    tips: [
      'Ligt er een 7 of 8 op tafel? Dan is de kans op winst 50/50: wees voorzichtig met 3 slokken inzetten!',
      'Gelijke kaarten komen vaker voor dan je denkt: wees voorbereid op een onverwachte Balzak.',
    ],
  },
  {
    id: 'opus',
    title: 'Opus (Live is Life)',
    subtitle: 'Dobbelen in sneltreinvaart en adten op het legendarische "Na na na na na!"',
    category: 'muziek',
    required: ['1 of 2 Dobbelstenen', 'Muziek: Opus - Live is Life', 'Groot glas bier / drank per persoon'],
    players: '3 - 12 spelers',
    intensity: 5,
    durationMinutes: '4 - 8 min (duur van het nummer)',
    iconEmoji: '🎺',
    coverColor: 'sapphire',
    musicNeeded: ['Opus - Live is Life'],
    description:
      'Zet het onverwoestbare nummer "Live is Life" van Opus aan op maximaal volume! Tijdens het lied gaan de dobbelstenen razendsnel de kring rond. Gooi je een 1 tijdens het rustige couplet? Dan neem je 1 slok. Maar zodra het legendarische refrein ("Na na na na na... LIVE IS LIFE!") inzet, moet de tafel in sneltreinvaart blijven doordobbelen: wie tijdens het refrein een 1 gooit, moet zijn hele glas in één teug leegadten vóórdat het refrein voorbij is!',
    rulesSteps: [
      {
        title: 'Voorbereiding & Track Starten',
        content:
          'Zorg dat iedereen zijn drankje vol heeft en leg de dobbelsteen klaar op tafel. Start het nummer "Live is Life" van Opus. De speler met het minste pils in zijn glas begint met dobbelen.',
      },
      {
        title: 'Tijdens het Couplet (Rustig dobbelen)',
        content:
          'Spelers gooien om de beurt 1x met de dobbelsteen en geven deze met de klok mee door. Gooi je een 1? Neem 1 slok van je biertje. Gooi je een 6? Deel 1 slok uit aan een ander. Bij 2, 3, 4 of 5 gebeurt er niets en geef je direct door.',
      },
      {
        title: 'HET REFREIN! ("Na na na na na... Live is Life!")',
        content:
          'Zodra de zanger en het publiek "Na na na na na!" inzetten, staat iedereen op en zingt luidkeels mee! De dobbelsteen MOET nu razendsnel rondgaan. Wie tijdens het refrein een 1 gooit, MOET DIRECT ZIJN HELE GLAS LEEGADTEN voordat het refrein stopt!',
      },
      {
        title: 'Gitaarsolo & Einde',
        content:
          'Tijdens de solo proost de hele tafel gezamenlijk. Wie aan het einde van het nummer zijn adtje nog niet op heeft, krijgt een extra strafslok!',
      },
    ],
    cardMeanings: [
      { key: 'Worp 1 (Couplet)', action: '1 Slok drinken', description: 'Neem rustig een slokje van je drankje.' },
      { key: 'Worp 1 (Refrein)', action: '🚨 GLAS ADTEN!', description: 'Noodtoestand! Drink je hele glas in één teug leeg vóór het refrein eindigt!' },
      { key: 'Worp 6', action: 'Slok uitdelen', description: 'Wijs een medespeler aan die moet drinken.' },
      { key: 'Na na na na na', action: 'Meezingen & Sneller dobbelen', description: 'Handen in de lucht, luidkeels meezingen met de hele zaal!' },
    ],
    tips: [
      'Gooi de dobbelsteen beheerst: dobbelsteen van tafel = direct 2 strafslokken!',
      'Houd altijd een koud reserve-biertje binnen handbereik voor tijdens het refrein.',
    ],
  },
  {
    id: 'pisk_mich_hardt',
    title: 'Pisk mich hardt',
    subtitle: 'Duitse beuker: meeslaan op de beat en doordrinken tot de drop stopt',
    category: 'muziek',
    required: ['Muziek: Pisk mich hardt', 'Vol glas bier of mixdrank', 'Stevige tafel om op te roffelen'],
    players: '3 - 15 spelers',
    intensity: 5,
    durationMinutes: '3 - 6 min',
    iconEmoji: '🔥',
    coverColor: 'crimson',
    musicNeeded: ['Pisk mich hardt'],
    description:
      'Pisk Mich Hardt is de ultieme muzikale escalatie voor bierdrinkers en feestbeesten. Iedereen slaat synchroon op de tafel mee op het monotone stampende ritme. Zodra de zanger keihard "Pisk mich hardt!" schreeuwt, begint iedereen tegelijk met drinken en mag je je glas pas neerzetten als de stem zwijgt of de drop eindigt!',
    rulesSteps: [
      {
        title: 'Handen op tafel & Het Ritme',
        content:
          'Zet het nummer "Pisk mich hardt" aan op de speaker. Iedereen zet zijn volle glas voor zich neer en slaat met twee handen synchroon op de tafel op het ritme van de zware bass beat (boem - boem - boem).',
      },
      {
        title: 'De Roep: "Pisk mich hardt!"',
        content:
          'Zodra de iconische schreeuw "PISK MICH HARDT!" door de kamer dendert, pakt IEDEREEN zijn glas op en begint non-stop te drinken (waterval-stijl)!',
      },
      {
        title: 'Wie stopt als eerste?',
        content:
          'Je mag pas stoppen met drinken zodra de zanger ophoudt met schreeuwen OF als je glas leeg is. Wie als eerste zijn glas neerzet terwijl de beat nog dendert, verliest de ronde en moet direct een shotje nemen!',
      },
      {
        title: 'De Wisseltruc',
        content:
          'Als het nummer versnelt of in een break valt, roept de spelleider "WISSEL": iedereen schuift één plek naar rechts en drinkt verder uit het glas van zijn buurman.',
      },
    ],
    cardMeanings: [
      { key: 'Boem Boem Beat', action: 'Tafel Roffelen', description: 'Sla met beide handpalmen synchroon mee op de beat van het nummer.' },
      { key: 'Pisk Mich Hardt!', action: '🚨 TEGELIJK DRINKEN', description: 'Beker aan de mond en doordrinken tot het refrein stilvalt.' },
      { key: 'Als eerste opgeven', action: 'Strafshotje', description: 'Zet je je glas te vroeg neer? Strafshot voor de afhaker!' },
      { key: 'Glas leeg voor de beat', action: 'Veilig & Eregast', description: 'Heb je je glas ad voor het refrein eindigt? Jij bent veilig!' },
    ],
    tips: [
      'Drink niet te koud bier want hersenbevriezing ligt op de loer bij een langdurig refrein.',
      'Sla hard mee op tafel om de feeststemming direct naar het kookpunt te brengen.',
    ],
  },
  {
    id: 'presidenten',
    title: 'Presidenten',
    subtitle: 'Schoppen 3 begint: vecht je weg uit de rol van de vernederde Klootzak',
    category: 'kaarten',
    required: ['Stok kaarten (inclusief 2 Jokers)', 'Bierglazen'],
    players: '4 - 8 spelers',
    intensity: 4,
    durationMinutes: '20 - 40 min',
    iconEmoji: '🏛️',
    coverColor: 'burgundy',
    description:
      'Een klassiek hiërarchisch kaart- en drankspel. Degene met Schoppen 3 begint. Verdeel het hele dek over alle spelers. Het doel is om zo snel mogelijk al je kaarten kwijt te raken. Wie als eerste uit is wordt de President; wie als laatste overblijft is de Klootzak en moet iedereen bedienen!',
    rulesSteps: [
      {
        title: 'Schoppen 3 Begint & Kaartvolgorde',
        content: 'Degene met Schoppen 3 legt deze op tafel als openingszet. Kaartwaarde van laag naar hoog: 3, 4, 5, 6, 7, 8, 9, 10, Boer, Vrouw, Heer, Aas, Joker, 2. (De 2 is de allerhoogste kaart en veegt de tafel direct leeg!).',
      },
      {
        title: 'Opgooien & Combinaties',
        content: 'Je moet een kaart opgooien die HOGER OF GELIJK is aan de vorige kaart. Wordt er een paar opgegooid (bijv. twee 7-ens)? Dan mag de volgende speler alleen een gelijk of hoger paar opgooien (bijv. twee 9-ens). Kan of wil je niet? Dan pas je. Als iedereen past, veegt de laatste speler de stapel weg en start een nieuwe slag.',
      },
      {
        title: 'De Hiërarchie & Beloningen',
        content: 'De volgorde waarin spelers hun hand leegspelen bepaalt de rangen voor het volgende potje:\n1e uit: De President 👑\n2e uit: De Vice-President 🥈\nMiddenmoot: De Burgers 🧑‍🤝‍🧑\nVoorlaatste uit: De Vice-Klootzak 🥉\nLaatste over: De Klootzak 💩',
      },
      {
        title: 'Kaarten Afstaan & Straf voor de Klootzak',
        content: 'Vóór aanvang van de volgende ronde:\n- De Klootzak MOET zijn 2 allerbeste kaarten afstaan aan de President. De President geeft 2 willekeurige prulkaarten terug.\n- De Vice-Klootzak geeft zijn 1 allerbeste kaart aan de Vice-President in ruil voor 1 prulkaart.\n- De Klootzak schenkt gedurende het hele potje alle drankjes van iedereen in en schudt en deelt alle kaarten!',
      },
    ],
    cardMeanings: [
      { key: '3 t/m 10', action: 'Normale opbouw', description: 'Begin met lage kaarten wegspelen in het begin van de slag.' },
      { key: 'Boer, Vrouw, Heer', action: 'Hogere plaatjes', description: 'Sterke kaarten om controle over de slag over te nemen.' },
      { key: 'Aas (A)', action: 'Zeer hoog', description: 'Slaat vrijwel alle normale kaarten.' },
      { key: 'Joker', action: 'Troef / Boven de Aas', description: 'Kan op elke kaart gespeeld worden behalve een 2.' },
      { key: '2', action: 'Tafel Schoonvegen (Vrij spel)', description: 'Hoogste kaart in het spel! Veegt de hele stapel weg; jij mag direct opnieuw uitkomen met wat je wilt.' },
    ],
    tips: [
      'Bewaar altijd minstens één 2 voor het einde om je laatste prulkaart te kunnen dumpen!',
      'Vier dezelfde kaarten achter elkaar veegt de stapel ook meteen leeg (bom-regel).',
    ],
  },
  {
    id: 'boer_zoekt_vrouw',
    title: 'Boer zoekt Vrouw',
    subtitle: 'De Boer sluit zijn ogen, de Vrouw drinkt stiekem: ontmasker haar of adt zelf!',
    category: 'kaarten',
    required: ['Minimaal 3 spelers (5+ aanbevolen)', 'Stok kaarten (met minstens 1 Boer en 1 Vrouw)', '2 halfvolle glazen op tafel'],
    players: '3 - 12 spelers',
    intensity: 4,
    durationMinutes: '10 - 25 min',
    iconEmoji: '🚜',
    coverColor: 'emerald',
    description:
      'Het Boer zoekt Vrouw Drankspel is een hilarisch bluf- en observatiespel. Iedereen krijgt in stilte 1 kaart. Degene met de Boer (J) sluit zijn ogen en telt hardop tot 8. Degene met de Vrouw (Q) moet in die tijd stiekem en zo geruisloos mogelijk 1 van de twee glazen op tafel in één teug leegdrinken! Daarna moet de Boer raden wie de Vrouw is.',
    rulesSteps: [
      {
        title: 'Voorbereiding',
        content: 'Zorg dat er minstens één Boer (J) en één Vrouw (Q) tussen de kaarten zitten. Deel aan iedere speler blind 1 kaart uit en zet 2 halfvolle glazen drank midden op tafel.',
      },
      {
        title: 'Kaart Bekijken',
        content: 'Iedereen bekijkt in stilte zijn eigen kaart. Laat aan niemand merken welke kaart je hebt!',
      },
      {
        title: 'De Boeren-ronde (Ogen Dicht & Tellen)',
        content: 'Degene die de Boer heeft roept dat hij de Boer is, doet zijn ogen dicht en telt hardop tot 8. Terwijl de Boer telt, probeert de speler met de Vrouw stiekem en ongezien één van de twee glazen op tafel leeg te drinken.',
      },
      {
        title: 'Het Gokken & De Uitslag',
        content: 'Als de Boer bij 8 is, opent hij zijn ogen en raadt hij wie de Vrouw is:\n- GOED GERADEN: De Vrouw is ontmaskerd en moet ook het TWEEDE glas op tafel leegdrinken!\n- FOUT GERADEN: De Boer zat fout en moet ZELF het tweede glas op tafel adten!',
      },
    ],
    cardMeanings: [
      { key: 'Boer (J)', action: 'De Boer', description: 'Sluit ogen, telt hardop tot 8 en moet daarna raden wie de Vrouw is.' },
      { key: 'Vrouw (Q)', action: 'De Vrouw', description: 'Moet stiekem en geruisloos een halfvol glas leegdrinken tijdens het tellen.' },
      { key: 'Overige Kaarten', action: 'Onschuldige Omstanders', description: 'Houd je pokerface vast en verraad de Vrouw niet (of leid de Boer juist af!).' },
    ],
    tips: [
      'Maak als Vrouw geen drink-geluidjes (geen luid slikken of hard glas neerzetten).',
      'Als omstander kun je verdacht doen om de Boer op het verkeerde been te zetten!',
    ],
  },
];
