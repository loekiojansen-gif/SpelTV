import { PubItem, DrinkItem, ChallengeItem, Team, Round } from '../types';

export interface ScorecardInput {
  title?: string;
  finishedAt?: number;
  holesCount?: number;
  teams: Team[];
  rounds: Round[];
  pubs: PubItem[];
  drinks: DrinkItem[];
  challenges: ChallengeItem[];
}

/**
 * Kleine scorekaart met een mooi, compact overzicht.
 * Bevat de datum, winnaar, ranglijst en het aantal slokken per team per hole.
 */
export function generateCompactScorecard(data: ScorecardInput): string {
  const { finishedAt, teams, rounds, pubs, drinks } = data;
  const pubMap = new Map(pubs.map((p) => [p.id, p]));
  const drinkMap = new Map(drinks.map((d) => [d.id, d]));

  const dateStr = finishedAt
    ? new Date(finishedAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  // Calculate team total scores and sort ascending
  const standings = teams
    .map((team) => {
      let total = 0;
      rounds.forEach((r) => {
        total += r.scores[team.id] ?? 0;
      });
      return {
        team,
        total,
        avg: rounds.length > 0 ? (total / rounds.length).toFixed(1) : '0.0',
      };
    })
    .sort((a, b) => a.total - b.total);

  let text = `⛳ PUB GOLF SCOREKAART (OVERZICHT) ⛳\n`;
  text += `📅 ${dateStr} · ${rounds.length} ${rounds.length === 1 ? 'hole' : 'holes'} gespeeld\n`;
  if (standings.length > 0) {
    text += `🏆 Winnaar: ${standings[0].team.playerNames.join(' & ')} (${standings[0].total} slokken)\n\n`;
  }

  text += `🏆 EINDSTAND:\n`;
  standings.forEach((s, idx) => {
    const medal = idx === 0 ? '🥇 1e' : idx === 1 ? '🥈 2e' : idx === 2 ? '🥉 3e' : `${idx + 1}e`;
    text += `${medal}: ${s.team.playerNames.join(' & ')} - ${s.total} slokken (gem. ${s.avg}/hole)\n`;
  });

  if (rounds.length > 0) {
    text += `\n🍺 GESPEELDE HOLES:\n`;
    rounds.forEach((r) => {
      const pub = pubMap.get(r.pubId)?.name || 'Café';
      const drink = drinkMap.get(r.drinkId)?.name || 'Drankje';
      text += `Hole ${r.roundNumber}: ${pub} (${drink})\n`;
    });
  }

  text += `\nBijgehouden met Pub Golf Pro 🏌️`;
  return text;
}

/**
 * Uitgebreide scorekaart met alle data.
 * Bevat datum, statistieken, per hole café, drankje, minigame + beschrijving,
 * exacte slokken per team per hole én een overzichtelijke matrix.
 */
export function generateDetailedScorecard(data: ScorecardInput): string {
  const { finishedAt, teams, rounds, pubs, drinks, challenges } = data;
  const pubMap = new Map(pubs.map((p) => [p.id, p]));
  const drinkMap = new Map(drinks.map((d) => [d.id, d]));
  const challengeMap = new Map(challenges.map((c) => [c.id, c]));

  const dateStr = finishedAt
    ? new Date(finishedAt).toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('nl-NL');

  const totalPlayers = teams.reduce((acc, t) => acc + t.playerNames.length, 0);

  const standings = teams
    .map((team) => {
      let total = 0;
      rounds.forEach((r) => {
        total += r.scores[team.id] ?? 0;
      });
      return {
        team,
        total,
        avg: rounds.length > 0 ? (total / rounds.length).toFixed(1) : '0.0',
      };
    })
    .sort((a, b) => a.total - b.total);

  let text = `⛳ PUB GOLF PRO - UITGEBREIDE SCOREKAART (ALLE DATA) ⛳\n`;
  text += `══════════════════════════════════════════════\n`;
  text += `📅 Datum & Tijd: ${dateStr}\n`;
  text += `🎯 Aantal gespeelde holes: ${rounds.length}\n`;
  text += `👥 Deelnemers: ${teams.length} teams (${totalPlayers} spelers)\n`;
  if (standings.length > 0) {
    text += `🏆 Kampioen: ${standings[0].team.playerNames.join(' & ')} (${standings[0].total} slokken)\n`;
  }
  text += `══════════════════════════════════════════════\n\n`;

  text += `🏆 DEFINITIEVE EINDSTAND:\n`;
  standings.forEach((s, idx) => {
    const medal = idx === 0 ? '🥇 1e' : idx === 1 ? '🥈 2e' : idx === 2 ? '🥉 3e' : `   ${idx + 1}e`;
    text += `${medal} Plaats: ${s.team.playerNames.join(' & ')}\n`;
    text += `   • Totaal: ${s.total} slokken\n`;
    text += `   • Gemiddelde: ${s.avg} slokken per hole\n`;
  });

  if (rounds.length > 0) {
    text += `\n══════════════════════════════════════════════\n`;
    text += `🍺 VOLLEDIGE DETAILS PER HOLE\n`;
    text += `══════════════════════════════════════════════\n`;

    rounds.forEach((r) => {
      const pub = pubMap.get(r.pubId);
      const drink = drinkMap.get(r.drinkId);
      const challenge = challengeMap.get(r.challengeId);

      text += `\n⛳ HOLE ${r.roundNumber} van de ${rounds.length}\n`;
      text += `📍 Café: ${pub?.name || 'Onbekend'}${pub?.location ? ` (${pub.location})` : ''}\n`;
      text += `🍺 Drankje: ${drink?.name || 'Drankje'}${drink?.category ? ` [${drink.category}]` : ''}\n`;
      if (challenge) {
        text += `🎮 Minigame: ${challenge.title}\n`;
        if (challenge.description) {
          text += `   Uitleg: "${challenge.description}"\n`;
        }
      }
      text += `📊 Slokken per team op deze hole:\n`;
      teams.forEach((t) => {
        const sc = r.scores[t.id] ?? 0;
        text += `   • ${t.playerNames.join(' & ')}: ${sc} ${sc === 1 ? 'slok' : 'slokken'}\n`;
      });
    });

    text += `\n══════════════════════════════════════════════\n`;
    text += `📊 SLOKKEN MATRIX (PER TEAM PER HOLE)\n`;
    text += `══════════════════════════════════════════════\n`;

    // Matrix lines
    rounds.forEach((r) => {
      const scores = teams.map((t) => `${t.playerNames.join('&')}: ${r.scores[t.id] ?? 0} sl`).join(' | ');
      text += `Hole ${r.roundNumber}: ${scores}\n`;
    });
    text += `----------------------------------------------\n`;
    const totals = teams.map((t) => {
      const tot = rounds.reduce((sum, r) => sum + (r.scores[t.id] ?? 0), 0);
      return `${t.playerNames.join('&')}: ${tot} sl`;
    }).join(' | ');
    text += `TOTAAL: ${totals}\n`;
  }

  text += `\nBijgehouden met Pub Golf Pro 🏌️`;
  return text;
}
