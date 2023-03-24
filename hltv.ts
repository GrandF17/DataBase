import HLTV from "hltv-api";

export class INFO {
  public async news(): Promise<any> {
    return await HLTV.getNews();
  }

  public async results(): Promise<any> {
    return await HLTV.getResults();
  }

  public async matches(): Promise<any> {
    return await HLTV.getMatches();
  }

  public async matchById(eventId: number): Promise<any> {
    return await HLTV.getMatches(eventId);
  }

  public async players(): Promise<any> {
    return await HLTV.getTopPlayers();
  }

  public async playerById(playerId: number): Promise<any> {
    return await HLTV.getPlayerById(playerId);
  }

  public async teams(): Promise<any> {
    return await HLTV.getTopTeams();
  }

  public async teamById(teamId: number): Promise<any> {
    return await HLTV.getTeamById(Number(teamId));
  }
}
