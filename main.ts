import { INFO } from "./hltv";
import { DB } from "./db";

const info = new INFO();
const db = new DB("export.xlsx");

interface Fraction {
  numerator: number;
  denominator: number;
}

interface teamInfo {
  teamId: number;
  name: string;
  ranking: number;
  matchesAmount: number;
  substitutions: number; // (0-5)
  hltvRanking: number;
  middleRanking: number; // (2-0)
  gameId: number;
  id1_id2: Fraction;
  mapsAmount: number;
}

async function getBaseInfo() {
  const teams = await info.teams();
  teams.map((x: any, i: number) => {
    // db.addColumn({} as teamInfo);
  });
}

(async function main() {
  // const teams = (await info.results()).map((x: any) => x.teams);
  // console.log(teams);

  console.log(await info.teams());

  await db.write();
  db.addColumn("Sheet", {
    teamId: 1,
    name: "kek",
    ranking: 2,
    matchesAmount: 3,
    substitutions: 4,
    hltvRanking: 5,
    middleRanking: 6,
    gameId: 7,
    id1_id2: { numerator: 1, denominator: 2 } as Fraction,
    mapsAmount: 0,
  } as teamInfo);

  db.addColumn("Sheet", {
    teamId: 1,
    name: "kek",
    ranking: 2,
    matchesAmount: 3,
    substitutions: 4,
    hltvRanking: 5,
    middleRanking: 6,
    gameId: 7,
    id1_id2: { numerator: 1, denominator: 2 } as Fraction,
    mapsAmount: 0,
  } as teamInfo);
})();
