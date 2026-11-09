/**
 * 30 Seconds Word Data System
 * Words are selected completely at random from a master pool of 850+ words.
 * Custom words are added individually (not fixed cards) so every round is unique.
 */

export const DEFAULT_WORDS: string[] = [
  // --- Beroemdheden & Personen (Nederlands & Internationaal) ---
  'Max Verstappen', 'Johan Cruijff', 'Beyoncé', 'André van Duin', 'Koning Willem-Alexander',
  'Taylor Swift', 'Lionel Messi', 'Chantal Janzen', 'Gordon', 'Martien Meiland',
  'Barack Obama', 'Adele', 'Femke Bol', 'Cristiano Ronaldo', 'Koningin Máxima',
  'Albert Einstein', 'Rico Verhoeven', 'Guus Meeuwis', 'Elon Musk', 'Anouk',
  'Billie Eilish', 'Memphis Depay', 'Frans Bauer', 'Ed Sheeran', 'Sven Kramer',
  'Lady Gaga', 'Dafne Schippers', 'Freddie Mercury', 'Arjen Robben', 'Ali B',
  'Vincent van Gogh', 'Michael Jackson', 'Epke Zonderland', 'Rihanna', 'Mathieu van der Poel',
  'Wendy van Dijk', 'Shakira', 'Virgil van Dijk', 'Linda de Mol', 'Tom Cruise',
  'Joost Klein', 'Davina Michelle', 'Kobe Bryant', 'Snollebollekes', 'Dua Lipa',
  'Jochem Myjer', 'Justin Bieber', 'Suzanne & Freek', 'Usain Bolt', 'Najib Amhali',
  'Brad Pitt', 'Duncan Laurence', 'Kaj Gorgels', 'Miley Cyrus', 'Lieke Martens',
  'Kensington', 'Martin Garrix', 'Armin van Buuren', 'Tiësto', 'Afrojack',
  'Rembrandt van Rijn', 'Anne Frank', 'Ruud Gullit', 'Bibi Breijman', 'Rob Kemps',
  'Marco Borsato', 'Harry Mulisch', 'Eva Jinek', 'Matthijs van Nieuwkerk', 'Beau van Erven Dorens',
  'Humberto Tan', 'Gerard Joling', 'René Froger', 'Jan Smit', 'Nick & Simon',
  'Monique Smit', 'Danny de Munk', 'Willeke Alberti', 'Paul de Leeuw', 'Carlo Boszhard',
  'Irene Moors', 'Ruben van der Meer', 'Tijl Beckand', 'Jeroen van Koningsbrugge', 'Dennis Weening',
  'Ferry Doedens', 'Froukje de Both', 'Katja Schuurman', 'Birgit Schuurman', 'Bridget Maasland',
  'Yolanthe Cabau', 'Sylvie Meis', 'Doutzen Kroes', 'Romee Strijd', 'Nikkie de Jager',
  'Enzo Knol', 'Milan Knol', 'Dylan Haegens', 'StukTV', 'Giel de Winter',
  'Thomas van der Vlugt', 'Stefan Jurriens', 'Bram Krikke', 'Bas Smit', 'Nicolette van Dam',
  'Freek Vonk', 'Arjen Lubach', 'Youp van \'t Hek', 'Herman Finkers', 'Theo Maassen',
  'Hans Teeuwen', 'Ronald Goedemondt', 'Daniël Arends', 'Peter Pannekoek', 'Henry van Loon',
  'Stefano Keizers', 'Soundos El Ahmadi', 'Jörgen Raymann', 'Javier Guzman', 'Karin Bloemen',
  'Donald Trump', 'Joe Biden', 'Vladimir Poetin', 'Volodymyr Zelensky', 'Emmanuel Macron',
  'Angela Merkel', 'Boris Johnson', 'Prins Harry', 'Meghan Markle', 'Koningin Elizabeth',
  'Prinses Diana', 'Paus Franciscus', 'Dalai Lama', 'Nelson Mandela', 'Martin Luther King',
  'Mahatma Gandhi', 'Winston Churchill', 'Julius Caesar', 'Napoleon Bonaparte', 'Cleopatra',
  'Leonardo da Vinci', 'William Shakespeare', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Pablo Picasso',
  'Stephen Hawking', 'Isaac Newton', 'Charles Darwin', 'Marie Curie', 'Thomas Edison',
  'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos', 'Warren Buffett',
  'Oprah Winfrey', 'Ellen DeGeneres', 'Kim Kardashian', 'Kylie Jenner', 'Kendall Jenner',
  'Kanye West', 'Drake', 'Eminem', 'Snoop Dogg', 'Jay-Z',
  'Madonna', 'Britney Spears', 'Ariana Grande', 'Selena Gomez', 'Katy Perry',
  'Harry Styles', 'Zayn Malik', 'Bruno Mars', 'The Weeknd', 'Post Malone',
  'Leonardo DiCaprio', 'Johnny Depp', 'Will Smith', 'Denzel Washington', 'Morgan Freeman',
  'Keanu Reeves', 'Robert Downey Jr.', 'Chris Hemsworth', 'Dwayne Johnson', 'Ryan Reynolds',
  'Jennifer Aniston', 'Angelina Jolie', 'Scarlett Johansson', 'Emma Watson', 'Margot Robbie',
  'Zendaya', 'Meryl Streep', 'Julia Roberts', 'Sandra Bullock', 'Natalie Portman',
  'Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Serena Williams', 'Tiger Woods',
  'Lewis Hamilton', 'Michael Schumacher', 'LeBron James', 'Michael Jordan', 'Shaquille O\'Neal',
  'David Beckham', 'Zlatan Ibrahimović', 'Neymar', 'Kylian Mbappé', 'Erling Haaland',
  'Pelé', 'Diego Maradona', 'Mike Tyson', 'Muhammad Ali', 'Conor McGregor',
  'Harry Potter', 'Hermelien Griffel', 'Ron Wemel', 'Voldemort', 'Albus Perkamentus',
  'Luke Skywalker', 'Darth Vader', 'Yoda', 'Han Solo', 'Prinses Leia',
  'James Bond', 'Sherlock Holmes', 'Batman', 'Superman', 'Spider-Man',
  'The Joker', 'Iron Man', 'Captain America', 'Thor', 'Hulk',
  'Mickey Mouse', 'Donald Duck', 'Goofy', 'Dagobert Duck', 'Kwik, Kwek en Kwak',
  'SpongeBob SquarePants', 'Patrick Ster', 'Octo Tentakel', 'Shrek', 'Pikachu',
  'Mario', 'Luigi', 'Bowser', 'Prinses Peach', 'Sonic the Hedgehog',

  // --- Steden, Landen & Wereldwonderen ---
  'Parijs', 'Amsterdam', 'Tokio', 'New York', 'Londen',
  'Rome', 'Berlijn', 'Sydney', 'Barcelona', 'Rio de Janeiro',
  'Venetië', 'Athene', 'Dublin', 'Los Angeles', 'Las Vegas',
  'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen',
  'Maastricht', 'Breda', 'Tilburg', 'Almere', 'Nijmegen',
  'Arnhem', 'Haarlem', 'Enschede', 'Amersfoort', 'Zaanstad',
  'Apeldoorn', 'Zwolle', 'Leiden', 'Dordrecht', 'Zoetermeer',
  'Egypte', 'De Eiffeltoren', 'De Sahara', 'De Waddeneilanden', 'De Noordpool',
  'De Zuidpool', 'De Piramides van Gizeh', 'De Chinese Muur', 'Het Colosseum', 'De Taj Mahal',
  'Het Vrijheidsbeeld', 'De Big Ben', 'De Scheve Toren van Pisa', 'De Sagrada Família', 'Het Sydney Opera House',
  'De Grand Canyon', 'De Niagara Watervallen', 'De Mount Everest', 'De Amazone', 'Het Zwarte Woud',
  'De Dode Zee', 'De Middellandse Zee', 'De Stille Oceaan', 'De Atlantische Oceaan', 'De Noordzee',
  'Australië', 'Brazilië', 'Canada', 'China', 'Duitsland',
  'Engeland', 'Frankrijk', 'Griekenland', 'India', 'Indonesië',
  'Italië', 'Japan', 'Marokko', 'Mexico', 'Nederland',
  'Nieuw-Zeeland', 'Noorwegen', 'Oostenrijk', 'Polen', 'Portugal',
  'Rusland', 'Spanje', 'Thailand', 'Turkije', 'Verenigde Staten',
  'Zuid-Afrika', 'Zweden', 'Zwitserland', 'België', 'Luxemburg',
  'Madagaskar', 'IJsland', 'Groenland', 'Cuba', 'Jamaica',
  'Bali', 'Ibiza', 'Mallorca', 'Kreta', 'Hawaï',
  'Aruba', 'Curaçao', 'Bonaire', 'Sint Maarten', 'Suriname',
  'Keukenhof', 'Madurodam', 'De Efteling', 'Walibi Holland', 'Duinrell',
  'Artis', 'Burgers\' Zoo', 'Blijdorp', 'Wildlands Emmen', 'Apenheul',
  'Het Rijksmuseum', 'Het Van Gogh Museum', 'Het Anne Frank Huis', 'Het Mauritshuis', 'Paleis Noordeinde',
  'Paleis Het Loo', 'Het Vondelpark', 'De Euromast', 'De Erasmusbrug', 'De Domtoren',
  'De Martinitoren', 'Het Binnenhof', 'De Afsluitdijk', 'De Deltawerken', 'Kinderdijk',

  // --- Merken, Bedrijven & Producten ---
  'Albert Heijn', 'HEMA', 'IKEA', 'Spotify', 'Netflix',
  'Apple', 'Tesla', 'McDonald\'s', 'Red Bull', 'LEGO',
  'Philips', 'Bol.com', 'Kruidvat', 'Nike', 'Adidas',
  'Coolblue', 'Action', 'Unox', 'Calvé Pindakaas', 'Coca-Cola',
  'PlayStation', 'KLM', 'Douwe Egberts', 'Nintendo', 'Audi',
  'Google', 'Ziggo', 'Twitter / X', 'TikTok', 'YouTube',
  'Facebook', 'Instagram', 'WhatsApp', 'Snapchat', 'LinkedIn',
  'Amazon', 'Microsoft', 'Samsung', 'Sony', 'Disney',
  'BMW', 'Mercedes-Benz', 'Volkswagen', 'Porsche', 'Ferrari',
  'Lamborghini', 'Toyota', 'Ford', 'Volvo', 'Renault',
  'Burger King', 'KFC', 'Subway', 'Domino\'s Pizza', 'Starbucks',
  'Heineken', 'Amstel', 'Grolsch', 'Bavaria', 'Hertog Jan',
  'Jumbo', 'Plus', 'Aldi', 'Lidl', 'Spar',
  'Etos', 'Blokker', 'Zeeman', 'Wibra', 'MediaMarkt',
  'Decathlon', 'Zara', 'H&M', 'Primark', 'C&A',
  'Chanel', 'Gucci', 'Louis Vuitton', 'Prada', 'Rolex',
  'Chocomel', 'Fristi', 'Red Band', 'Haribo', 'Tony\'s Chocolonely',
  'Milka', 'M&M\'s', 'Snickers', 'Mars (Chocola)', 'Twix',
  'Lay\'s', 'Doritos', 'Pringles', 'Croky', 'Calvé',
  'Remia', 'Knorr', 'Maggi', 'Honig', 'Dr. Oetker',

  // --- Eten, Drinken & Uitgaan ---
  'Bitterballen', 'Stroopwafel', 'Kaasschaaf', 'Frikandel speciaal', 'Kapsalon',
  'Tequila', 'Pannenkoek', 'Gin-Tonic', 'Kaassoufflé', 'Kroket',
  'Barbecue', 'Appeltaart', 'Haring met uitjes', 'Chinees buffet', 'Boerenkool met worst',
  'Cocktail', 'Zonnebloempitten', 'Poffertjes', 'Oliebollen', 'Appelflappen',
  'Speculaas', 'Pepernoten', 'Kruidnoten', 'Taai-taai', 'Banketletter',
  'Hutspot', 'Zuurkoolstamppot', 'Erwtensoep / Snert', 'Babi Pangang', 'Kipsaté',
  'Nasi Goreng', 'Bami Goreng', 'Loempia', 'Sushi', 'Pizza Margherita',
  'Spaghetti Bolognese', 'Lasagne', 'Hamburger', 'Tosti ham-kaas', 'Broodje Unox',
  'Broodje Mario', 'Broodje warm vlees', 'Uitsmijter', 'Wentelteefjes', 'Wentelteefje',
  'Patat met mayonaise', 'Patat Oorlog', 'Berenklauw', 'Vlammetjes', 'Bittergarnituur',
  'Kaasplankje', 'Oude kaas', 'Goudse kaas', 'Edammer kaas', 'Geitenkaas',
  'Hagelslag', 'Vlokken', 'Muisjes', 'Beschuit met muisjes', 'Ontbijtkoek',
  'Chocolademousse', 'Tiramisu', 'Crème Brûlée', 'Softijsje', 'Waterijsje',
  'Bierpul', 'Wijnglas', 'Champagne', 'Prosecco', 'Mojito',
  'Aperol Spritz', 'Pina Colada', 'Espresso Martini', 'Whisky', 'Wodka',
  'Rum', 'Bessenjenever', 'Advocaat met slagroom', 'Jägermeister', 'Salmari',
  'Flügel', 'Apfelkorn', 'Radler', 'Speciaalbier', 'Herfstbok',

  // --- Films, Series & Televisie ---
  'Wie is de Mol?', 'Titanic', 'The Lion King', 'Goede Tijden Slechte Tijden', 'Harry Potter',
  'Boer Zoekt Vrouw', 'Squid Game', 'Expeditie Robinson', 'Friends', 'Game of Thrones',
  'Avatar', 'The Voice of Holland', 'De Luizenmoeder', 'Stranger Things', 'Zondag met Lubach',
  'Star Wars', 'Breaking Bad', 'Flodder', 'Jurassic Park', 'De Slimste Mens',
  'Wednesday', 'Ted Lasso', 'Bassie & Adriaan', 'Peaky Blinders', 'Spoorloos',
  'A Star Is Born', 'Undercover', 'Bohemian Rhapsody', 'Studio Sport', 'The Masked Singer',
  'Het Klokhuis', 'Thriller', 'Jeugdjournaal', 'Ocean\'s 8', 'Tour de France',
  'Miljoenenjacht', 'Gooische Vrouwen', 'Top Gun', 'Eurovisie Songfestival', 'Beste Zangers',
  'Space Jam', 'Carnaval', 'Barbie (Film)', 'Temptation Island', 'Hannah Montana',
  'EK Vrouwenvoetbal', 'De Nachtwacht', 'Oh Oh Cherso', 'First Dates', 'Lego Masters',
  'Heel Holland Bakt', 'De Verraders', 'Kopen Zonder Kijken', 'B&B Vol Liefde', 'Chateau Meiland',
  'Mocro Maffia', 'Flikken Maastricht', 'Penoza', 'Baantjer', 'Familie Kruys',
  'New Kids', 'Costa!', 'Alles is Liefde', 'Ja Zuster, Nee Zuster', 'Ciske de Rat',
  'Soldaat van Oranje', 'De Aanslag', 'Zwartboek', 'Karakter', 'Turks Fruit',
  'Lord of the Rings', 'The Matrix', 'Inception', 'Interstellar', 'The Dark Knight',
  'Gladiator', 'Pulp Fiction', 'Forrest Gump', 'The Godfather', 'Shawshank Redemption',
  'Fight Club', 'The Hangover', 'Home Alone', 'Toy Story', 'Finding Nemo',
  'Frozen', 'Moana', 'Aladdin', 'Beauty and the Beast', 'Mulan',
  'The Simpsons', 'Family Guy', 'South Park', 'Rick and Morty', 'Futurama',
  'Modern Family', 'The Office', 'Brooklyn Nine-Nine', 'How I Met Your Mother', 'The Big Bang Theory',
  'Narcos', 'Money Heist / La Casa de Papel', 'The Crown', 'Black Mirror', 'The Witcher',
  'The Mandalorian', 'Loki', 'The Last of Us', 'Succession', 'White Lotus',

  // --- Voorwerpen, Dagelijks Leven & Acties ---
  'Tandenborstel', 'Paraplu', 'Giraffe', 'Sneeuwpop', 'Zonnebril',
  'Kangoeroe', 'Barbecue', 'Gitaar', 'Voetbalschoen', 'Koffiezetapparaat',
  'Stiletto hakken', 'Snor', 'Schwalbe', 'Zonnebloemen', 'Maanwandeling',
  'Rekstok', 'Modderpoel', 'Gouden Koffer', 'Heupen', 'Aanvoerdersband',
  'Straaljager', 'Hakken', 'Volkslied', 'Basketbal', 'Polonaise',
  'Discolamp', 'Stampertje', 'Petje achterstevoren', 'Bliksemschicht', 'Vloggen',
  'Draaitafel', 'Koptelefoon', 'Rasta pruik', 'Sloopkogel', 'Rookgordijn',
  'Fietsbel', 'Wasmachine', 'Stofzuiger', 'Strijkijzer', 'Koelkast',
  'Magnetron', 'Vaatwasser', 'Kruimeldief', 'Föhn', 'Wekker',
  'Afstandsbediening', 'Oplader', 'Verlengsnoer', 'Zaklamp', 'Gereedschapskist',
  'Hamer', 'Schroevendraaier', 'Zaag', 'Waterpas', 'Ducttape',
  'Plakband', 'Schaar', 'Puntenslijper', 'Nietmachine', 'Prullenbak',
  'Bureaulamp', 'Boekensteun', 'Wereldbol', 'Krijtbord', 'Whiteboard',
  'Paspoort', 'Rijbewijs', 'Bankpas', 'Portemonnee', 'Sleutelbos',
  'Rugzak', 'Koffer', 'Zwemband', 'Luchtbed', 'Slaapzak',
  'Tent', 'Kampvuur', 'Zakmes', 'Kompas', 'Verrekijker',
  'Skibril', 'Snowboard', 'Schaatsen', 'Slee', 'Bobslee',
  'Tennisracket', 'Golfclub', 'Voetbal', 'Volleybal', 'Honkbalknuppel',
  'Tafeltennisbatje', 'Dartpijl', 'Bowlingbal', 'Bokshandschoen', 'Yoga-matje',
  'Zwemvliezen', 'Duikbril', 'Snorkel', 'Reddingsvest', 'Surfplank',
  'Kano', 'Zeilboot', 'Waterfiets', 'Jetski', 'Onderzeeër',
  'Helikopter', 'Heteluchtballon', 'Parachute', 'Kabelbaan', 'Reuzenrad',
  'Achtbaan', 'Botsauto\'s', 'Draaimolen', 'Spookhuis', 'Suikerspin',
  'Popcorn', 'Bioscoopkaartje', 'Rode Loper', 'Gouden Kalf', 'Oscar-beeldje',
  'Bruidstaart', 'Trouwjurk', 'Trouwring', 'Verjaardagskalender', 'Feestslinger',
  'Ballonnen', 'Confetti', 'Sterretjes', 'Vuurpijl', 'Champagnekurk',
  'Kater', 'Zonnebrandcrème', 'Parasol', 'Strandhanddoek', 'Zandkasteel',
  'Kwal', 'Zeester', 'Krab', 'Dolfijn', 'Haai',
  'Walvis', 'Pinguïn', 'IJsbeer', 'Kameel', 'Olifant',
  'Neushoorn', 'Nijlpaard', 'Leeuw', 'Tijger', 'Cheetah',
  'Zebra', 'Aap', 'Chimpansee', 'Gorilla', 'Krokodil',
  'Slang', 'Schildpad', 'Kikker', 'Kameleon', 'Vleermuis',
  'Uil', 'Adelaar', 'Papegaai', 'Flamingo', 'Pauw',
  'Zwaan', 'Eend', 'Kip', 'Haan', 'Koe',
  'Varken', 'Schaap', 'Geit', 'Paard', 'Ezel',
  'Hond', 'Kat', 'Konijn', 'Cavia', 'Hamster',
  'Goudvis', 'Bij', 'Wesp', 'Vlinder', 'Lieveheersbeestje',
  'Mug', 'Spin', 'Mier', 'Slak', 'Regenworm',

  // --- Typische Begrippen, Spreekwoorden & Situaties ---
  'Spiegelei', 'Verkeersdrempel', 'Zonsondergang', 'Slapeloosheid', 'Fileparkeren',
  'Katerontbijt', 'Treinvertraging', 'Kringverjaardag', 'Blauwe Maandag', 'Zomertijd',
  'Wintertijd', 'Prinsjesdag', 'Koningsdag', 'Bevrijdingsdag', 'Sinterklaas',
  'Pakjesavond', 'Kerstboom', 'Oud & Nieuw', 'Nieuwjaarsduik', 'Paashaas',
  'Vrijmibo', 'Koffiepauze', 'Hondenweer', 'Stormwaarschuwing', 'Code Rood',
  'Hittegolf', 'Elfstedentocht', 'Klomp', 'Molens', 'Tulpenbollen',
  'Woonboot', 'Grachtenpand', 'Bakfiets', 'Kettingkast', 'Lekke band',
  'Rode Kruis', 'Brandweerwagen', 'Politieauto', 'Ambulance', 'Sirene',
  'EHBO-doos', 'Pleister', 'Thermometer', 'Mondkapje', 'Injectiespuit',
  'Röntgenfoto', 'Gipsbeen', 'Rolstoel', 'Krukken', 'Stethoscoop',
  'Tandartsstoel', 'Kappersschaar', 'Spiegelpaleis', 'Escape Room', 'Lasergame',
  'Karaokebar', 'Silent Disco', 'Foodtruck', 'Popfestival', 'Campingstoel',
  'Gasbarbecue', 'Zak marshmallows', 'Gitaarakkoord', 'Moshpit', 'Stage dive',
  'Handtekening', 'Selfie', 'Filter', 'Hashtag', 'Livestream',
  'Podcastmicrofoon', 'Ringlamp', 'Groen scherm', 'Teleprompter', 'Regisseur',
  'Stuntman', 'Figurant', 'Paparazzi', 'Bodyguard', 'Limousine',
  'Privévliegtuig', 'Luxe jacht', 'Helikopterplatform', 'Zwembadfeest', 'Bubbelbad',
  'Saunabezoek', 'Massagetafel', 'Modderbad', 'Kruidenbad', 'Voetenbad',
  'Kippenvel', 'Glimlach', 'Kinkhoest', 'Hik', 'Geeuw',
  'Niesbui', 'Snurken', 'Dromenland', 'Nachtmerrie', 'Slaapwandelen',
  'Glazen bol', 'Horoscoop', 'Koffiedik kijken', 'Klavertje vier', 'Hoefijzer',
  'Regenboog', 'Onweersbui', 'Blikseminslag', 'Noorderlicht', 'Vallende ster',
  'Maanverduistering', 'Zonsverduistering', 'Meteoriet', 'Zwart gat', 'Melkweg',

  // --- BN'ers, Artiesten & Bekende Nederlanders (+100) ---
  'Jeroen Pauw', 'Eva Koreman', 'Frank Lammers', 'Daan Schuurmans', 'Bracha van Doesburgh',
  'Elise Schaap', 'Tygo Gernandt', 'Nasrdin Dchar', 'Achmed Akkabi', 'Walid Benmbarek',
  'Robert ten Brink', 'Loretta Schrijver', 'Quinty Trustfull', 'Winston Gerschtanowitz', 'Renate Verbaan',
  'Tooske Ragas', 'Bastiaan Ragas', 'Jan Kooijman', 'Jim Bakkum', 'Jamai Loman',
  'Glennis Grace', 'Samantha Steenwijk', 'Mart Hoogkamer', 'John de Bever', 'Wolter Kroes',
  'Django Wagner', 'Jannes', 'René Schuurmans', 'Stef Ekkel', 'Tino Martin',
  'Donnie', 'Kraantje Pappie', 'Bizzey', 'Frenna', 'Ronnie Flex',
  'Lil Kleine', 'Boef', 'Broederliefde', 'Hef', 'Sevn Alias',
  'Josylvio', 'Tabitha', 'Maan', 'S10', 'Meau',
  'FLEUR', 'Claude', 'Emma Heesters', 'Zoë Tauran', 'Acda en De Munnik',
  'BLØF', 'De Dijk', 'Doe Maar', 'Het Goede Doel', 'Kane',
  'Di-rect', 'Golden Earring', 'Within Temptation', 'Floor Jansen', 'Ilse DeLange',
  'Waylon', 'Douwe Bob', 'Anny Schilder', 'BZN', 'George Baker',
  'Vader Abraham', 'Pipo de Clown', 'Swiebertje', 'Ti-ta Tovenaar', 'Samson & Gert',
  'Kabouter Plop', 'Mega Mindy', 'K3', 'Piet Piraat', 'Bumba',
  'Ernst & Bobbie', 'Buurman & Buurman', 'Telekids', 'Ron Brandsteder', 'André Hazes Jr.',
  'Roxeanne Hazes', 'Rachel Hazes', 'Peter R. de Vries', 'Kees van der Spek', 'John van den Heuvel',
  'Thijs Zeeman', 'Alberto Stegeman', 'Patty Brard', 'Connie Witteman', 'Gerard Ekdom',
  'Domien Verschuuren', 'Mattie & Marieke', 'Coen & Sander', 'Ruud de Wild', 'Giel Beelen',
  'Edwin Evers', 'Lex Gaarthuis', 'Frank Dane', 'Wietze de Jager', 'Marieke Elsinga',

  // --- Nederlandse Cultuur, Drankspellen & Gewoontes (+100) ---
  'Adtje des doods', 'Bakken vouwen', 'Bierpong', 'Mexxen', 'Bussen (drankspel)',
  'Vrijgezellenfeest', 'Kroegentocht', 'Cantus', 'Katerontbijt', 'Brakke zondag',
  'Kringverjaardag', 'Leverworst met vlaggetje', 'Blokjes kaas met zilveruitjes', 'Gevuld eitje', 'Gehaktballetjes in satésaus',
  'Saucijzenbroodje', 'Kaasbroodje', 'Frikandelbroodje', 'Kalfskroket', 'Bamischijf',
  'Nasischijf', 'Kipcorn', 'Pikanto', 'Sito-stick', 'Mexicaantje',
  'Joppiesaus', 'Oorlog zonder uitjes', 'Speciaal met curry', 'Broodje bal', 'Broodje kroket',
  'Broodje haring', 'Kibbeling met knoflooksaus', 'Lekkerbekje', 'Gebakken mosselen', 'Gerookte paling',
  'Hollandse Nieuwe', 'Zeeuwse bolus', 'Bossche bol', 'Tompouce met koningsdag', 'Limburgse vlaai',
  'Stroopwafelkraam', 'Poffertjeskraam', 'Haringkar', 'Kaasmarkt Alkmaar', 'Zaanse Schans',
  'Giethoorn', 'Keukenhof tulpen', 'Rondvaartboot', 'Waterfietsen op de gracht', 'Tramrit',
  'NS Treinkaartje', 'OV-chipkaart', 'Inchecken en uitchecken', 'Conducteur', 'Spoorwisseling',
  'Vertraging op het spoor', 'Blaastest', 'Flitsmeister', 'Flitspaal', 'Spitsstrook',
  'Matrixbord', 'Spitsuur', 'Filemelding', 'ANWB Wegenwacht', 'Gele hesje',
  'Gevarendriehoek', 'Reservewiel', 'Startkabels', 'IJskrabber', 'Ruitensproeiervloeistof',
  'APK-keuring', 'Parkeerschijf', 'Parkeermeter', 'Laadpaal', 'Elektrische fiets',
  'Fatbike', 'Bakfietsmoeder', 'Speed pedelec', 'Helmplicht', 'Belastingdienst',
  'Blauwe envelop', 'Toeslagenaffaire', 'Huurtoeslag', 'Zorgverzekering', 'Eigen risico',
  'Tandartsverzekering', 'Polisvoorwaarden', 'BSN-nummer', 'DigiD code', 'Twee-factor-authenticatie',

  // --- TV Programma\'s, Spelletjes & Games (+100) ---
  'Het Perfecte Plaatje', 'Hunted', 'Kamp van Koningsbrugge', 'Special Forces VIPS', 'Eilandraad',
  'Immuniteitsmunt', 'Zwarte vrijstelling', 'Groene vrijstelling', 'Bankgiro Loterij', 'Postcode Loterij',
  'Gouden Koffer', 'Winston aan de deur', 'Rad van Fortuin', 'Lingo', 'Lucille Werner',
  'Groene bal', 'Rode bal', 'JP van Lingo', '1 tegen 100', 'Caroline Tensen',
  'Twee voor Twaalf', 'Astrid Joosten', 'Per Seconde Wijzer', 'Maarten van Rossem', 'Philip Freriks',
  'Herman van der Zandt', 'Te land, ter zee en in de lucht', 'Tobbedansen', 'Vlieg er eens uit', 'Snel naar de bel',
  'Ren je Rot', 'Sterren Dansen op het IJs', 'Dancing with the Stars', 'Henkjan Smits', 'X Factor',
  'Popstars', 'Holland\'s Got Talent', 'RTL Boulevard', 'Shownieuws', 'Hart van Nederland',
  'SBS6 Weerbericht', 'Piet Paulusma', 'Oant moarn!', 'NOS Journaal', 'Achtuurjournaal',
  'Gerrit Hiemstra', 'Buienradar', 'KNMI waarschuwing', 'Catan', 'Ticket to Ride',
  'Carcassonne', 'Regenwormen', 'Exploding Kittens', 'Beverbende', 'Weerwolven van Wakkerdam',
  'Stef Stuntpiloot', 'Dokter Bibber', 'Twister', 'Ganzenbord', 'Mens Erger Je Niet',
  'Risk', 'Cluedo', 'Stratego', 'Rummikub', 'Scrabble',
  'Yahtzee', 'Halli Galli', 'Party & Co', 'Trivial Pursuit', 'Monopoly',
  'Kalverstraat', 'Barteljorisstraat', 'Dorpsstraat Ons Dorp', 'Vrij Parkeren', 'Kanskaart',
  'Algemeen Fonds', 'Wii Sports', 'Mario Kart', 'Super Smash Bros', 'Minecraft',
  'Fortnite', 'Grand Theft Auto', 'Call of Duty', 'FIFA / EA FC', 'Pokémon Go',
  'World of Warcraft', 'Zelda: Breath of the Wild', 'Tetris', 'Pac-Man', 'Donkey Kong',

  // --- Iconische Locaties, Stadions & Reizen (+100) ---
  'Scheveningen Pier', 'Zandvoort aan Zee', 'Bloemendaal', 'Renesse', 'Oerol Festival',
  'Texelse Schapen', 'Vlieland Duinen', 'Ameland Vuurtoren', 'Schiermonnikoog', 'Drielandenpunt',
  'Vaalserberg', 'Utrechtse Heuvelrug', 'De Veluwe', 'De Posbank', 'Kröller-Müller Museum',
  'Paleis Soestdijk', 'Paleis Huis ten Bosch', 'De Ridderzaal', 'Tweede Kamer der Staten-Generaal', 'Minister-President',
  'Torentje van Rutte', 'Catshuisoverleg', 'Meisje met de Parel', 'Nachtwachtzaal', 'NEMO Science Museum',
  'A\'DAM Lookout', 'Johan Cruijff ArenA', 'De Kuip Rotterdam', 'Philips Stadion', 'De Grolsch Veste',
  'GelreDome', 'Abe Lenstra Stadion', 'TT Circuit Assen', 'Circuit Zandvoort', 'Thialf Heerenveen',
  'Ahoy Rotterdam', 'Ziggo Dome', 'AFAS Live', 'Koninklijk Theater Carré', 'Circustheater Scheveningen',
  'Luxor Theater', 'De Doelen', 'TivoliVredenburg', 'Melkweg', 'Paradiso Amsterdam',
  'Las Vegas Strip', 'Times Square', 'Hollywood Walk of Fame', 'Hollywood Sign', 'Golden Gate Bridge',
  'Alcatraz', 'Central Park', 'Empire State Building', 'Burj Khalifa', 'Palm Jumeirah',
  'Mount Fuji', 'Machu Picchu', 'Chichén Itzá', 'Cristo Redentor', 'Iguazu Watervallen',
  'Tafelberg Kaapstad', 'Serengeti Park', 'Victoriawatervallen', 'Great Barrier Reef', 'Santorini',
  'Akropolis Athene', 'Pompeï', 'Vaticaanstad', 'Sixtijnse Kapel', 'Sint-Pietersbasiliek',
  'Trevifontein', 'Notre-Dame van Parijs', 'Louvre Glazen Piramide', 'Arc de Triomphe', 'Champs-Élysées',
  'Moulin Rouge', 'Disneyland Parijs', 'Kasteel van Doornroosje', 'Canary Wharf', 'Buckingham Palace',
  'Tower Bridge', 'Hyde Park', 'Stonehenge', 'Loch Ness Monster', 'Colosseum van Rome',

  // --- Voeding, Snacks, Snoep & Merken (+100) ---
  'Zaanse Mayonaise', 'Curry Gewürz', 'Sambal Oelek', 'Sambal Badjak', 'Ketjap Manis',
  'Kroepoek', 'Atjar Tjamboer', 'Saté Ajam', 'Saté Babi', 'Gado Gado',
  'Spekkoek', 'Pandan cake', 'Krentenbol', 'Mueslibol', 'Roggebrood met spek',
  'Filet Americain met uitjes', 'Ossenworst', 'Leverkaas', 'Grillworst met kaas', 'Rookvlees',
  'Zeeuws spek', 'Katenspek', 'Pepersteak', 'Biefstuk met champignons', 'Spareribs met knoflooksaus',
  'Kipschnitzel', 'Cordon bleu', 'Slavink', 'Boomstammetje', 'Gehaktbal met jus',
  'Hete bliksem', 'Balkenbrij', 'Bloedworst', 'Droge worst', 'Groninger koek',
  'Fries suikerbrood', 'Deventer koek', 'Zeeuwse babbelaars', 'Haagsche hopjes', 'Wilhelmina pepermunt',
  'King pepermunt', 'Mentos rol', 'Zoute drop', 'Zoete drop', 'Muntdrop',
  'Katjesdrop', 'Honingdrop', 'Dubbelzout drop', 'Engelse drop', 'Autodrop',
  'Katja apenkoppen', 'Venco drop', 'Haribo goudberen', 'Zure matten', 'Kikkertjes snoep',
  'Spekjes', 'Zuurtjes', 'Lollypop', 'Kauwgombal', 'Chupa Chups',
  'Kinder Surprise ei', 'Kinder Bueno', 'KitKat Chunky', 'Lion reep', 'Bounty',
  'Twix wit', 'Mars reep', 'Snickers ijsje', 'Magnum amandel', 'Cornetto klassiek',
  'Raketje ijs', 'Schatkistje ijs', 'Calippo cola', 'Solero exotic', 'Ben & Jerry\'s Cookie Dough',
  'Hertog ijs slagroom', 'Viennetta ijstaart', 'Pistachenootjes', 'Cashewnoten', 'Borrelnootjes'
];

