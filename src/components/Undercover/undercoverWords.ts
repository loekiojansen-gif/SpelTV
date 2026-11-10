export interface UndercoverWordPair {
  id: string;
  category: string;
  wordA: string;
  wordB: string;
}

export const UNDERCOVER_WORD_PAIRS: UndercoverWordPair[] = [
  // 1-10: Ruimte & Kosmos
  { id: 'w-001', category: 'Ruimte', wordA: 'Pluto', wordB: 'Saturnus' },
  { id: 'w-002', category: 'Ruimte', wordA: 'Zon', wordB: 'Maan' },
  { id: 'w-003', category: 'Ruimte', wordA: 'Komeet', wordB: 'Asteroïde' },
  { id: 'w-004', category: 'Ruimte', wordA: 'Raket', wordB: 'Ruimtestation' },
  { id: 'w-005', category: 'Ruimte', wordA: 'Ster', wordB: 'Planeet' },
  { id: 'w-006', category: 'Ruimte', wordA: 'Melkweg', wordB: 'Zonnestelsel' },
  { id: 'w-007', category: 'Ruimte', wordA: 'Telescoop', wordB: 'Satelliet' },
  { id: 'w-008', category: 'Ruimte', wordA: 'Mars', wordB: 'Jupiter' },
  { id: 'w-009', category: 'Ruimte', wordA: 'Zwart Gat', wordB: 'Supernova' },
  { id: 'w-010', category: 'Ruimte', wordA: 'Kosmonaut', wordB: 'Astronaut' },

  // 11-25: Dieren
  { id: 'w-011', category: 'Dieren', wordA: 'Hond', wordB: 'Kat' },
  { id: 'w-012', category: 'Dieren', wordA: 'Leeuw', wordB: 'Tijger' },
  { id: 'w-013', category: 'Dieren', wordA: 'Paard', wordB: 'Ezel' },
  { id: 'w-014', category: 'Dieren', wordA: 'Wolf', wordB: 'Vos' },
  { id: 'w-015', category: 'Dieren', wordA: 'Dolfijn', wordB: 'Walvis' },
  { id: 'w-016', category: 'Dieren', wordA: 'Kikker', wordB: 'Pad' },
  { id: 'w-017', category: 'Dieren', wordA: 'Konijn', wordB: 'Haas' },
  { id: 'w-018', category: 'Dieren', wordA: 'Bij', wordB: 'Wesp' },
  { id: 'w-019', category: 'Dieren', wordA: 'Kip', wordB: 'Eend' },
  { id: 'w-020', category: 'Dieren', wordA: 'Vlinder', wordB: 'Libel' },
  { id: 'w-021', category: 'Dieren', wordA: 'Pinguïn', wordB: 'Papegaai' },
  { id: 'w-022', category: 'Dieren', wordA: 'Slang', wordB: 'Hagedis' },
  { id: 'w-023', category: 'Dieren', wordA: 'Muis', wordB: 'Rat' },
  { id: 'w-024', category: 'Dieren', wordA: 'Bruine Beer', wordB: 'Panda' },
  { id: 'w-025', category: 'Dieren', wordA: 'Krokodil', wordB: 'Alligator' },

  // 26-45: Eten & Drinken
  { id: 'w-026', category: 'Eten & Drinken', wordA: 'Pizza', wordB: 'Pannenkoek' },
  { id: 'w-027', category: 'Eten & Drinken', wordA: 'Bier', wordB: 'Wijn' },
  { id: 'w-028', category: 'Eten & Drinken', wordA: 'Koffie', wordB: 'Thee' },
  { id: 'w-029', category: 'Eten & Drinken', wordA: 'Friet', wordB: 'Chips' },
  { id: 'w-030', category: 'Eten & Drinken', wordA: 'Appel', wordB: 'Peer' },
  { id: 'w-031', category: 'Eten & Drinken', wordA: 'Banaan', wordB: 'Komkommer' },
  { id: 'w-032', category: 'Eten & Drinken', wordA: 'Chocola', wordB: 'Snoep' },
  { id: 'w-033', category: 'Eten & Drinken', wordA: 'Hamburger', wordB: 'Tosti' },
  { id: 'w-034', category: 'Eten & Drinken', wordA: 'Spaghetti', wordB: 'Macaroni' },
  { id: 'w-035', category: 'Eten & Drinken', wordA: 'Kaas', wordB: 'Boter' },
  { id: 'w-036', category: 'Eten & Drinken', wordA: 'Mayonaise', wordB: 'Ketchup' },
  { id: 'w-037', category: 'Eten & Drinken', wordA: 'Melk', wordB: 'Karnemelk' },
  { id: 'w-038', category: 'Eten & Drinken', wordA: 'Wortel', wordB: 'Radijs' },
  { id: 'w-039', category: 'Eten & Drinken', wordA: 'Soep', wordB: 'Saus' },
  { id: 'w-040', category: 'Eten & Drinken', wordA: 'IJsje', wordB: 'Milkshake' },
  { id: 'w-041', category: 'Eten & Drinken', wordA: 'Taart', wordB: 'Cake' },
  { id: 'w-042', category: 'Eten & Drinken', wordA: 'Donut', wordB: 'Croissant' },
  { id: 'w-043', category: 'Eten & Drinken', wordA: 'Ui', wordB: 'Knoflook' },
  { id: 'w-044', category: 'Eten & Drinken', wordA: 'Sinaasappel', wordB: 'Mandarijn' },
  { id: 'w-045', category: 'Eten & Drinken', wordA: 'Brood', wordB: 'Beschuit' },

  // 46-60: Voorwerpen & Technologie
  { id: 'w-046', category: 'Technologie', wordA: 'Laptop', wordB: 'Tablet' },
  { id: 'w-047', category: 'Technologie', wordA: 'Smartphone', wordB: 'Smartwatch' },
  { id: 'w-048', category: 'Voorwerpen', wordA: 'Fiets', wordB: 'Scooter' },
  { id: 'w-049', category: 'Voorwerpen', wordA: 'Auto', wordB: 'Bus' },
  { id: 'w-050', category: 'Voorwerpen', wordA: 'Trein', wordB: 'Metro' },
  { id: 'w-051', category: 'Voorwerpen', wordA: 'Vliegtuig', wordB: 'Helikopter' },
  { id: 'w-052', category: 'Voorwerpen', wordA: 'Boot', wordB: 'Schip' },
  { id: 'w-053', category: 'Muziek', wordA: 'Gitaar', wordB: 'Viool' },
  { id: 'w-054', category: 'Muziek', wordA: 'Piano', wordB: 'Keyboard' },
  { id: 'w-055', category: 'Muziek', wordA: 'Trompet', wordB: 'Saxofoon' },
  { id: 'w-056', category: 'Technologie', wordA: 'Microfoon', wordB: 'Luidspreker' },
  { id: 'w-057', category: 'Technologie', wordA: 'Koptelefoon', wordB: 'Oordopjes' },
  { id: 'w-058', category: 'Voorwerpen', wordA: 'Horloge', wordB: 'Klok' },
  { id: 'w-059', category: 'Voorwerpen', wordA: 'Bril', wordB: 'Zonnebril' },
  { id: 'w-060', category: 'Voorwerpen', wordA: 'Sleutel', wordB: 'Pasje' },

  // 61-75: Huis, Wonen & Kleding
  { id: 'w-061', category: 'Voorwerpen', wordA: 'Paraplu', wordB: 'Regenjas' },
  { id: 'w-062', category: 'Voorwerpen', wordA: 'Rugzak', wordB: 'Handtas' },
  { id: 'w-063', category: 'Voorwerpen', wordA: 'Pen', wordB: 'Potlood' },
  { id: 'w-064', category: 'Voorwerpen', wordA: 'Schaar', wordB: 'Mes' },
  { id: 'w-065', category: 'Huis', wordA: 'Kussen', wordB: 'Deken' },
  { id: 'w-066', category: 'Huis', wordA: 'Bank', wordB: 'Fauteuil' },
  { id: 'w-067', category: 'Huis', wordA: 'Tafel', wordB: 'Bureau' },
  { id: 'w-068', category: 'Huis', wordA: 'Douche', wordB: 'Bad' },
  { id: 'w-069', category: 'Huis', wordA: 'Tuin', wordB: 'Balkon' },
  { id: 'w-070', category: 'Huis', wordA: 'Keuken', wordB: 'Bijkeuken' },
  { id: 'w-071', category: 'Huis', wordA: 'Kaars', wordB: 'Lamp' },
  { id: 'w-072', category: 'Huis', wordA: 'Spiegel', wordB: 'Schilderij' },
  { id: 'w-073', category: 'Kleding', wordA: 'Trui', wordB: 'Vest' },
  { id: 'w-074', category: 'Kleding', wordA: 'Muts', wordB: 'Pet' },
  { id: 'w-075', category: 'Kleding', wordA: 'Schoenen', wordB: 'Laarzen' },

  // 76-90: Beroepen & Personages
  { id: 'w-076', category: 'Beroepen', wordA: 'Dokter', wordB: 'Tandarts' },
  { id: 'w-077', category: 'Beroepen', wordA: 'Politieagent', wordB: 'Brandweerman' },
  { id: 'w-078', category: 'Personages', wordA: 'Koning', wordB: 'Keizer' },
  { id: 'w-079', category: 'Personages', wordA: 'Piraat', wordB: 'Ridder' },
  { id: 'w-080', category: 'Personages', wordA: 'Tovenaar', wordB: 'Heks' },
  { id: 'w-081', category: 'Entertainment', wordA: 'Clown', wordB: 'Goochelaar' },
  { id: 'w-082', category: 'Beroepen', wordA: 'Rechter', wordB: 'Advocaat' },
  { id: 'w-083', category: 'Beroepen', wordA: 'Kapper', wordB: 'Stylist' },
  { id: 'w-084', category: 'Beroepen', wordA: 'Leraar', wordB: 'Professor' },
  { id: 'w-085', category: 'Personages', wordA: 'Spook', wordB: 'Zombie' },
  { id: 'w-086', category: 'Personages', wordA: 'Vampier', wordB: 'Weerwolf' },
  { id: 'w-087', category: 'Personages', wordA: 'Engel', wordB: 'Fee' },
  { id: 'w-088', category: 'Beroepen', wordA: 'Kok', wordB: 'Bakker' },
  { id: 'w-089', category: 'Beroepen', wordA: 'Boer', wordB: 'Tuinier' },
  { id: 'w-090', category: 'Personages', wordA: 'Superheld', wordB: 'Geheim Agent' },

  // 91-105: Plaatsen, Natuur & Entertainment
  { id: 'w-091', category: 'Plaatsen', wordA: 'Strand', wordB: 'Zwembad' },
  { id: 'w-092', category: 'Natuur', wordA: 'Zee', wordB: 'Oceaan' },
  { id: 'w-093', category: 'Natuur', wordA: 'Bos', wordB: 'Jungle' },
  { id: 'w-094', category: 'Natuur', wordA: 'Berg', wordB: 'Vulkaan' },
  { id: 'w-095', category: 'Natuur', wordA: 'Rivier', wordB: 'Kanaal' },
  { id: 'w-096', category: 'Steden', wordA: 'Amsterdam', wordB: 'Rotterdam' },
  { id: 'w-097', category: 'Steden', wordA: 'Parijs', wordB: 'Londen' },
  { id: 'w-098', category: 'Natuur', wordA: 'Woestijn', wordB: 'Savanne' },
  { id: 'w-099', category: 'Aardrijkskunde', wordA: 'Eiland', wordB: 'Schiereiland' },
  { id: 'w-100', category: 'Plaatsen', wordA: 'Grot', wordB: 'Tunnel' },
  { id: 'w-101', category: 'Sport', wordA: 'Voetbal', wordB: 'Hockey' },
  { id: 'w-102', category: 'Sport', wordA: 'Tennis', wordB: 'Badminton' },
  { id: 'w-103', category: 'Spellen', wordA: 'Schaken', wordB: 'Dammen' },
  { id: 'w-104', category: 'Sport', wordA: 'Skiën', wordB: 'Snowboarden' },
  { id: 'w-105', category: 'Entertainment', wordA: 'Bioscoop', wordB: 'Theater' },

  // 106-110: Bonus Duos
  { id: 'w-106', category: 'Media', wordA: 'Film', wordB: 'Serie' },
  { id: 'w-107', category: 'Media', wordA: 'Boek', wordB: 'Stripverhaal' },
  { id: 'w-108', category: 'Materialen', wordA: 'Goud', wordB: 'Zilver' },
  { id: 'w-109', category: 'Materialen', wordA: 'Diamant', wordB: 'Robijn' },
  { id: 'w-110', category: 'Weer', wordA: 'Sneeuw', wordB: 'Hagel' },

  // 111-135: Eten, Sauzen & Dranken
  { id: 'w-111', category: 'Eten & Drinken', wordA: 'Mayonaise', wordB: 'Mosterd' },
  { id: 'w-112', category: 'Eten & Drinken', wordA: 'Ketchup', wordB: 'Curry' },
  { id: 'w-113', category: 'Eten & Drinken', wordA: 'Chocolademelk', wordB: 'Fristi' },
  { id: 'w-114', category: 'Eten & Drinken', wordA: 'Pindakaas', wordB: 'Nutella' },
  { id: 'w-115', category: 'Eten & Drinken', wordA: 'Watermeloen', wordB: 'Meloen' },
  { id: 'w-116', category: 'Eten & Drinken', wordA: 'Aardbei', wordB: 'Framboos' },
  { id: 'w-117', category: 'Eten & Drinken', wordA: 'Suiker', wordB: 'Zout' },
  { id: 'w-118', category: 'Eten & Drinken', wordA: 'Peper', wordB: 'Paprikapoeder' },
  { id: 'w-119', category: 'Eten & Drinken', wordA: 'Pepermunt', wordB: 'Kauwgom' },
  { id: 'w-120', category: 'Eten & Drinken', wordA: 'Kroket', wordB: 'Frikandel' },
  { id: 'w-121', category: 'Eten & Drinken', wordA: 'Bitterbal', wordB: 'Kaassoufflé' },
  { id: 'w-122', category: 'Eten & Drinken', wordA: 'Stroopwafel', wordB: 'Eierkoek' },
  { id: 'w-123', category: 'Eten & Drinken', wordA: 'Wafel', wordB: 'Poffertjes' },
  { id: 'w-124', category: 'Eten & Drinken', wordA: 'Soep', wordB: 'Bouillon' },
  { id: 'w-125', category: 'Eten & Drinken', wordA: 'Cider', wordB: 'Bier' },
  { id: 'w-126', category: 'Eten & Drinken', wordA: 'Champagne', wordB: 'Prosecco' },
  { id: 'w-127', category: 'Eten & Drinken', wordA: 'Cola', wordB: 'Fanta' },
  { id: 'w-128', category: 'Eten & Drinken', wordA: 'Spa Rood', wordB: 'Spa Blauw' },
  { id: 'w-129', category: 'Eten & Drinken', wordA: 'Thee', wordB: 'IJsthee' },
  { id: 'w-130', category: 'Eten & Drinken', wordA: 'Avocado', wordB: 'Guacamole' },
  { id: 'w-131', category: 'Eten & Drinken', wordA: 'Pinda', wordB: 'Cashewnoot' },
  { id: 'w-132', category: 'Eten & Drinken', wordA: 'Walnoot', wordB: 'Hazelnoot' },
  { id: 'w-133', category: 'Eten & Drinken', wordA: 'Rijst', wordB: 'Couscous' },
  { id: 'w-134', category: 'Eten & Drinken', wordA: 'Nasi', wordB: 'Bami' },
  { id: 'w-135', category: 'Eten & Drinken', wordA: 'Spek', wordB: 'Ham' },

  // 136-155: Dieren & Fauna
  { id: 'w-136', category: 'Dieren', wordA: 'Goudvis', wordB: 'Koikarper' },
  { id: 'w-137', category: 'Dieren', wordA: 'Haai', wordB: 'Orka' },
  { id: 'w-138', category: 'Dieren', wordA: 'Schildpad', wordB: 'Kameleon' },
  { id: 'w-139', category: 'Dieren', wordA: 'Hamster', wordB: 'Cavia' },
  { id: 'w-140', category: 'Dieren', wordA: 'Eekhoorn', wordB: 'Egel' },
  { id: 'w-141', category: 'Dieren', wordA: 'Duif', wordB: 'Meeuw' },
  { id: 'w-142', category: 'Dieren', wordA: 'Zwaan', wordB: 'Gans' },
  { id: 'w-143', category: 'Dieren', wordA: 'Uil', wordB: 'Valk' },
  { id: 'w-144', category: 'Dieren', wordA: 'Panter', wordB: 'Luipaard' },
  { id: 'w-145', category: 'Dieren', wordA: 'Cheetah', wordB: 'Jaguar' },
  { id: 'w-146', category: 'Dieren', wordA: 'Zebra', wordB: 'Giraffe' },
  { id: 'w-147', category: 'Dieren', wordA: 'Neushoorn', wordB: 'Nijlpaard' },
  { id: 'w-148', category: 'Dieren', wordA: 'Aap', wordB: 'Gorilla' },
  { id: 'w-149', category: 'Dieren', wordA: 'Kangoeroe', wordB: 'Koala' },
  { id: 'w-150', category: 'Dieren', wordA: 'Kreeft', wordB: 'Krab' },
  { id: 'w-151', category: 'Dieren', wordA: 'Octopus', wordB: 'Inktvis' },
  { id: 'w-152', category: 'Dieren', wordA: 'Mier', wordB: 'Termiet' },
  { id: 'w-153', category: 'Dieren', wordA: 'Vlieg', wordB: 'Mug' },
  { id: 'w-154', category: 'Dieren', wordA: 'Spin', wordB: 'Schorpioen' },
  { id: 'w-155', category: 'Dieren', wordA: 'Kameel', wordB: 'Dromedaris' },

  // 156-170: Technologie, Media & Muziek
  { id: 'w-156', category: 'Media', wordA: 'Bioscoop', wordB: 'Netflix' },
  { id: 'w-157', category: 'Media', wordA: 'Spotify', wordB: 'YouTube' },
  { id: 'w-158', category: 'Gaming', wordA: 'PlayStation', wordB: 'Xbox' },
  { id: 'w-159', category: 'Gaming', wordA: 'Nintendo Switch', wordB: 'Game Boy' },
  { id: 'w-160', category: 'Technologie', wordA: 'Monitor', wordB: 'Televisie' },
  { id: 'w-161', category: 'Technologie', wordA: 'Muis', wordB: 'Trackpad' },
  { id: 'w-162', category: 'Technologie', wordA: 'USB-stick', wordB: 'Harde schijf' },
  { id: 'w-163', category: 'Technologie', wordA: 'Wi-Fi', wordB: 'Bluetooth' },
  { id: 'w-164', category: 'Technologie', wordA: 'Batterij', wordB: 'Oplader' },
  { id: 'w-165', category: 'Muziek', wordA: 'Gitaar', wordB: 'Basgitaar' },
  { id: 'w-166', category: 'Muziek', wordA: 'Viool', wordB: 'Cello' },
  { id: 'w-167', category: 'Muziek', wordA: 'Trompet', wordB: 'Trombone' },
  { id: 'w-168', category: 'Muziek', wordA: 'Drums', wordB: 'Percussie' },
  { id: 'w-169', category: 'Muziek', wordA: 'Zanger', wordB: 'Rapper' },
  { id: 'w-170', category: 'Media', wordA: 'Krant', wordB: 'Nieuwswebsite' },

  // 171-185: Huishouden, Badkamer & Verzorging
  { id: 'w-171', category: 'Huis', wordA: 'Handdoek', wordB: 'Theedoek' },
  { id: 'w-172', category: 'Huis', wordA: 'Zeep', wordB: 'Shampoo' },
  { id: 'w-173', category: 'Huis', wordA: 'Tandenborstel', wordB: 'Flosdraad' },
  { id: 'w-174', category: 'Huis', wordA: 'Kam', wordB: 'Haarborstel' },
  { id: 'w-175', category: 'Huis', wordA: 'Föhn', wordB: 'Stijltang' },
  { id: 'w-176', category: 'Cosmetica', wordA: 'Lippenstift', wordB: 'Lipgloss' },
  { id: 'w-177', category: 'Cosmetica', wordA: 'Parfum', wordB: 'Deodorant' },
  { id: 'w-178', category: 'Huis', wordA: 'Bed', wordB: 'Slaapbank' },
  { id: 'w-179', category: 'Huis', wordA: 'Dekbed', wordB: 'Slaapzak' },
  { id: 'w-180', category: 'Huis', wordA: 'Gordijn', wordB: 'Rolgordijn' },
  { id: 'w-181', category: 'Huis', wordA: 'Trap', wordB: 'Lift' },
  { id: 'w-182', category: 'Huis', wordA: 'Deur', wordB: 'Poort' },
  { id: 'w-183', category: 'Huis', wordA: 'Zolder', wordB: 'Kelder' },
  { id: 'w-184', category: 'Huis', wordA: 'Garage', wordB: 'Schuur' },
  { id: 'w-185', category: 'Ontspanning', wordA: 'Sauna', wordB: 'Stoombad' },

  // 186-195: Kleding & Mode
  { id: 'w-186', category: 'Kleding', wordA: 'Trui', wordB: 'Hoodie' },
  { id: 'w-187', category: 'Kleding', wordA: 'Jas', wordB: 'Mantel' },
  { id: 'w-188', category: 'Kleding', wordA: 'Spijkerbroek', wordB: 'Joggingbroek' },
  { id: 'w-189', category: 'Kleding', wordA: 'Sokken', wordB: 'Panty' },
  { id: 'w-190', category: 'Kleding', wordA: 'Handschoenen', wordB: 'Wanten' },
  { id: 'w-191', category: 'Kleding', wordA: 'Sjaal', wordB: 'Col' },
  { id: 'w-192', category: 'Accessoires', wordA: 'Portemonnee', wordB: 'Pasjeshouder' },
  { id: 'w-193', category: 'Accessoires', wordA: 'Zonnebril', wordB: 'Skibril' },
  { id: 'w-194', category: 'Kleding', wordA: 'Zwembroek', wordB: 'Bikini' },
  { id: 'w-195', category: 'Kleding', wordA: 'Slipper', wordB: 'Sandaal' },

  // 196-205: Sport & Spel
  { id: 'w-196', category: 'Sport', wordA: 'Basketbal', wordB: 'Handbal' },
  { id: 'w-197', category: 'Sport', wordA: 'Honkbal', wordB: 'Softbal' },
  { id: 'w-198', category: 'Sport', wordA: 'Tafeltennis', wordB: 'Tennis' },
  { id: 'w-199', category: 'Sport', wordA: 'Biljart', wordB: 'Pool' },
  { id: 'w-200', category: 'Sport', wordA: 'Schaatsen', wordB: 'Rolschaatsen' },
  { id: 'w-201', category: 'Sport', wordA: 'Hardlopen', wordB: 'Joggen' },
  { id: 'w-202', category: 'Sport', wordA: 'Wandelen', wordB: 'Hiken' },
  { id: 'w-203', category: 'Sport', wordA: 'Zeilen', wordB: 'Surfen' },
  { id: 'w-204', category: 'Sport', wordA: 'Roeien', wordB: 'Kanoën' },
  { id: 'w-205', category: 'Vervoer', wordA: 'Skateboard', wordB: 'Step' },

  // 206-215: Plaatsen, Uitjes & Seizoenen
  { id: 'w-206', category: 'Vakantie', wordA: 'Camping', wordB: 'Hotel' },
  { id: 'w-207', category: 'Vakantie', wordA: 'Tent', wordB: 'Caravan' },
  { id: 'w-208', category: 'Uitjes', wordA: 'Pretpark', wordB: 'Dierentuin' },
  { id: 'w-209', category: 'Uitjes', wordA: 'Kermis', wordB: 'Festival' },
  { id: 'w-210', category: 'Uitjes', wordA: 'Markt', wordB: 'Supermarkt' },
  { id: 'w-211', category: 'Winkels', wordA: 'Bakker', wordB: 'Slager' },
  { id: 'w-212', category: 'Uitgaan', wordA: 'Café', wordB: 'Bar' },
  { id: 'w-213', category: 'Gebouwen', wordA: 'Kasteel', wordB: 'Paleis' },
  { id: 'w-214', category: 'Seizoenen', wordA: 'Zomer', wordB: 'Lente' },
  { id: 'w-215', category: 'Seizoenen', wordA: 'Winter', wordB: 'Herfst' },
];

