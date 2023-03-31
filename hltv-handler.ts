import HLTV, {
  FullPlayer,
  FullTeam,
  FullTeamPlayer,
  Team,
  TeamRanking,
} from "hltv";

const SECOND: number = 1000;
const MINUTE: number = 60 * SECOND;
const HOUR: number = 60 * MINUTE;
const DAY: number = 24 * HOUR;
const WEEK: number = 7 * DAY;
const MONTH: number = 4 * WEEK + 4 * DAY;

interface PlayerStatistics {
  name: string;
  rating: number;
  killsPerRound: number;
  headshots: number;
  mapsPlayed: number;
  deathsPerRound: number;
  roundsContributed: number;
}

enum throwErr {
  true,
  false,
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

export async function getPlayerStats(
  idOrName: number | string,
  filer: throwErr = throwErr.true
): Promise<PlayerStatistics | undefined> {
  const player = await getPlayer(idOrName);
  let stats =
    typeof player?.statistics == "undefined"
      ? undefined
      : {
          name: player.ign as string,
          rating: player?.statistics.rating,
          killsPerRound: player?.statistics.killsPerRound,
          headshots: player?.statistics.headshots,
          mapsPlayed: player?.statistics.mapsPlayed,
          deathsPerRound: player?.statistics.deathsPerRound,
          roundsContributed: player?.statistics.roundsContributed,
        };
  if (typeof stats == "undefined" && filer === throwErr.true)
    throw `no stats found for ${player.name}`;
  return stats;
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
  const players = team.players.filter((x) => x.type != "Coach");
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
  const p: Promise<PlayerStatistics | undefined>[] = [];
  for (let i = 0; i < names.length; i++) {
    p.push(getPlayerStats(names[i], throwErr.false));
  }

  // instead of creating average player we exlude him from stats
  // filter all zero rating and undefined players
  const playersStats = (await Promise.all(p))
    .filter((x) => typeof x != "undefined")
    .filter((x) => x?.rating != 0);
  return playersStats;
}

(async function main() {
  // console.log(await HLTV.getTeamRanking());
  // console.log(await HLTV.getTeamByName({ name: "G2" }));
  // console.log((await HLTV.getTeam({ id: 5995 })));
  // console.log(await HLTV.getTeamStats({ id: 5995 }));
  // console.log(await HLTV.getRecentThreads());
  // console.log(await HLTV.getResults({ eventIds: [1616] }));
  // console.log(await HLTV.getPlayer({ id: 2730 }));
  // console.log(await HLTV.getPlayerByName({ name: "chrisJ" }));
  // console.log(await HLTV.getPlayerByName({ name: "s1mple" }));
  // console.log(await HLTV.getTeamByName({ name: "BIG" }));

  // console.log(await getTopTeams());

  console.log(await getTeamPlayersStats("G2"));

  // console.log(await HLTV.getEvents());
  /*
  console.log(await HLTV.getEvents());
  const eventsIds = (await HLTV.getEvents())
    .filter((x) => x.dateEnd >= Date.now() - WEEK && x.dateStart <= Date.now())
    .map((x) => x.id);
  console.log("kek");
  console.log(eventsIds);
  const result = await HLTV.getResults({ eventIds: [...eventsIds] });

  console.log(result);
  console.log(Date.now());
  */
})();
