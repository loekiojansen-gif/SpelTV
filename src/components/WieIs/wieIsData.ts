export interface WieIsPrompt {
  id: string;
  text: string;
}

export const DEFAULT_WIE_IS_PROMPTS: WieIsPrompt[] = [
  { id: '1', text: 'is het domste' },
  { id: '2', text: 'wordt het snelste president' },
  { id: '3', text: 'is het minst lenig' },
  { id: '4', text: 'is als eerste dronken vanavond' },
  { id: '5', text: 'gaat als laatste weg uit de kroeg' },
  { id: '6', text: 'is altijd te laat' },
  { id: '7', text: 'heeft de hoogste schermtijd op de telefoon' },
  { id: '8', text: 'raakt altijd zijn/haar sleutels of pinpas kwijt' },
  { id: '9', text: 'is de grootste flirt van de groep' },
  { id: '10', text: 'stuurt de raarste dronken appjes' },
  { id: '11', text: 'kan absoluut geen geheimen bewaren' },
  { id: '12', text: 'brandt zelfs water aan in de keuken' },
  { id: '13', text: 'zou als eerste miljonair worden over 10 jaar' },
  { id: '14', text: 'zou per ongeluk een auto tegen een paaltje parkeren' },
  { id: '15', text: 'is het meest dramatisch bij een verkoudheidje' },
  { id: '16', text: 'heeft de meeste matches op datingapps' },
  { id: '17', text: 'is de slechtste verliezer bij spelletjes' },
  { id: '18', text: 'kan het slechtst tegen een kater' },
  { id: '19', text: 'zou premier van Nederland kunnen worden' },
  { id: '20', text: 'zou overleven in een zombie apocalyps' },
  { id: '21', text: 'zou per ongeluk lid worden van een sekte' },
  { id: '22', text: 'koopt altijd nutteloze spullen op internet' },
  { id: '23', text: 'heeft stiekem een reality TV verslaving' },
  { id: '24', text: 'is de grootste kluns van de groep' },
  { id: '25', text: 'valt als eerste in slaap op een huisfeestje' },
  { id: '26', text: 'heeft meer dan 5000 ongelezen e-mails' },
  { id: '27', text: 'heeft altijd zijn telefoonbatterij onder de 10%' },
  { id: '28', text: 'is het meest kieskeurig met eten' },
  { id: '29', text: 'liegt het makkelijkst over kleine onbenullige dingen' },
  { id: '30', text: 'kan echt niet liegen zonder direct te lachen' },
  { id: '31', text: 'is stiekem de grootste roddeltante' },
  { id: '32', text: 'zingt het hardst mee met foute hits' },
  { id: '33', text: 'huilt gegarandeerd bij een zielige film' },
  { id: '34', text: 'is het snelst blut na salarisdag' },
  { id: '35', text: 'zou zomaar meedoen aan First Dates' },
  { id: '36', text: 'heeft de slechtste muzieksmaak' },
  { id: '37', text: 'heeft de beste muzieksmaak' },
  { id: '38', text: 'is de grootste bankhanger op zondag' },
  { id: '39', text: 'drinkt de meeste koppen koffie of energy drinks' },
  { id: '40', text: 'loopt altijd de verkeerde kant op na Google Maps' },
  { id: '41', text: 'zou zijn eigen verjaardag vergeten' },
  { id: '42', text: 'heeft het vaakst ruzie met platte Ikea-kasten' },
  { id: '43', text: 'struikelt zelfs over een vlakke vloer' },
  { id: '44', text: 'haalt om 04:00 nog een vette hap bij de snackbar' },
  { id: '45', text: 'zou als eerste sneuvelen in een horrorfilm' },
  { id: '46', text: 'is het meest verslaafd aan TikTok of Instagram' },
  { id: '47', text: 'stelt altijd voor om "nog één laatste drankje" te doen' },
  { id: '48', text: 'is als eerste op de dansvloer te vinden' },
  { id: '49', text: 'praat veel te hard wanneer de oortjes in zitten' },
  { id: '50', text: 'zou zijn vrienden verraden voor een vers frikandelbroodje' },
  { id: '51', text: 'heeft de raarste lachbui op het meest ongepaste moment' },
  { id: '52', text: 'heeft de meeste foto\'s van zichzelf in de camerarol' },
  { id: '53', text: 'is het meest schaamteloos in het openbaar' },
  { id: '54', text: 'kan echt niet daten zonder eerst iemands hele Instagram te stalken' },
  { id: '55', text: 'is de beste kok van het gezelschap' },
  { id: '56', text: 'geeft altijd de beste (maar gevaarlijkste) adviezen' },
  { id: '57', text: 'zou zomaar meedoen aan Boer zoekt Vrouw' },
  { id: '58', text: 'heeft het langste lijstje met afknappers bij het daten' },
  { id: '59', text: 'is het meest romantisch ingesteld' },
  { id: '60', text: 'zou meedoen aan Expeditie Robinson' },
  { id: '61', text: 'slaapt door vier wekkers heen' },
  { id: '62', text: 'heeft de meest chaotische kledingkast of kamer' },
  { id: '63', text: 'kan het minste tegen kietelen' },
  { id: '64', text: 'zou een rechtszaak winnen zonder advocaat' },
  { id: '65', text: 'heeft het beste geheugen voor nutteloze feitjes' },
  { id: '66', text: 'kan het beste onderhandelen op Marktplaats' },
  { id: '67', text: 'zou zijn paspoort vergeten bij vertrek naar Schiphol' },
  { id: '68', text: 'heeft altijd de gekste afterparty-verhalen' },
  { id: '69', text: 'heeft de raarste Google zoekgeschiedenis' },
  { id: '70', text: 'zou per ongeluk in de verkeerde trein stappen' },
  { id: '71', text: 'heeft altijd als eerste honger na het eten' },
  { id: '72', text: 'is het snelst boos bij Monopoly of Catan' },
  { id: '73', text: 'zou direct ' + 'ja' + ' zeggen tegen een blind date op tv' },
  { id: '74', text: 'kan het minste tegen pittig eten' },
  { id: '75', text: 'zou een eigen podcast moeten beginnen' },
  { id: '76', text: 'is het meest competitief bij elk willekeurig spel' },
  { id: '77', text: 'heeft de beste outfit van de avond aan' },
  { id: '78', text: 'maakt per ongeluk screenshots van het lockscreen' },
  { id: '79', text: 'zou zomaar emigreren naar een zonnig eiland' },
  { id: '80', text: 'blijft altijd veel te lang in bed liggen scrollen' },
  // Extra 100 Stellingen:
  { id: '81', text: 'is het meest verslaafd aan online shoppen' },
  { id: '82', text: 'heeft de meeste schoenen in de kast staan' },
  { id: '83', text: 'zou meedoen aan De Slimste Mens' },
  { id: '84', text: 'heeft altijd als eerste de nieuwste roddels' },
  { id: '85', text: 'kan het minste tegen een grapje over zichzelf' },
  { id: '86', text: 'zou zomaar meedoen aan Temptation Island' },
  { id: '87', text: 'is het vaakst zijn/haar sleutels binnenshuis kwijt' },
  { id: '88', text: 'eet altijd stiekem het laatste koekje op' },
  { id: '89', text: 'heeft het minste geduld in de file of rij' },
  { id: '90', text: 'zou zijn vrienden laten stikken voor een gratis concertkaartje' },
  { id: '91', text: 'heeft stiekem de vreemdste hobby' },
  { id: '92', text: 'kan echt geen landkaart lezen' },
  { id: '93', text: 'heeft altijd koude handen of voeten' },
  { id: '94', text: 'is het snelst afgeleid tijdens een serie' },
  { id: '95', text: 'zou direct ' + 'ja' + ' zeggen tegen een reis naar Mars' },
  { id: '96', text: 'heeft de meeste onnodige apps op de telefoon' },
  { id: '97', text: 'zou per ongeluk een pan laten aanbranden tijdens het scrollen' },
  { id: '98', text: 'is het meest hysterisch bij het zien van een wesp of spin' },
  { id: '99', text: 'heeft altijd een nieuw dieet dat na twee dagen mislukt' },
  { id: '100', text: 'zou als eerste rijk worden met een bizar idee' },
  { id: '101', text: 'rijdt het gevaarlijkst van de hele groep' },
  { id: '102', text: 'zou een realitysoap over zijn/haar leven moeten hebben' },
  { id: '103', text: 'is het langst bezig met een keuze maken op de menukaart' },
  { id: '104', text: 'heeft stiekem nog een knuffel in bed liggen' },
  { id: '105', text: 'zou het snelst de weg kwijtraken in een meubelzaak' },
  { id: '106', text: 'kan het beste zingen onder de douche' },
  { id: '107', text: 'kan het slechtste zingen maar doet het toch het hardst' },
  { id: '108', text: 'heeft altijd de meeste snoepjes of snacks in de tas' },
  { id: '109', text: 'zou zomaar meedoen aan Big Brother' },
  { id: '110', text: 'is het vaakst te laat op zijn/haar werk of studie' },
  { id: '111', text: 'heeft de meeste ongeopende post liggen' },
  { id: '112', text: 'kan het slechtst geheimen bewaren na twee glazen wijn' },
  { id: '113', text: 'zou per ongeluk een brandalarm laten afgaan' },
  { id: '114', text: 'heeft de raarste slaappositie' },
  { id: '115', text: 'is het meest verslaafd aan sporten of de gym' },
  { id: '116', text: 'heeft al een jaar een sportschoolabonnement zonder te gaan' },
  { id: '117', text: 'zou per ongeluk een screenshot naar de verkeerde persoon sturen' },
  { id: '118', text: 'is het meest dramatisch als de wifi uitvalt' },
  { id: '119', text: 'heeft altijd een lege tank als je meerijdt' },
  { id: '120', text: 'zou als eerste een tattoo nemen waar direct spijt van komt' },
  { id: '121', text: 'is het snelst beledigd als iemand zijn outfit niet complimenteert' },
  { id: '122', text: 'weet altijd precies wat celebrities nu aan het doen zijn' },
  { id: '123', text: 'zou de leiding nemen bij een bankoverval als gijzelaar' },
  { id: '124', text: 'heeft de meeste planten laten doodgaan' },
  { id: '125', text: 'koopt altijd kleding die vervolgens nooit gedragen wordt' },
  { id: '126', text: 'zou zomaar een sekte kunnen oprichten' },
  { id: '127', text: 'is het meest verslaafd aan chocolade of chips' },
  { id: '128', text: 'heeft het vaakst een scheur of vlek in zijn/haar kleren' },
  { id: '129', text: 'is de allergrootste theeleut' },
  { id: '130', text: 'blijft het langste hangen op een verjaardagsfeestje' },
  { id: '131', text: 'heeft altijd een mening klaar over alles en iedereen' },
  { id: '132', text: 'zou als eerste gillend wegrennen bij een escape room' },
  { id: '133', text: 'is het meest kieskeurig met drankjes' },
  { id: '134', text: 'kan het beste imitaties doen van bekende Nederlanders' },
  { id: '135', text: 'heeft de raarste dromen die \'s ochtends verteld moeten worden' },
  { id: '136', text: 'is het snelste klaar met klaarmaken in de ochtend' },
  { id: '137', text: 'doet er minstens anderhalf uur over om de deur uit te gaan' },
  { id: '138', text: 'heeft altijd de vreemdste smoesjes om niet af te spreken' },
  { id: '139', text: 'zou meedoen aan Wie is de Mol' },
  { id: '140', text: 'zou als eerste afvallen in Wie is de Mol' },
  { id: '141', text: 'eet pizza met mes en vork' },
  { id: '142', text: 'zou ananas op een pizza verdedigen met zijn leven' },
  { id: '143', text: 'heeft de meeste verjaardagen in zijn agenda vergeten' },
  { id: '144', text: 'is het meest geneigd om spontaan een weekendje weg te boeken' },
  { id: '145', text: 'stuurt de meeste memes in de groepsapp' },
  { id: '146', text: 'reageert pas na drie dagen op een eenvoudig appje' },
  { id: '147', text: 'heeft altijd zijn/haar telefoon op \'Niet Storen\' staan' },
  { id: '148', text: 'zou per ongeluk zijn/haar trui achterstevoren dragen' },
  { id: '149', text: 'heeft het hoogste aantal likes op TikTok' },
  { id: '150', text: 'heeft de vreemdste collectie spullen op zolder' },
  { id: '151', text: 'zou het langst volhouden zonder telefoon op vakantie' },
  { id: '152', text: 'kan echt geen vijf minuten zonder schermtijd' },
  { id: '153', text: 'heeft de vreemdste afkeer van bepaald eten' },
  { id: '154', text: 'zou meedoen aan Holland\'s Next Top Model' },
  { id: '155', text: 'is het meest chaotisch in de keuken' },
  { id: '156', text: 'laat altijd overal halfvolle glazen water staan' },
  { id: '157', text: 'zou per ongeluk deodorant als haarlak gebruiken' },
  { id: '158', text: 'heeft altijd het meeste geluk bij bordspelletjes' },
  { id: '159', text: 'heeft altijd de slechtste pech bij het openbaar vervoer' },
  { id: '160', text: 'zou zomaar een vreemde hond op straat mee naar huis nemen' },
  { id: '161', text: 'heeft de meeste foto\'s van eten gemaakt voor Instagram' },
  { id: '162', text: 'kan het minste tegen pittige wasabi of pepers' },
  { id: '163', text: 'heeft het langst rondgelopen met een gebarsten telefoonscherm' },
  { id: '164', text: 'zou per ongeluk een wit t-shirt roze wassen in de wasmachine' },
  { id: '165', text: 'heeft het vaakst spijt na het stappen van zijn uitgaven' },
  { id: '166', text: 'is de beste trooster als iemand verdrietig is' },
  { id: '167', text: 'zou meedoen aan een eetwedstrijd voor frikandellen' },
  { id: '168', text: 'heeft altijd kauwgom of pepermuntjes bij zich' },
  { id: '169', text: 'zou als eerste een wildvreemde aanspreken in de trein' },
  { id: '170', text: 'heeft het vaakst ruzie met de self-checkout in de supermarkt' },
  { id: '171', text: 'zou direct verhuizen naar New York of Tokio als het kon' },
  { id: '172', text: 'blijft altijd veel te lang in bad zitten tot het water koud is' },
  { id: '173', text: 'is het meest gevoelig voor complottheorieën' },
  { id: '174', text: 'heeft altijd een paraplu bij zich als het gaat regenen' },
  { id: '175', text: 'is altijd degene die zeiknat regent zonder jas' },
  { id: '176', text: 'zou zomaar een gekke tattoo laten zetten tijdens een dronken avond' },
  { id: '177', text: 'heeft de raarste bijbaan ooit gehad' },
  { id: '178', text: 'zou als eerste een parachutesprong durven wagen' },
  { id: '179', text: 'is de allergrootste koffiesnob van het gezelschap' },
  { id: '180', text: 'heeft de allerslechtste woordgrappen die toch grappig zijn' },
  { id: '181', text: 'zou als eerste een bekende Nederlander aanspreken op straat' },
  { id: '182', text: 'heeft altijd de vreemdste snacks in de koelkast liggen' },
  { id: '183', text: 'zou zonder blikken of blozen meedoen aan karaoke' },
  { id: '184', text: 'verliest altijd zijn/haar oordopjes of oplader' },
  { id: '185', text: 'heeft de meeste tabbladen openstaan op zijn telefoon' },
  { id: '186', text: 'zou als eerste een huisdier stiekem meenemen op vakantie' },
  { id: '187', text: 'kan het langst volhouden om serieus te blijven bij een flauwe grap' },
  { id: '188', text: 'heeft altijd commentaar op hoe anderen autorijden' },
  { id: '189', text: 'zou per ongeluk zout in plaats van suiker in de koffie doen' },
  { id: '190', text: 'is het meest gehecht aan zijn/haar eigen kussen op reis' },
  { id: '191', text: 'heeft stiekem al tien keer dezelfde serie gekeken' },
  { id: '192', text: 'zou als eerste verdwalen in zijn eigen woonplaats zonder Google Maps' },
  { id: '193', text: 'heeft altijd de grootste tas mee "voor de zekerheid"' },
  { id: '194', text: 'kan het slechtst tegen stilte in een gesprek' },
  { id: '195', text: 'zou het snelst een wereldrecord proberen te verbreken' },
  { id: '196', text: 'heeft de raarste gewoonte voor het slapengaan' },
  { id: '197', text: 'bestelt altijd precies hetzelfde gerecht in elk restaurant' },
  { id: '198', text: 'zou als eerste een cursus pottenbakken of schilderen nemen' },
  { id: '199', text: 'heeft altijd nog een smoes klaar waarom iets niet gelukt is' },
  { id: '200', text: 'zou op een onbewoond eiland als eerste vuur weten te maken' },
  { id: '201', text: 'zou op datzelfde onbewoonde eiland als eerste een cocktailbar bouwen' },
  { id: '202', text: 'heeft de meeste ongebruikte notities in zijn telefoon staan' },
  { id: '203', text: 'kan het beste onderhandelen over een gratis drankje' },
  { id: '204', text: 'zou per ongeluk op een trouwerij precies hetzelfde aanhebben als iemand anders' },
  { id: '205', text: 'is het snelst overtuigd door een TikTok-trend of reclame' },
  { id: '206', text: 'heeft altijd een mening over het weer van die dag' },
  { id: '207', text: 'zou het langst kunnen leven zonder vlees of snacks' },
  { id: '208', text: 'is het vaakst vergeten om zijn fiets op slot te zetten' },
  { id: '209', text: 'zou tijdens een quiz als eerste op de knop drukken zonder het antwoord te weten' },
  { id: '210', text: 'heeft de meeste groepsapps gedempt staan' },
  { id: '211', text: 'zou zonder moeite een hele taart in één weekend opeten' },
  { id: '212', text: 'praat het meest met zijn/haar handen tijdens een verhaal' },
  { id: '213', text: 'is het slechtst in het bewaren van verrassingen voor verjaardagen' },
  { id: '214', text: 'zou meteen naar huis gaan als er geen eten meer is op een feestje' },
  { id: '215', text: 'heeft stiekem de grootste verzameling sokken met gekke printjes' },
  { id: '216', text: 'zou als eerste een eigen café of foodtruck beginnen' },
  { id: '217', text: 'is het meest bijgelovig (bijv. niet onder ladders doorlopen)' },
  { id: '218', text: 'kan het beste verhalen vertellen die achteraf half verzonnen blijken' },
  { id: '219', text: 'heeft het vaakst spierpijn na één keer sporten' },
  { id: '220', text: 'zou per ongeluk in de verkeerde groepsapp over iemand praten' },
  { id: '221', text: 'is altijd de laatste die zijn koffer inpakt vlak voor vertrek' },
  { id: '222', text: 'is altijd drie uur te vroeg op het vliegveld' },
  { id: '223', text: 'heeft het snelst een nieuwe verslaving (zoals puzzels of spelletjes)' },
  { id: '224', text: 'zou als eerste een buitenaards wezen proberen te knuffelen' },
  { id: '225', text: 'heeft de beste dansmoves na drie drankjes' },
  { id: '226', text: 'is het snelst verbrand in de Nederlandse lentezon' },
  { id: '227', text: 'kan het minste tegen mensen die smakken of luid kauwen' },
  { id: '228', text: 'zou zonder twijfel op straat helpen als iemand een lekke band heeft' },
  { id: '229', text: 'heeft altijd het laatste woord in elke discussie' },
  { id: '230', text: 'zou een boek moeten schrijven over zijn/haar eigen blunders' },
];

