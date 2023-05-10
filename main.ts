import {
  Period,
  getEventsByPeriod,
  getTeamPlayersStats,
  getTopTeams,
  teamMapsStats,
} from "./hltv-handler";
import { DB } from "./db";
import { FullMatchResult, TeamRanking } from "hltv";

const db = new DB("stats.xlsx");
const dbMap = new DB("maps.xlsx");

export interface Fraction {
  numerator: number;
  denominator: number;
}

interface teamInfo {
  teamId: number;
  name: string;
  ranking: number;
  avg2_0: number; // (2-0)
  ma1: number;
  ma1_5: number;
  ma2_5: number;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setMapsInfo() {
  const teams = (await getTopTeams(false)) as TeamRanking[];
  const teamIds = teams
    .map((x: TeamRanking) => x.team.id)
    .filter((x: number | undefined) => x != undefined) as number[];

  console.log(teamIds);
  const winrate = await teamMapsStats(teamIds);

  console.log(winrate);

  interface TeamMapsStats {
    teamId: number;
    name: string;
    de_mirage: number;
    de_nuke: number;
    de_dust2: number;
    de_train: number;
    de_overpass: number;
    de_inferno: number;
    de_vertigo: number;
    de_anubis: number;
  }

  for (let i = 0; i < winrate.length; i++) {
    dbMap.addRaw<TeamMapsStats>("Teams", {
      teamId: teamIds[i],
      name: teams[i].team.name,
      de_mirage: winrate[i].maps.de_mirage,
      de_nuke: winrate[i].maps.de_nuke,
      de_dust2: winrate[i].maps.de_dust2,
      de_train: winrate[i].maps.de_train,
      de_overpass: winrate[i].maps.de_overpass,
      de_inferno: winrate[i].maps.de_inferno,
      de_vertigo: winrate[i].maps.de_vertigo,
      de_anubis: winrate[i].maps.de_anubis,
    } as TeamMapsStats);
  }
  dbMap.write("mapsStats.xlsx");
}

async function setBaseInfo() {
  const teams = await getTopTeams(false);
  console.log(teams);

  // here calculate ma_1, ma_1_5 and ma_2_5
  const periods: FullMatchResult[][] = [];

  try {
    periods.push(await getEventsByPeriod(Period.month_1));
  } catch (e) {
    console.log(e, "month_1");
    await delay(60000);
    periods.push(await getEventsByPeriod(Period.month_1));
  }

  try {
    periods.push(await getEventsByPeriod(Period.month_1_5));
  } catch (e) {
    console.log(e, "month_1_5");
    await delay(60000);
    periods.push(await getEventsByPeriod(Period.month_1_5));
  }

  try {
    periods.push(await getEventsByPeriod(Period.month_2_5));
  } catch (e) {
    console.log(e, "month_2_5");
    await delay(60000);
    periods.push(await getEventsByPeriod(Period.month_2_5));
  }

  for (let i = 0; i < teams.length; i++) {
    let teamStats;
    try {
      teamStats = await getTeamPlayersStats(
        (teams[i] as TeamRanking).team.id as number
      );
    } catch (e) {
      i--;
      console.log(e);
      await delay(40000);
      continue;
    }

    const team2_0 = teamStats.reduce(
      (accumulator, currentValue) =>
        accumulator + (currentValue?.rating as number),
      0
    );

    let ma: [number, number][] = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    for (let j = 0; j < Period.length; j++) {
      for (let k = 0; k < periods[j].length; k++) {
        if (periods[j][k].team1.name == (teams[i] as TeamRanking).team.name) {
          if (periods[j][k].result.team1 > periods[j][k].result.team2) {
            console.log(`Found ${(teams[i] as TeamRanking).team.name}`);
            ma[j][0]++;
            ma[j][1]++;
          } else {
            ma[j][1]++;
          }
        }
        if (periods[j][k].team2.name == (teams[i] as TeamRanking).team.name) {
          if (periods[j][k].result.team2 > periods[j][k].result.team1) {
            console.log(`Found ${(teams[i] as TeamRanking).team.name}`);
            ma[j][0]++;
            ma[j][1]++;
          } else {
            ma[j][1]++;
          }
        }
      }
    }

    console.log(
      (teams[i] as TeamRanking).team.id,
      "\t",
      (teams[i] as TeamRanking).team.name,
      "\t",
      (teams[i] as TeamRanking).points,
      "\t",
      team2_0.toFixed(2),
      "\t",
      (ma[0][0] / ma[0][1]).toFixed(2),
      "\t",
      (ma[1][0] / ma[1][1]).toFixed(2),
      "\t",
      (ma[2][0] / ma[2][1]).toFixed(2)
    );

    db.addRaw<teamInfo>("Teams", {
      teamId: (teams[i] as TeamRanking).team.id,
      name: (teams[i] as TeamRanking).team.name,
      ranking: (teams[i] as TeamRanking).points,
      avg2_0: Number(team2_0.toFixed(2)), // (avg 2.0 for all players)
      ma1: Number((ma[0][0] / ma[0][1]).toFixed(2)),
      ma1_5: Number((ma[1][0] / ma[1][1]).toFixed(2)),
      ma2_5: Number((ma[2][0] / ma[2][1]).toFixed(2)),
    } as teamInfo);
  }
  teams.map((x: any, i: number) => {});

  db.write("stat.xlsx");
}

(async function main() {
  //===========================================
  await setBaseInfo();
  // await setMapsInfo();
  // await db.read("stat.xlsx");
  // await db.read("mapsStats.xlsx");
  //===========================================
  // console.log(
  //   await getTeam(((await getTopTeams(false))[0] as TeamRanking).team.name)
  // );
  // // Преобразуем объект в строку JSON
  // const jsonData = JSON.stringify(await HLTV.getEvents());
  // // Сохраняем данные в новый файл
  // await writeFile("balance.json", jsonData);
})();
