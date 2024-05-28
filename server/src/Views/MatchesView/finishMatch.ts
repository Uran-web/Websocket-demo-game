import WebSocket from "ws";
import { PoolClient } from "pg";

import { IMatchData } from "../../models/matchModel";
import { getUserConnection } from "../../store/webSocketStore";
import { finishMatch } from "../../controllers/matchControllers";

export const handleFinishMatch = async (
  ws: WebSocket,
  client: PoolClient,
  data: IMatchData
) => {
  try {
    const match = await finishMatch(client, data);

    ws.send(
      JSON.stringify({
        type: "finishMatch",
        match,
      })
    );

    // NOTE: send confirmation to opponent
    const opponentWS = getUserConnection(data.initiator);
    if (opponentWS) {
      opponentWS.send(
        JSON.stringify({
          type: "finishMatch",
          match,
        })
      );
    }
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: "update match error",
        message: "Failed to finish match",
      })
    );
    console.log("Failed to finish match:", error.message);
  }
};
