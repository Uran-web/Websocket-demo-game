import { PoolClient } from "pg";
import bcrypt from "bcrypt";

export interface IPlayer {
  name: string;
  nick_name: string;
  password: string;
  status: string;
}

export type TAuth = Pick<IPlayer, "password" | "nick_name">;

export const createNewPlayer = async (client: PoolClient, player: IPlayer) => {
  const hashedPassword = await bcrypt.hash(player.password, 10);

  try {
    await client.query(
      "INSERT INTO players (name, nick_name, password, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [player.name, player.nick_name, hashedPassword, player.status]
    );
  } catch (error: any) {
    if (error.code === "23505") {
      throw new Error("Nick name already exists");
    } else {
      throw new Error(
        `Some error occurred in CreateNewPlayer request: ${error.message}`
      );
    }
  }
};

export const getAllPlayers = async (client: PoolClient) => {
  try {
    const res = await client.query("SELECT id, nick_name, status FROM players");
    const respond = { type: "competitors", competitors: res.rows };
    return respond;
  } catch (error: any) {
    throw new Error(
      `Some error occurred in getAllPlayers request: ${error.message}`
    );
  }
};

export const authPlayer = async (
  client: PoolClient,
  { nick_name, password }: TAuth
) => {
  try {
    const playerResult = await client.query(
      "SELECT id, name, nick_name, password FROM players WHERE nick_name = $1",
      [nick_name]
    );

    if (playerResult.rowCount === 0) {
      throw new Error(`Player with nick name ${nick_name} does not exists.`);
    }

    const player = playerResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, player.password);

    if (!isPasswordValid) {
      throw new Error("Password is not valid");
    }

    await client.query("UPDATE players SET status = $1 WHERE id = $2", [
      "active",
      player.id,
    ]);
    return { ...player, status: "active" };
  } catch (error: any) {
    throw new Error(
      `Some error occurred in authPlayer request: ${error.message}`
    );
  }
};

export const disconnectPlayerStatus = async (
  client: PoolClient,
  id: string
) => {
  try {
    await client.query(
      "UPDATE players SET status = $1, role = $2 WHERE id = $3",
      ["off", "watcher", id]
    );
  } catch (error: any) {
    throw new Error(
      `Some error occurred in disconnectPlayerStatus request: ${error.message}`
    );
  }
};

// NOTE: Only for develope purposes
export const updateAllPlayers = async (client: PoolClient) => {
  const { rows: players } = await client.query(
    "SELECT id, password FROM players"
  );

  try {
    for (const player of players) {
      const hashedPassword = await bcrypt.hash(player.password, 10);
      await client.query("UPDATE players SET password = $1 WHERE id = $2", [
        hashedPassword,
        player.id,
      ]);
    }
  } catch (error: any) {
    throw new Error(
      `Some error occurred in updateAllPlayers request: ${error.message}`
    );
  }
};
