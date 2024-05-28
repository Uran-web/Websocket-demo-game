import WebSocket from "ws";

const userConnections: Map<string, WebSocket> = new Map();

export const addUserConnection = (userId: string, ws: WebSocket) => {
  userConnections.set(userId, ws);
  console.log(`Added connection for user: ${userId}`);
};

export const removeUserConnection = (userId: string) => {
  userConnections.delete(userId);
  console.log(`Remove connection for user: ${userId}`);
};

export const getUserConnection = (userId: string): WebSocket | undefined => {
  const connection = userConnections.get(userId);
  console.log(
    `Retrieved connection for user: ${userId} - Found: ${!!connection}`
  );
  return connection;
};
