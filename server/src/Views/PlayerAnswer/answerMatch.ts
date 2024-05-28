import WebSocket from "ws";
import { PoolClient } from "pg";

import { IAttempt } from "../../models/answerModel";
import { answerAttempt } from "../../controllers/playerAnswer";
import { getUserConnection } from "../../store/webSocketStore";

export const handleAnswer = async (
  ws: WebSocket,
  client: PoolClient,
  data: IAttempt
) => {
  try {
    const answer = await answerAttempt(client, data);

    ws.send(
      JSON.stringify({
        type: "answer",
        answer,
      })
    );

    const opponentWS = getUserConnection(data.opponent);
    if (opponentWS) {
      opponentWS.send(
        JSON.stringify({
          type: "answer",
          answer,
        })
      );
    }
  } catch (error: any) {
    ws.send(
      JSON.stringify({ type: "answer", message: "Failed to update answer" })
    );
    console.log("Failed to update answer:", error.message);
  }
};
