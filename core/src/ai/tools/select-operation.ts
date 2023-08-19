import OpenAI from "openai";

import Operation from "../../api/operation";

const selectOperationPrompt = ({
  operations,
  userPrompt,
}: {
  operations: Operation[];
  userPrompt: string;
}) => {
  const list = operations.map((op: Operation) => op.summary());
  return `You must respond with one of the items in the following list: ${JSON.stringify(
    list
  )}. Do not return anything if there's no match. Do not make up any information not provided in the list. Which item is described by '${userPrompt}'?`;
};

interface SelectOperationInput {
  userPrompt: string;
  openaiApiKey: string;
  model: string;
  operations: Operation[];
}

export const selectOperation = async ({
  userPrompt,
  operations,
  openaiApiKey,
  model,
}: SelectOperationInput) => {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const prompt = selectOperationPrompt({ operations, userPrompt });

  try {
    const chatCompletion: any = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    if (chatCompletion.choices?.length) {
      const matchedSummary = chatCompletion.choices[0].message.content.replace(
        /\.$/,
        ""
      );
      return (
        operations.find((op: Operation) => op.summary() === matchedSummary) ||
        null
      );
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`There's an error selecting operation: ${error.message}`);
  }
};
