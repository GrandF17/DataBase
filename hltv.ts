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

  public async matchById(req: any): Promise<any> {
    const { eventId } = req.params;
    return await HLTV.getMatches(eventId);
  }

  public async players(): Promise<any> {
    return await HLTV.getTopPlayers();
  }

  public async playerById(req: any): Promise<any> {
    const { playerId } = req.params;
    return await HLTV.getPlayerById(playerId);
  }

  public async teams(): Promise<any> {
    return await HLTV.getTopTeams();
  }

  public async teamById(req: any): Promise<any> {
    const { teamId } = req.params;
    return await HLTV.getTeamById(Number(teamId));
  }
}
