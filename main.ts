import { INFO } from "./hltv-handler";
import HLTV from "hltv-api";
import { DB } from "./db";

const info = new INFO();
const db = new DB("export.xlsx");

export interface Fraction {
  numerator: number;
  denominator: number;
}

interface teamInfo {
  teamId: number;
  name: string;
  ranking: number;
  matchesAmount: number;
  hltvRanking: number;
  middleRanking: number; // (2-0)
  gameId: number;
  id1_id2: Fraction;
  mapsAmount: number;
}

async function setBaseInfo() {
  const teams = await info.teams();
  teams.map((x: any, i: number) => {
    db.addRaw<teamInfo>("Teams", {
      teamId: x.id,
      name: x.name,
      ranking: 0,
      matchesAmount: 0,
      hltvRanking: x.ranking,
      middleRanking: 0, // (2-0)
      gameId: 0,
      id1_id2: { numerator: 1, denominator: 1 },
      mapsAmount: 0,
    } as teamInfo);
  });

  db.write("stat.xlsx");
}

(async function main() {
  // const teams = (await info.results()).map((x: any) => x.teams);
  // console.log(teams);

  // console.log(await info.teams());

  // db.addRaw("Teams", {
  //   teamId: 1,
  //   name: "kek",
  //   ranking: 2,
  //   matchesAmount: 3,
  //   hltvRanking: 5,
  //   middleRanking: 6,
  //   gameId: 7,
  //   id1_id2: { numerator: 1, denominator: 2 } as Fraction,
  //   mapsAmount: 0,
  // } as teamInfo);

  // await setBaseInfo();
  console.log(await HLTV.getTopPlayers());
  // console.log(await info.news());
  // await db.write("export_new.xlsx");
  // await db.read("export_new.xlsx");
})();
