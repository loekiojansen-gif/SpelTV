import { SubAppId } from '../../types';

export interface GameRuleInfo {
  title: string;
  emoji: string;
  summary: string;
  rules: string[];
  tip?: string;
}

export const GAME_RULES: Record<SubAppId, GameRuleInfo> = {
  HUB: {
    title: 'Party Channels',
    emoji: '📺',
    summary: 'Het interactieve hoofdmenu met alle party spellen.',
    rules: [
      'Klik op een kanaal om het spel te starten.',
      'Gebruik de pijltjes aan de zijkant of swipe om tussen pagina 1 en 2 te wisselen.',
    ],
  },
  PUB_GOLF: {
    title: 'Pub Golf Pro',
    emoji: '🏌️‍♂️',
    summary: 'Een kroegentocht gespeeld als een heus golftoernooi.',
    rules: [
      'Elke kroeg is een "hole" met een eigen drankje en een par (het richttarget voor slokken).',
      'Drink je drankje in zo min mogelijk slokken leeg. Elke slok telt als één punt (+1).',
      'Voltooi kroeguitdagingen voor handige bonuspunten (-1) of vermijd strafpunten (+1).',
      'Het team of de speler met de minste slokken na alle holes wint de felbegeerde trofee!',
    ],
    tip: 'Bunker shot: mors je bier? Dan levert dat een extra strafslok op!',
  },
  CHWAZI: {
    title: 'Vingeren (Chwazi)',
    emoji: '👆',
    summary: 'Snel en 100% eerlijk loten wie begint of wie trakteert.',
    rules: [
      'Iedereen plaatst één vinger tegelijk op het scherm.',
      'Houd je vingers stil: er ontstaan kleurrijke cirkels onder elke vinger.',
      'Na een paar seconden telt de app af en kiest hij willekeurig 1 vinger uit!',
      'In de instellingen kun je kiezen om meerdere winnaars te kiezen of direct teams te maken.',
    ],
    tip: 'Zorg dat niemand stiekem twee vingers op het scherm legt!',
  },
  DICE: {
    title: 'Dobbelstenen',
    emoji: '🎲',
    summary: 'Virtuele dobbelstenen voor elk bord- of partyspel.',
    rules: [
      'Kies met hoeveel dobbelstenen je wilt gooien (1 t/m 6 dobbelstenen).',
      'Tik op "Gooien" om de dobbelstenen met realistisch geluid te rollen.',
      'Het totale aantal ogen wordt direct automatisch voor je opgeteld.',
    ],
  },
  RNG: {
    title: 'Willekeurig Getal',
    emoji: '🔢',
    summary: 'Genereer een willekeurig getal binnen een zelfgekozen bereik.',
    rules: [
      'Stel een minimum en maximum getal in (bijvoorbeeld 1 t/m 100).',
      'Druk op "Genereer" om een willekeurig getal tevoorschijn te toveren.',
      'Ideaal voor lotingen, volgordes bepalen of raadspelletjes.',
    ],
  },
  SCORE_KEEPER: {
    title: 'Scorebord',
    emoji: '📋',
    summary: 'Universeel digitaal scorebord voor elk gezelschapsspel.',
    rules: [
      'Voeg spelers toe en selecteer eventueel hun eigen poppetje.',
      'Gebruik de + en - knoppen om punten bij te houden tijdens het spelen.',
      'In het overzicht zie je precies wie aan de leiding staat en hoe de scores verlopen.',
    ],
  },
  WHEEL: {
    title: 'Rad van Fortuin',
    emoji: '🎡',
    summary: 'Draai aan het circusrad om het lot te laten beslissen.',
    rules: [
      'Pas de segmenten aan met eigen opdrachten, namen of ludieke straffen.',
      'Geef een flinke slinger aan het rad en wacht in spanning af waar de pijl landt.',
      'Perfect als drankrad, keuzehulp of "wie moet de afwas doen".',
    ],
  },
  SLABAKKEN: {
    title: 'Slabakken (Times Up)',
    emoji: '🥗',
    summary: 'Het legendarische pannenspel gespeeld in drie doldwaze rondes.',
    rules: [
      'Iedereen vult vooraf geheime woorden in die in de virtuele slabak belanden.',
      'Ronde 1: Omschrijf het briefje met zoveel mogelijk zinnen (niet vertalen of rijmen).',
      'Ronde 2: Omschrijf ditzelfde briefje met slechts ÉÉN enkel woord!',
      'Ronde 3: Beeld het briefje uit zonder ook maar één geluid te maken (pantomime).',
      'Het team dat na de 3 rondes de meeste briefjes heeft geraden wint het spel!',
    ],
    tip: 'Let in ronde 1 goed op alle briefjes, want in ronde 2 en 3 komen exact dezelfde woorden terug!',
  },
  TEAM_MAKER: {
    title: 'Team Maker',
    emoji: '👥',
    summary: 'Eerlijk, snel en willekeurig teams samenstellen.',
    rules: [
      'Voer de namen van alle spelers in (of kies uit je poppetjes).',
      'Selecteer het gewenste aantal teams of de teamgrootte.',
      'Klik op "Verdeel Teams" of gebruik het lotingsrad voor een spannende onthulling!',
    ],
  },
  TOURNAMENT: {
    title: 'Toernooi Manager',
    emoji: '🏆',
    summary: 'Beheer een compleet knock-out toernooischema.',
    rules: [
      'Voer alle deelnemers of teams in en start het bracket.',
      'Speel de wedstrijden (bijv. beerpong, darten of tafelvoetbal) en vul de winnaar in.',
      'De winnaars stromen door naar de kwartfinale, halve finale en de grote finale!',
    ],
  },
  CROCODILE: {
    title: 'Bijtende Krokodil',
    emoji: '🐊',
    summary: 'Klassieke tandarts-roulette: druk op een tand en test je geluk.',
    rules: [
      'Druk om de beurt op een tand in de bek van de krokodil.',
      'Eén willekeurige tand is gevoelig en activeert het veermechanisme.',
      'Bij wie de bek plotseling dichtklapt, heeft verloren en moet een slok/straf nemen!',
    ],
    tip: 'Elk potje kiest de krokodil automatisch een andere geheime tand uit.',
  },
  BOMB: {
    title: 'Tikkende Bom',
    emoji: '💣',
    summary: 'Voer ontmantelingsopdrachten uit vóórdat de bom ontploft.',
    rules: [
      'De geheime timer tikt onvoorspelbaar in de achtergrond.',
      'Voltooi de minigame op het scherm (draden knippen, pincode, vlammen blussen, etc.).',
      'Gelukt? Geef de telefoon direct door aan de volgende speler in de kring!',
      'Degene die de telefoon vasthoudt wanneer de bom ontploft, verliest!',
    ],
  },
  CAMEL_RACE: {
    title: 'Kamelenrace',
    emoji: '🐫',
    summary: 'Zet in op je favoriete woestijnkameel en moedig hem aan naar de finish.',
    rules: [
      'Kies een speler en zet in op de kameel waarvan jij denkt dat hij gaat winnen.',
      'Start de race: de kamelen galopperen met onvoorspelbare sprints naar de finishlijn.',
      'Eindigt jouw kameel op nummer 1? Dan verdien je eeuwige roem en punten!',
    ],
  },
  CARD_CATALOG: {
    title: 'Bibliotheek',
    emoji: '📚',
    summary: 'Een overzichtelijk naslagwerk van de leukste drank- en kaartspellen.',
    rules: [
      'Blader door spelregels van bekende spellen zoals Kingsen, Bussen, Mexen en meer.',
      'Bekijk de kaartbetekenissen, spelregels en handige tips voor een geslaagde spelavond.',
    ],
  },
  BOER_ZOEKT_VROUW: {
    title: 'Boer zoekt Vrouw',
    emoji: '👨‍🌾',
    summary: 'Het ultieme drankspel voor bij het tv-programma Boer zoekt Vrouw.',
    rules: [
      'Kies jouw favoriete boer en houd je drankje gereed tijdens de uitzending.',
      'Neem een slok bij typische gebeurtenissen (ongemakkelijke stiltes, boerenspraak, trekker rijden).',
      'Gebruik de ingebouwde boerengeluiden om de sfeer erin te houden!',
    ],
  },
  MII_MAKER: {
    title: 'Spelers Pleintje',
    emoji: '👤',
    summary: 'Maak en beheer je eigen gepersonaliseerde party avatars.',
    rules: [
      'Ontwerp unieke poppetjes met kapsels, brillen, gezichtsvormen en kleuren.',
      'Je opgeslagen spelers verschijnen direct met hun eigen hoofdje in alle spellen!',
    ],
  },
  THIRTY_SECONDS: {
    title: '30 Seconds',
    emoji: '⏱️',
    summary: 'Omschrijf 5 begrippen aan je teamgenoten binnen 30 seconden.',
    rules: [
      'Team Geel en Team Blauw strijden om als eerste de doelscore te bereiken.',
      'Eén speler omschrijft de 5 woorden op het kaartje aan zijn teamgenoten.',
      'Niet vertalen, niet rijmen, niet aanwijzen en het woord zelf niet noemen!',
      'Gooi eventueel de dobbelsteen: de gegooide ogen (0, 1 of 2) worden als handicap van je score afgetrokken.',
    ],
    tip: 'Elke beurt trekt de app 5 compleet willekeurige woorden uit het woordenboek van 1000+ begrippen!',
  },
  WIE_IS: {
    title: 'Wie is?',
    emoji: '❓',
    summary: 'Een tikkende tijdbom most likely to spel.',
    rules: [
      'Bovenaan bij "JIJ" zie je wat de vorige speler zojuist over jou koos!',
      'Onderaan bij "WIE" staat de nieuwe vraag die jij aan iemand moet toewijzen.',
      'Kies in je hoofd wie er het beste bij past, geef de telefoon door en druk op "DOORGEVEN".',
      'De geheime bom tikt ondertussen onvoorspelbaar door: bij wie hij ontploft, verliest!',
    ],
    tip: 'Wat onderaan bij WIE staat, schuift bij het doorgeven 1-op-1 direct door naar JIJ voor de volgende speler!',
  },
  UNDERCOVER: {
    title: 'Undercover',
    emoji: '🛸',
    summary: 'Ontmasker de astronauten en de alien zonder woord.',
    rules: [
      'De rollen zijn: Burger (Normaal), Undercover (Astronaut) en Alien (Zonder woord).',
      'Burgers krijgen Woord A, Undercovers krijgen een vergelijkbaar Woord B, en de Alien krijgt helemáál geen woord!',
      'Undercovers kunnen ook op 0 gezet worden voor een snel potje met 3 spelers.',
      'In het rondescherm zegt iedereen om de beurt één woord dat subtiel linkt aan hun woord.',
      'Aan het einde van de ronde stemmen jullie iemand weg. De rol van de weggestemde speler wordt direct onthuld!',
      'Burgers winnen als de Alien eruit gestemd wordt of alle infiltranten weg zijn!',
    ],
    tip: 'Bluf mee als je de Alien (Zonder woord) bent en probeer uit de hints af te leiden wat het woord is!',
  },
  OP_JE_KOP: {
    title: 'Op je Kop',
    emoji: '🤯',
    summary: 'Houd de telefoon tegen je voorhoofd en raad het woord dat de rest omschrijft.',
    rules: [
      'Kies een categorie en houd de telefoon met het scherm naar de groep tegen je voorhoofd.',
      'De anderen omschrijven of beelden het woord uit, zonder het woord zelf te zeggen.',
      'Goed geraden? Kantel de telefoon naar beneden. Geen idee? Kantel omhoog om te passen.',
      'Raad zoveel mogelijk woorden voordat de tijd om is en geef daarna de telefoon door.',
    ],
    tip: 'Werkt kantelen niet op jouw telefoon? Tik dan op de rechterhelft voor goed en op de linkerhelft voor pas.',
  },
  SNELSTE_VINGER: {
    title: 'Snelste Vinger',
    emoji: '⚡',
    summary: 'Een reactieduel op één scherm: wie tikt het snelst als het sein komt?',
    rules: [
      'Leg de telefoon plat op tafel. Elke speler krijgt een eigen gekleurd vlak.',
      'Wacht op het sein: tik pas op je vlak als het scherm GROEN wordt.',
      'Wie het eerst tikt, wint het punt. Tik je te vroeg, dan krijg je een strafpunt.',
      'Met nepseinen aan flitsen er ook andere kleuren voorbij. Laat je niet foppen!',
    ],
    tip: 'De verliezer van het duel neemt een slok, of bedenk zelf een leuke straf.',
  },
  HOGER_LAGER: {
    title: 'Hoger of Lager',
    emoji: '🃏',
    summary: 'Gok of de volgende kaart hoger of lager is en laat de pot oplopen.',
    rules: [
      'Bekijk de open kaart en gok of de volgende kaart hoger of lager is.',
      'Elke goede gok gooit één slok in de pot. De aas is de hoogste kaart.',
      'Na drie goede gokken op rij mag je doorgeven: de volgende speler neemt de pot over.',
      'Gok je fout, dan drink jij de hele pot leeg. Is de kaart precies gelijk? Dan telt de pot dubbel!',
    ],
    tip: 'Durf je door te gaan bij een 7 of een 8? Dat is de gevaarlijkste gok van het spel.',
  },
  NOOIT: {
    title: 'Ik heb nog nooit',
    emoji: '😇',
    summary: 'Stellingen van gezellig tot pittig: wie het wél heeft gedaan, neemt een slok.',
    rules: [
      'Kies hoe pittig de stellingen mogen zijn: Gezellig, Feest of Pittig (of alles door elkaar).',
      'Lees de stelling hardop voor: "Ik heb nog nooit..."',
      'Iedereen die het wél een keer heeft gedaan, neemt een slok.',
      'Ben je de enige die drinkt? Dan ben je de groep een verhaal verschuldigd!',
    ],
    tip: 'Voeg je eigen stellingen toe om het spel persoonlijk te maken.',
  },
};
