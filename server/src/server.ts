import { WebSocketServer, WebSocket } from "ws";
import { PoolClient } from "pg";
import "dotenv/config";

import pool from "./DB/dbConnection";
import {
  addUserConnection,
  removeUserConnection,
} from "./store/webSocketStore";
import { handleAuth } from "./Views/auth";
import { handleGetAllPlayers } from "./Views/PlayersView/getAllPlayers";
import { handleAddNewMatch } from "./Views/MatchesView/addNewMatch";
import { handleDeclineMatch } from "./Views/MatchesView/declineMatch";
import { handleConfirmMatch } from "./Views/MatchesView/confirmMatch";
import { handleAnswer } from "./Views/PlayerAnswer/answerMatch";
import { handleHint } from "./Views/PlayerHint/hintMatch";
import { handleFinishMatch } from "./Views/MatchesView/finishMatch";

const PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({ port: PORT as number });

const handlerMap: {
  [key: string]: (
    ws: WebSocket,
    client: PoolClient,
    data: any
  ) => Promise<void>;
} = {
  auth: handleAuth,
  showCompetitors: handleGetAllPlayers,
  addNewMatch: handleAddNewMatch,
  declineMatch: handleDeclineMatch,
  confirmMatch: handleConfirmMatch,
  answer: handleAnswer,
  hint: handleHint,
  finishMatch: handleFinishMatch,
};

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  let userId: string | null = null;

  ws.on("message", async (message: string) => {
    const parsedMessage = JSON.parse(message.toString());
    const { type, ...data } = parsedMessage;

    const handler = handlerMap[type];

    if (handler) {
      const client = await pool.connect();
      try {
        if (type === "auth") {
          userId = await handleAuth(ws, client, data);
          if (userId) {
            addUserConnection(userId.toString(), ws);
          }
        } else if (userId) {
          await handler(ws, client, data);
        } else {
          ws.send(
            JSON.stringify({ type: "error", message: "User not authenticated" })
          );
        }
      } catch (error) {
        console.error("Handler error:", error);
      } finally {
        client.release();
      }
    } else {
      ws.send(
        JSON.stringify({ type: "error", message: "Unknown request type" })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (userId) {
      removeUserConnection(userId);
    }
  });
});

console.log(`Server is running on ws://localhost:${PORT}`);
