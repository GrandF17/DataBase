import HLTV, {
  FullPlayer,
  FullTeam,
  FullTeamPlayer,
  Team,
  TeamRanking,
} from "hltv";
import { writeFile } from "fs/promises";
import { FullTeamStats } from "hltv/lib/endpoints/getTeamStats";

const SECOND: number = 1000;
const MINUTE: number = 60 * SECOND;
const HOUR: number = 60 * MINUTE;
const DAY: number = 24 * HOUR;
const WEEK: number = 7 * DAY;
const MONTH: number = 4 * WEEK + 4 * DAY;

export enum throwErr {
  true,
  false,
}

export enum Period {
  month_1,
  month_1_5,
  month_2_5,
  length,
}

type MapType = {
  [period in Period]: number;
};

export const period: MapType = {
  [Period.month_1]: MONTH,
  [Period.month_1_5]: MONTH + MONTH / 2,
  [Period.month_2_5]: 2 * MONTH + MONTH / 2,
  [Period.length]: 3,
};

export interface PlayerStatistics {
  name: string;
  rating: number;
  killsPerRound: number;
  headshots: number;
  mapsPlayed: number;
  deathsPerRound: number;
  roundsContributed: number;
}

function liesInBetween(
  point: number,
  leftBorder: number,
  rightBorder: number
): boolean {
  return point <= rightBorder && point >= leftBorder;
}

function gapWithinGap(innerGap: [number, number], outerGap: [number, number]) {
  return (
    liesInBetween(innerGap[0], ...outerGap) &&
    liesInBetween(innerGap[1], ...outerGap)
  );
}

export function convertToPlayerStats(
  players: (FullPlayer | undefined)[]
): PlayerStatistics[] {
  let stats: PlayerStatistics[] = [];
  for (let i = 0; i < players.length; i++) {
    const playerStats = players[i]?.statistics;
    if (playerStats != null) {
      stats.push({
        name: players[i]?.ign as string,
        rating: playerStats.rating ?? 0,
        killsPerRound: playerStats.killsPerRound ?? 0,
        headshots: playerStats.headshots ?? 0,
        mapsPlayed: playerStats.mapsPlayed ?? 0,
        deathsPerRound: playerStats.deathsPerRound ?? 0,
        roundsContributed: playerStats.roundsContributed ?? 0,
      });
    }
  }

  return stats;
}

export async function getPlayer(
  idOrName: number | string
): Promise<FullPlayer> {
  if (typeof idOrName == "number") {
    return await HLTV.getPlayer({ id: idOrName });
  } else {
    return await HLTV.getPlayerByName({ name: idOrName as string });
  }
}

export async function getTeam(idOrName: number | string): Promise<FullTeam> {
  if (typeof idOrName == "number") {
    return await HLTV.getTeam({ id: idOrName });
  } else {
    return await HLTV.getTeamByName({ name: idOrName });
  }
}

export async function getTeamPlayers(
  idOrName: number | string,
  filer: throwErr = throwErr.true
): Promise<FullTeamPlayer[]> {
  const team = await getTeam(idOrName);

  // filter from team coaches
  const players = team.players.filter((x: any) => x.type != "Coach");
  if (players.length == 0 && filer === throwErr.true)
    throw `no players for ${team.name}`;
  return players;
}

export async function getTopTeams(
  onlyTeam: boolean = true
): Promise<Team[] | TeamRanking[]> {
  const teams = await HLTV.getTeamRanking();
  if (onlyTeam) return teams.map((x) => x.team);
  return teams;
}

export async function getTeamPlayersStats(idOrName: number | string) {
  const names = (await getTeamPlayers(idOrName, throwErr.false)).map(
    (player) => player.name
  );
  const p: Promise<FullPlayer | undefined>[] = [];
  for (let i = 0; i < names.length; i++) {
    p.push(getPlayer(names[i]));
  }

  // instead of creating average player we exlude him from stats
  // filter all zero rating and undefined players
  let players = (await Promise.all(p))
    .filter((x) => typeof x != "undefined")
    .filter((x) => x?.statistics?.rating != 0);

  const playersStats = convertToPlayerStats(players);
  return playersStats;
}

export async function getEventsByPeriod(id: Period) {
  const gap: [number, number] = [Date.now() - period[id], Date.now()];
  const eventsIds = (await HLTV.getEvents())
    .filter(
      (x) =>
        gapWithinGap([x.dateStart, x.dateEnd], [...gap]) ||
        liesInBetween(x.dateStart, ...gap)
    )
    .map((x) => x.id);

  const result = await HLTV.getResults({ eventIds: [...eventsIds] });
  return result;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface Maps {
  de_mirage: number;
  de_nuke: number;
  de_dust2: number;
  de_train: number;
  de_overpass: number;
  de_inferno: number;
  de_vertigo: number;
  de_anubis: number;
}

export type TeamMapsStats = {
  id: number;
  maps: Maps;
};

export async function teamMapsStats(ids: number[]): Promise<TeamMapsStats[]> {
  const teamStats: TeamMapsStats[] = [];
  for (let i = 0; i < ids.length; i++) {
    try {
      const p = await HLTV.getTeamStats({ id: ids[i] });
      let maps: Maps = {
        de_mirage: p.mapStats.de_mirage.winRate,
        de_nuke: p.mapStats.de_nuke.winRate,
        de_dust2: p.mapStats.de_dust2.winRate,
        de_train: p.mapStats.de_train.winRate,
        de_overpass: p.mapStats.de_overpass.winRate,
        de_inferno: p.mapStats.de_inferno.winRate,
        de_vertigo: p.mapStats.de_vertigo.winRate,
        de_anubis: p.mapStats.de_anubis.winRate,
      };
      console.log(maps);
      teamStats.push({ id: ids[i], maps });
    } catch (e) {
      break;
    }
  }

  return teamStats;
}
