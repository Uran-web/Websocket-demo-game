import { PoolClient } from "pg";

export interface IMatchData {
  id?: number;
  word: string;
  initiator: string;
  initiator_nick_name: string;
  opponent: string;
  opponent_nick_name: string;
  match_status: "pending" | "progress" | "finished";
  reason?: "guessed" | "giveUp";
}

export const createMatch = async (client: PoolClient, data: IMatchData) => {
  const {
    word,
    initiator,
    opponent,
    match_status = "pending",
    opponent_nick_name,
  } = data;

  try {
    const result = await client.query(
      "INSERT INTO matches (word, initiator_player_id, acceptor_player_id, match_status) VALUES ($1, $2, $3, $4) RETURNING *",
      [word, initiator, opponent, match_status]
    );

    return result.rows[0];
  } catch (error: any) {
    throw new Error(`Match can not be created due to ${error.message}`);
  }
};

export const updateMatch = async (client: PoolClient, data: IMatchData) => {
  const { id, match_status, reason } = data;

  const defaultReason = reason || "unspecified";

  try {
    const result = await client.query(
      "UPDATE matches SET match_status = $1, reason = $2 WHERE id = $3 RETURNING *",
      [match_status, defaultReason, id]
    );

    return result.rows[0];
  } catch (error: any) {
    throw new Error(`Match can not be updated due to ${error.message}`);
  }
};
