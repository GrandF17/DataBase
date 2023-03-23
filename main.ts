import { INFO } from "./hltv";
import { DB } from "./db";

const info = new INFO();
const db = new DB();

(async function main() {
  // const teams = (await info.results()).map((x: any) => x.teams);
  // console.log(teams);

  console.log(await info.teams());

  await db.write();
})();
