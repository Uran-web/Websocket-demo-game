import { PoolClient } from "pg";
import {
  authPlayer,
  createNewPlayer,
  getAllPlayers,
  disconnectPlayerStatus,
  updateAllPlayers,
} from "../models/playerModel";
import { TAuth, IPlayer } from "../models/playerModel";

export const authenticatePlayer = async (
  client: PoolClient,
  authData: TAuth
) => {
  return await authPlayer(client, authData);
};

export const addPlayer = async (client: PoolClient, playerData: IPlayer) => {
  return await createNewPlayer(client, playerData);
};

export const fetchAllPlayers = async (client: PoolClient) => {
  return await getAllPlayers(client);
};

export const updatePlayerStatusToDisconnect = async (
  client: PoolClient,
  playerId: string
) => {
  return await disconnectPlayerStatus(client, playerId);
};

export const hashAllPlayerPasswords = async (client: PoolClient) => {
  return await updateAllPlayers(client);
};