const STORAGE_CUSTOM_WORDS_KEY = 'party_channels_30_seconds_custom_words';

/**
 * Load user's individually added custom words from localStorage
 */
export function loadCustomWords(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_WORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(w => typeof w === 'string' && w.trim().length > 0);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Add a single custom word to the pool
 */
export function addCustomWord(word: string): string[] {
  const trimmed = word.trim();
  if (!trimmed) return loadCustomWords();

  const current = loadCustomWords();
  // Case-insensitive uniqueness check
  const exists = current.some(w => w.toLowerCase() === trimmed.toLowerCase());
  if (exists) return current;

  const updated = [trimmed, ...current];
  try {
    localStorage.setItem(STORAGE_CUSTOM_WORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom 30 seconds word', e);
  }
  return updated;
}

/**
 * Delete a custom word
 */
export function deleteCustomWord(wordToDelete: string): string[] {
  const current = loadCustomWords();
  const updated = current.filter(w => w.toLowerCase() !== wordToDelete.toLowerCase());
  try {
    localStorage.setItem(STORAGE_CUSTOM_WORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete custom word', e);
  }
  return updated;
}

/**
 * Reset all custom words
 */
export function resetCustomWords(): string[] {
  try {
    localStorage.removeItem(STORAGE_CUSTOM_WORDS_KEY);
  } catch {}
  return [];
}

/**
 * Returns the entire master pool of words (defaults + custom words)
 */
export function getAllWords(): string[] {
  const custom = loadCustomWords();
  const customSet = new Set(custom.map(w => w.toLowerCase()));
  const filteredDefaults = DEFAULT_WORDS.filter(w => !customSet.has(w.toLowerCase()));
  return [...custom, ...filteredDefaults];
}

/**
 * Draws 5 completely random, shuffled words from the word pool.
 * Words are truly random so that words on a card have no predictable connection!
 */
export function drawRandomWords(
  count: number = 5,
  alreadyUsed: Set<string> = new Set()
): { words: [string, string, string, string, string]; newlyUsed: Set<string> } {
  const all = getAllWords();

  // Find candidates that haven't been used yet in this match
  let available = all.filter(w => !alreadyUsed.has(w.toLowerCase()));

  // If we ran out of unused words, reset the used set and reshuffle the full pool
  let nextUsed = new Set(alreadyUsed);
  if (available.length < count) {
    available = [...all];
    nextUsed = new Set();
  }

  // Fisher-Yates random shuffle of available pool
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const chosen = shuffled.slice(0, count);
  chosen.forEach(w => nextUsed.add(w.toLowerCase()));

  // Ensure tuple of 5 items
  while (chosen.length < 5) {
    chosen.push(all[Math.floor(Math.random() * all.length)]);
  }

  return {
    words: [chosen[0], chosen[1], chosen[2], chosen[3], chosen[4]],
    newlyUsed: nextUsed,
  };
}
