import { PoolClient } from "pg";

export interface IHint {
  description: string;
  match_id: string;
  initiator_player_id: string;
}

export const createPlayerHint = async (client: PoolClient, data: IHint) => {
  try {
    const hint = await client.query(
      "INSERT INTO hints (description, match_id, initiator_player_id) VALUES ($1, $2, $3) RETURNING *",
      [data.description, data.match_id, data.initiator_player_id]
    );

    return hint.rows[0];
  } catch (error: any) {
    throw new Error(`Hint can not be created due to ${error.message}`);
  }
};
