export type NooitLevelId = 'gezellig' | 'feest' | 'pittig' | 'eigen';

export interface NooitLevel {
  id: NooitLevelId;
  name: string;
  emoji: string;
  description: string;
  /** Tailwind klassen voor het label op de kaart en de geselecteerde knop */
  activeClass: string;
  chipClass: string;
}

export interface NooitStatement {
  id: string;
  level: NooitLevelId;
  /** Vervolg op "Ik heb nog nooit..." */
  text: string;
}

export const NOOIT_LEVELS: NooitLevel[] = [
  {
    id: 'gezellig',
    name: 'Gezellig',
    emoji: '😇',
    description: 'Onschuldig en voor iedereen',
    activeClass: 'bg-emerald-600 border-emerald-800 text-white',
    chipClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'feest',
    name: 'Feest',
    emoji: '🍻',
    description: 'Stappen, katers en kroegverhalen',
    activeClass: 'bg-amber-500 border-amber-700 text-white',
    chipClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'pittig',
    name: 'Pittig',
    emoji: '🌶️',
    description: 'Dates, crushes en geheimen',
    activeClass: 'bg-rose-600 border-rose-800 text-white',
    chipClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];

export const CUSTOM_LEVEL: NooitLevel = {
  id: 'eigen',
  name: 'Eigen',
  emoji: '✍️',
  description: 'Zelf toegevoegd',
  activeClass: 'bg-indigo-600 border-indigo-800 text-white',
  chipClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

const GEZELLIG = [
  'een hele pizza in mijn eentje opgegeten',
  'gedaan alsof ik ziek was om thuis te blijven',
  'mijn eigen naam gegoogeld',
  'een cadeau doorgegeven dat ik zelf gekregen had',
  'gehuild bij een tekenfilm',
  'in de trein gezeten zonder kaartje',
  'mijn telefoon in de wc laten vallen',
  'tegen een glazen deur aangelopen',
  'een leraar per ongeluk "mama" of "papa" genoemd',
  'gezwaaid naar iemand die helemaal niet naar mij zwaaide',
  'een hele serie in één weekend gekeken',
  'keihard meegezongen met een liedje waarvan ik de tekst niet kende',
  'iets gekookt dat compleet mislukt is',
  'mezelf buitengesloten',
  'in slaap gevallen in de bioscoop',
  'een appje naar de verkeerde persoon gestuurd',
  'een hele dag in mijn pyjama rondgelopen',
  'gelogen over mijn leeftijd',
  'een boete gekregen op de fiets',
  'iets van de grond gegeten (vijfsecondenregel!)',
  'de afwas dagenlang laten staan',
  'gedanst terwijl ik dacht dat niemand keek',
  'de verjaardag van een goede vriend of vriendin vergeten',
  'een hele zak chips in mijn eentje leeggegeten',
  'tegen een huisdier gepraat alsof het een mens was',
  'verdwaald geraakt terwijl de navigatie aan stond',
  'een spraakbericht van meer dan vijf minuten gestuurd',
  'een gesprek gevoerd terwijl ik de naam van die persoon vergeten was',
  'mijn fiets heel lang gezocht in de fietsenstalling',
  'een film gekeken alleen omdat mijn crush die leuk vond',
  'op het verkeerde station uitgestapt',
  'een kapsel genomen waar ik meteen spijt van had',
  'ruzie gemaakt over een bordspel',
  'vals gespeeld bij een spelletje',
  'een toets gehaald zonder te leren',
  'een hele dag niets anders gegeten dan snacks',
  'stiekem het laatste koekje gepakt en het lege pak laten liggen',
  'om mijn eigen grap het hardst gelachen',
  'iemand nagedaan terwijl die persoon achter me stond',
  'een selfie gemaakt en er daarna twintig weggegooid',
  'gedaan alsof ik aan het bellen was om iemand te ontwijken',
  'een plant laten uitdrogen tot hij niet meer te redden was',
  'op een verjaardag iets gekregen en niet meer weten van wie',
  'een hele dag gewerkt met mijn trui binnenstebuiten',
  'per ongeluk op "Allen beantwoorden" geklikt bij een mail',
  'mijn wekker gezet maar vergeten het geluid aan te zetten',
  'een pakje afgeleverd gekregen en vergeten wat ik besteld had',
  'in de supermarkt per ongeluk het karretje van iemand anders meegenomen',
  'een woord tien keer fout getypt en toen maar een ander woord gekozen',
  'bij iemand aangebeld en daarna snel weggerend',
  'een spelletje opgegeven omdat ik aan het verliezen was',
  'op vakantie alleen maar Nederlandse snacks gegeten',
  'een rekening gekregen van een abonnement dat ik vergeten was op te zeggen',
  'een heel brood gekocht en alles op één dag opgegeten',
  'iets op Marktplaats gekocht en veel te veel betaald',
  'tegen een paal op straat gezegd "sorry"',
  'in het openbaar keihard een boer gelaten',
  'een hele serie opnieuw gekeken terwijl ik tien nieuwe op mijn lijst had staan',
  'stiekem snoep uit de voorraadkast van iemand anders gepakt',
  'een bericht getypt, gewist, weer getypt en uiteindelijk niks gestuurd',
];

const FEEST = [
  'een adtje getrokken',
  'op een tafel of bar gedanst',
  'een kater gehad die de hele dag duurde',
  'mijn jas kwijtgeraakt tijdens het uitgaan',
  'de laatste trein of bus gemist na het stappen',
  'een dronken appje gestuurd waar ik spijt van had',
  'in slaap gevallen op een feestje',
  'karaoke gezongen voor een volle zaal',
  "om vier uur 's nachts nog een kapsalon of friet gehaald",
  'iemands naam vergeten vlak nadat die zich voorstelde',
  'tot sluitingstijd in de kroeg gezeten',
  'de ochtend erna mijn bankapp niet durven openen',
  'een rondje gegeven aan mensen die ik niet kende',
  'op een festival mijn vrienden urenlang gezocht',
  'een feestje gegeven terwijl mijn ouders weg waren',
  'overgegeven na een avond stappen',
  'een drankje over iemand anders gemorst',
  'gedaan alsof ik een liedje kende om erbij te horen',
  'een taxi genomen voor een stuk dat ik ook had kunnen lopen',
  'verkleed op een feest gekomen waar verder niemand verkleed was',
  'mijn telefoon kwijtgeraakt tijdens het uitgaan',
  'vooraan gelopen in de polonaise',
  'een drankspel verloren en er echt spijt van gehad',
  'met mijn schoenen aan in bed wakker geworden',
  'een foto teruggezien van een avond die ik me niet meer kon herinneren',
  'stiekem water gedronken terwijl de rest dacht dat het iets sterkers was',
  'drie dagen achter elkaar carnaval gevierd',
  'de dj om een verzoeknummer gevraagd',
  'een feest verlaten zonder gedag te zeggen',
  'op de fiets naar huis keihard gezongen',
  'een nacht doorgehaald en daarna gewoon naar werk of school gegaan',
  'bij iemand op de bank geslapen na een feestje',
  'een glas gebroken in de kroeg',
  'een hele avond opgetrokken met iemand die ik net had ontmoet',
  'geprobeerd de portier om te praten',
  'bier gedronken bij het ontbijt',
  'een pubquiz gewonnen',
  'een nummer aangevraagd en daarna als enige gedanst',
  'op Koningsdag iets gekocht dat ik nooit meer gebruikt heb',
  'een afterparty bij mij thuis gehouden',
  'een drankje besteld puur omdat het er duur of chique uitzag',
  'mijn fietssleutel pas na een halfuur zoeken in mijn eigen broekzak gevonden',
  'met zonnebril op in de club gestaan',
  'tijdens een festival in de verkeerde tent proberen te kruipen',
  'per ongeluk het verkeerde glas van tafel opgepakt en opgedronken',
  'in een vreemde stad de weg gevraagd en tien minuten later dezelfde persoon weer gezien',
  'een feestje verlaten met een verkeersbord of glas als souvenir',
  'beloofd "ik neem er maar eentje" en vervolgens als laatste naar huis gegaan',
  'tijdens een borrel iets op een dienblad laten omvallen',
  'op de bar gestaan om een liedje aan te moedigen',
  'een groepsfoto laten maken met wildvreemden en die nooit ontvangen',
  'om drie uur ’s nachts geprobeerd te koken en daarbij bijna de keuken afgebrand',
  'mijn eigen stem teruggehoord op een feestvideo en me doodgeschaamd',
  'tijdens een vrijgezellenfeest een belachelijke opdracht moeten uitvoeren',
  'twee dagen nodig gehad om bij te komen van één avond stappen',
  'een kroeg uitgestuurd of vriendelijk verzocht te vertrekken',
  'iets in het café besteld terwijl de barman al aan het schoonmaken was',
  'op een verjaardag meer taart gegeten dan de jarige',
  'een fles wijn opengetrokken zonder kurkentrekker',
  'om middernacht geproost op iets totaal onzinnigs',
];

const PITTIG = [
  'iemand in deze kamer leuk gevonden',
  'een ex teruggeappt terwijl ik wist dat het een slecht idee was',
  'het profiel van een ex bekeken op social media',
  'gezoend met iemand van wie ik de naam niet wist',
  'een date afgezegd met een verzonnen smoes',
  'op een date gezeten en stiekem weg willen rennen',
  'twee dates op één dag gehad',
  'iemand geghost',
  'gelogen over hoeveel mensen ik gezoend heb',
  'gezoend met de ex van een vriend of vriendin',
  'een crush gehad op een docent of baas',
  'een liefdesbericht gestuurd waar nooit antwoord op kwam',
  'naakt gezwommen',
  'iemand in deze kamer gezoend',
  'een datingapp gebruikt',
  'op een datingapp een bekende tegengekomen',
  'gedaan alsof ik iemand niet zag om een gesprek te ontwijken',
  'een geheim doorverteld dat ik had beloofd te bewaren',
  'stiekem in de telefoon van iemand anders gekeken',
  'een oogje gehad op de partner van een vriend of vriendin',
  'iets gestolen (hoe klein ook)',
  'een relatie uitgemaakt via een appje',
  'een smoes verzonnen om onder een afspraak met iemand hier uit te komen',
  'spijt gehad van een zoen',
  'geflirt om iets gratis te krijgen',
  'een screenshot van een gesprek doorgestuurd naar vrienden',
  'tegen mijn ouders gelogen over waar ik sliep',
  'gezoend op de eerste date',
  'iemand gezoend om een ander jaloers te maken',
  'een foto gestuurd waar ik later spijt van had',
  'geslapen bij iemand die ik die avond pas had leren kennen',
  'gedroomd over iemand in deze kamer',
  'iemand afgewezen en daar later spijt van gehad',
  'mijn relatiestatus verzwegen om te kunnen flirten',
  'een blauwtje gelopen waar vrienden bij waren',
  'een cadeau van een ex weggegooid of doorverkocht',
  'een date gehad die zo slecht was dat ik er nog steeds over vertel',
  'een appje "per ongeluk" gestuurd om een gesprek te beginnen',
  'over iemand in deze kamer geroddeld',
  'iemand gezoend en daarna gedaan alsof er niets gebeurd was',
  'een nep-account gebruikt om iemand te bekijken op social media',
  'op een eerste date meteen door mijn ex betrapt of gezien',
  'iemands naam verkeerd uitgesproken of vergeten tijdens een intiem moment',
  'stiekem gehoopt dat een afspraak werd afgezegd zodat ik in bed kon blijven',
  'iemand teruggevraagd op date alleen omdat ik me verveelde',
  'in een relatie gezeten terwijl ik eigenlijk al wist dat het over was',
  'iemand een bijnaam gegeven in de groepsapp zodat diegene het niet doorhad',
  'een bericht van iemand op "gelezen" laten staan voor meer dan een week',
  'iemand gezoend op een festival en die persoon nooit meer gezien',
  'gelogen tegen mijn partner of date over waar ik was',
  'stiekem iemands dagboek, notities of oude foto’s bekeken',
  'iemand leuk gevonden puur omdat diegene niet geïnteresseerd leek',
  'met twee mensen uit dezelfde vriendengroep gedatet of gezoend',
  'op een date gedaan alsof ik iets heel interessants begreep terwijl ik er niets van wist',
  'een heel weekend alleen maar in bed gelegen met iemand nieuw',
  'iemand via een appje moeten uitleggen dat het "echt aan mij ligt"',
  'iets heel gênants gestuurd naar een groepsapp in plaats van één persoon',
  'iemand verleid met een slechte openingszin die toch werkte',
  'stiekem blij geweest toen een stelletje uit elkaar ging',
  'een belofte verbroken die ik heel serieus had gemaakt',
];

const toStatements = (level: NooitLevelId, texts: string[]): NooitStatement[] =>
  texts.map((text, idx) => ({ id: `${level}-${idx}`, level, text }));

export const DEFAULT_STATEMENTS: NooitStatement[] = [
  ...toStatements('gezellig', GEZELLIG),
  ...toStatements('feest', FEEST),
  ...toStatements('pittig', PITTIG),
];

export function getLevel(levelId: NooitLevelId): NooitLevel {
  if (levelId === 'eigen') return CUSTOM_LEVEL;
  return NOOIT_LEVELS.find(level => level.id === levelId) ?? NOOIT_LEVELS[0];
}

export function countStatements(levelId: NooitLevelId): number {
  return DEFAULT_STATEMENTS.filter(statement => statement.level === levelId).length;
}

/** Haalt "Ik heb nog nooit" van het begin af, zodat eigen stellingen altijd goed aansluiten. */
export function cleanCustomStatement(raw: string): string {
  return raw
    .trim()
    .replace(/^ik heb nog nooit\s*/i, '')
    .replace(/^\.+\s*/, '')
    .replace(/[.!]+$/, '')
    .trim()
    .slice(0, 120);
}
