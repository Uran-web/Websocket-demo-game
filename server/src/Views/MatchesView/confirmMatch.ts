import WebSocket from "ws";
import { PoolClient } from "pg";

import { IMatchData } from "../../models/matchModel";
import { getUserConnection } from "../../store/webSocketStore";
import { confirmCurrentMatch } from "../../controllers/matchControllers";

export const handleConfirmMatch = async (
  ws: WebSocket,
  client: PoolClient,
  data: IMatchData
) => {
  try {
    const match = await confirmCurrentMatch(client, data);

    ws.send(
      JSON.stringify({
        type: "confirmMatch",
        match,
      })
    );

    // NOTE: send confirmation to opponent
    const opponentWS = getUserConnection(data.initiator);
    if (opponentWS) {
      opponentWS.send(
        JSON.stringify({
          type: "confirmMatch",
          match,
        })
      );
    }
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: "update match error",
        message: "Failed to update match",
      })
    );
    console.log("Failed to update match:", error.message);
  }
};