const STORAGE_KEY_PLAYED_WORDS = 'undercover_played_word_pairs';

export function getPlayedWordPairIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYED_WORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function savePlayedWordPairIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYED_WORDS, JSON.stringify(ids));
  } catch {}
}

export function resetPlayedWordPairs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PLAYED_WORDS);
  } catch {}
}

export interface SelectedWordsResult {
  pair: UndercoverWordPair;
  civilianWord: string;
  undercoverWord: string;
  isRecycled: boolean;
  remainingCount: number;
  totalCount: number;
}

/**
 * Selects a word pair that hasn't been played yet.
 * If all pairs have been played, it automatically resets the played history
 * so the game can continue seamlessly without repeating within the same cycle!
 */
export function pickNextWordPair(): SelectedWordsResult {
  const played = getPlayedWordPairIds();
  const available = UNDERCOVER_WORD_PAIRS.filter(p => !played.includes(p.id));

  let selected: UndercoverWordPair;
  let isRecycled = false;

  if (available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected = available[randomIndex];
    const updated = [...played, selected.id];
    savePlayedWordPairIds(updated);
  } else {
    // All 110 pairs have been played! Reset cycle and pick a random one
    isRecycled = true;
    const randomIndex = Math.floor(Math.random() * UNDERCOVER_WORD_PAIRS.length);
    selected = UNDERCOVER_WORD_PAIRS[randomIndex];
    savePlayedWordPairIds([selected.id]);
  }

  // 50% chance to flip which word is given to Civilians vs Undercovers
  const flip = Math.random() < 0.5;
  const civilianWord = flip ? selected.wordA : selected.wordB;
  const undercoverWord = flip ? selected.wordB : selected.wordA;

  const currentPlayedCount = getPlayedWordPairIds().length;

  return {
    pair: selected,
    civilianWord,
    undercoverWord,
    isRecycled,
    remainingCount: Math.max(0, UNDERCOVER_WORD_PAIRS.length - currentPlayedCount),
    totalCount: UNDERCOVER_WORD_PAIRS.length,
  };
}
