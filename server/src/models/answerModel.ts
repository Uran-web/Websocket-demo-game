import { PoolClient } from "pg";

export interface IAttempt {
  possibleWord: string;
  matchId: string;
  opponent: string;
}

export const createPlayerAnswerAttempt = async (
  client: PoolClient,
  data: IAttempt
) => {
  try {
    const answer = await client.query(
      `WITH inserted AS (
            INSERT INTO attempts (possible_word, match_id, acceptor_player_id)
            VALUES ($1, $2, $3)
            RETURNING *)
            SELECT possible_word, match_id, acceptor_player_id FROM attempts WHERE match_id = $2
            `,
      [data.possibleWord, data.matchId, data.opponent]
    );

    return [
      ...answer.rows,
      {
        possible_word: data.possibleWord,
        match_id: data.matchId,
        acceptor_player_id: data.opponent,
      },
    ];
  } catch (error: any) {
    throw new Error(`Attempt can not be created due to ${error.message}`);
  }
};
