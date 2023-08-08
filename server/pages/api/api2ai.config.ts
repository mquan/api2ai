import path from "path";
import "dotenv/config";

const apiSpecDirectory = path.join(process.cwd(), "api-specs");
const openAIFilename = path.join(apiSpecDirectory, "open-ai.yaml");

export const configs = {
  apiKey: process.env["OPEN_AI_KEY"] || "",
  model: "gpt-3.5-turbo-0613",
  apis: [
    {
      filename: openAIFilename,
      auth: { token: process.env["OPEN_AI_KEY"] },
    },
  ],
};
