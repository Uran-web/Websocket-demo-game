import { WebSocket } from "ws";
import { PoolClient } from "pg";
import { authenticatePlayer } from "../controllers/playerController";

export const handleAuth = async (
  ws: WebSocket,
  client: PoolClient,
  data: { nick_name: string; password: string }
) => {
  const { nick_name, password } = data;
  try {
    const player = await authenticatePlayer(client, { nick_name, password });

    ws.send(JSON.stringify({ type: "authenticated", clientId: player.id }));

    return player.id;
  } catch (error) {
    ws.send(JSON.stringify({ type: "error", message: "Wrong password" }));
    ws.close();
    console.log("Client disconnected due to wrong password");
    return null;
  }
};
