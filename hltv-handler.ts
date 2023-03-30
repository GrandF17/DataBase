import HLTV, { FullPlayer, FullTeam, FullTeamPlayer, Team } from "hltv";

interface PlayerStatistics {
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
  idOrName: string | number
): Promise<FullPlayer> {
  if (typeof idOrName == "number") {
    return await HLTV.getPlayer({ id: idOrName });
  } else {
    return await HLTV.getPlayerByName({ name: idOrName as string });
  }
}

export async function getPlayerStats(
  idOrName: string | number
): Promise<PlayerStatistics | undefined> {
  const player = await getPlayer(idOrName);
  let stats = player?.statistics;
  // if (typeof stats == "undefined") throw `no stats found for ${player.name}`;
  return stats;
}

export async function getTeam(idOrName: string | number): Promise<FullTeam> {
  if (typeof idOrName == "number") {
    return await HLTV.getTeam({ id: idOrName });
  } else {
    return await HLTV.getTeamByName({ name: idOrName });
  }
}

export async function getTeamPlayers(
  idOrName: string | number,
  filer: throwErr = throwErr.true
): Promise<FullTeamPlayer[]> {
  const team = await getTeam(idOrName);
  const players = team.players;
  if (players.length == 0 && filer === throwErr.true)
    throw `no players for ${team.name}`;
  return players;
}

export async function getTopTeams(): Promise<Team[]> {
  return (await HLTV.getTeamRanking()).map((x) => x.team);
}

export async function getTeamPlayersStats(idOrName: string | number) {
  const names = (await getTeamPlayers(idOrName, throwErr.false)).map(
    (player) => player.name
  );
  const p: Promise<PlayerStatistics | undefined>[] = [];
  for (let i = 0; i < names.length; i++) {
    p.push(getPlayerStats(names[i]));
  }

  // instead of creating average player we exlude him from stats
  const playersStats = (await Promise.all(p)).filter(
    (x) => typeof x != "undefined"
  );
  return playersStats;
}

(async function main() {
  // console.log(await HLTV.getTeamRanking());
  //   console.log(await HLTV.getTeamByName({ name: "G2" }));
  //   console.log((await HLTV.getTeam({ id: 5995 })));
  //   console.log(await HLTV.getTeamStats({ id: 5995 }));
  //   console.log(await HLTV.getRecentThreads());
  // console.log(await HLTV.getResults({ eventIds: [1616] }));
  // console.log(await HLTV.getPlayer({ id: 2730 }));
  // console.log(await HLTV.getPlayerByName({ name: "chrisJ" }));
  // console.log(await HLTV.getPlayerByName({ name: "simpl" }));
  // console.log(await HLTV.getTeamByName({ name: "BIG" }));

  // console.log(await getTopTeams());

  // console.log(await getTeamPlayers("BIG"));

  console.log(await getTeamPlayersStats("G2"));
})();
