import { PoolClient } from "pg";

import { IAttempt } from "../models/answerModel";
import { createPlayerAnswerAttempt } from "../models/answerModel";

export const answerAttempt = async (client: PoolClient, data: IAttempt) => {
  return await createPlayerAnswerAttempt(client, data);
};
