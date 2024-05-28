import WebSocket from "ws";
import { PoolClient } from "pg";

import { getUserConnection } from "../../store/webSocketStore";
import { addMatch } from "../../controllers/matchControllers";
import { IMatchData } from "../../models/matchModel";

export const handleAddNewMatch = async (
  ws: WebSocket,
  client: PoolClient,
  data: IMatchData
) => {
  try {
    const match = await addMatch(client, data);

    ws.send(JSON.stringify({ type: "match created", match }));

    const opponentWs = getUserConnection(data.opponent);
    if (opponentWs) {
      opponentWs.send(
        JSON.stringify({
          type: "newMatch",
          match: { ...match, initiator_nick_name: data.initiator_nick_name },
        })
      );
    }
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: "initiate match error",
        message: "Failed to create match",
      })
    );
    console.log("Failed to create match:", error.message);
  }
};
