import path from "path";
import "dotenv/config";

const oasesDirectory = path.join(process.cwd(), "oases");
const openAIFilename = path.join(oasesDirectory, "open-ai.yaml");

export const configs = {
  apiKey: process.env["OPEN_AI_KEY"] || "",
  model: "gpt-3.5-turbo-1106",
  apis: [
    {
      filename: openAIFilename,
      auth: { token: process.env["OPEN_AI_KEY"] },
    },
  ],
};