export const FUN_PUNISHMENTS = [
  'Neem 3 flinke slokken van je drankje!',
  'Trek een adtje (of neem een vol shotje)!',
  'Doe 10 jumping jacks of neem 2 slokken!',
  'De groep mag 1 vraag stellen die jij 100% eerlijk moet beantwoorden!',
  'Wissel van plek met degene tegenover je en neem 2 slokken!',
  'Imiteer iemand uit de groep tot de groep raadt wie het is!',
  'Bedenk een toost op de groep en neem een slok!',
  'Laat je meest recente foto uit je camerarol aan iedereen zien!',
  'Praat de volgende ronde met een Frans of Vlaams accent!',
  'Geef de speler links van je een high five en neem 2 slokken!',
];

const STORAGE_CUSTOM_KEY = 'party_channels_wie_is_custom_prompts_v3';

export function loadCustomWieIsPrompts(): WieIsPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveCustomWieIsPrompts(prompts: WieIsPrompt[]): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(prompts));
  } catch {}
}

export function addCustomWieIsPrompt(text: string): WieIsPrompt[] {
  const trimmed = text.trim();
  if (!trimmed) return loadCustomWieIsPrompts();

  const newPrompt: WieIsPrompt = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: trimmed,
  };

  const current = loadCustomWieIsPrompts();
  const next = [newPrompt, ...current];
  saveCustomWieIsPrompts(next);
  return next;
}

export function removeCustomWieIsPrompt(id: string): WieIsPrompt[] {
  const current = loadCustomWieIsPrompts();
  const next = current.filter(p => p.id !== id);
  saveCustomWieIsPrompts(next);
  return next;
}

export function getAllWieIsPrompts(): WieIsPrompt[] {
  const custom = loadCustomWieIsPrompts();
  return [...custom, ...DEFAULT_WIE_IS_PROMPTS];
}

export function getRandomWieIsPrompt(
  pool: WieIsPrompt[],
  usedIds: Set<string>
): { prompt: WieIsPrompt; newUsed: Set<string> } {
  let available = pool.filter(p => !usedIds.has(p.id));
  if (available.length === 0) {
    usedIds = new Set();
    available = pool;
  }
  const randomIndex = Math.floor(Math.random() * available.length);
  const chosen = available[randomIndex] || DEFAULT_WIE_IS_PROMPTS[0];
  const newUsed = new Set(usedIds);
  newUsed.add(chosen.id);
  return { prompt: chosen, newUsed };
}
