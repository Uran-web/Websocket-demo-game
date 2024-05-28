import { PoolClient } from "pg";

import { IHint } from "../models/hintModel";
import { createPlayerHint } from "../models/hintModel";

export const hintPlayer = async (client: PoolClient, data: IHint) => {
  return await createPlayerHint(client, data);
};
