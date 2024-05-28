import WebSocket from "ws";
import { PoolClient } from "pg";

import { declineCurrentMatch } from "../../controllers/matchControllers";
import { getUserConnection } from "../../store/webSocketStore";
import { IMatchData } from "../../models/matchModel";

export const handleDeclineMatch = async (
  ws: WebSocket,
  client: PoolClient,
  data: IMatchData
) => {
  try {
    const match = await declineCurrentMatch(client, data);

    ws.send(JSON.stringify({ type: "declineMatch", match }));

    // NOTE: now we change data.opponent to data.initiator,
    // in order to inform him
    const opponentWs = getUserConnection(data.initiator);
    if (opponentWs) {
      opponentWs.send(
        JSON.stringify({
          type: "declineMatch",
          match,
        })
      );
    }
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: "initiate match error",
        message: "Failed to update match",
      })
    );
    console.log("Failed to update match:", error.message);
  }
};
