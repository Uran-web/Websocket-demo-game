import WebSocket from "ws";
import { PoolClient } from "pg";

import { IHint } from "../../models/hintModel";
import { getUserConnection } from "../../store/webSocketStore";
import { hintPlayer } from "../../controllers/playerHint";

export const handleHint = async (
  ws: WebSocket,
  client: PoolClient,
  data: IHint
) => {
  try {
    const hint = await hintPlayer(client, data);

    ws.send(
      JSON.stringify({
        type: "hint",
        hint,
      })
    );

    const opponentWS = getUserConnection(data.initiator_player_id);
    if (opponentWS) {
      opponentWS.send(
        JSON.stringify({
          type: "hint",
          hint,
        })
      );
    }
  } catch (error: any) {
    ws.send(JSON.stringify({ type: "hint", message: "Failed to update hint" }));
    console.log("Failed to update hint:", error.message);
  }
};
