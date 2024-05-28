import WebSocket from "ws";
import { PoolClient } from "pg";
import { fetchAllPlayers } from "../../controllers/playerController";

export const handleGetAllPlayers = async (
  ws: WebSocket,
  client: PoolClient
) => {
  try {
    const players = await fetchAllPlayers(client);

    ws.send(JSON.stringify(players));
  } catch (error: any) {
    ws.send(
      JSON.stringify({ type: "error", message: "Failed to fetch players" })
    );
    console.log("Failed to fetch players:", error.message);
  }
};
