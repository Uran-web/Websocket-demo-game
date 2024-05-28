import { PoolClient } from "pg";
import { createMatch, updateMatch } from "../models/matchModel";
import { IMatchData } from "../models/matchModel";

export const addMatch = async (client: PoolClient, data: IMatchData) => {
  return await createMatch(client, data);
};

export const declineCurrentMatch = async (
  client: PoolClient,
  data: IMatchData
) => {
  return await updateMatch(client, data);
};

export const confirmCurrentMatch = async (
  client: PoolClient,
  data: IMatchData
) => {
  return await updateMatch(client, data);
};

export const finishMatch = async (client: PoolClient, data: IMatchData) => {
  return await updateMatch(client, data);
};
