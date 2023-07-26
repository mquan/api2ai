// Don't import from @api2ai/core b/c the build needs fix-ono.sh
import { ApiAgent } from "../../../core/index";
import path from "path";
import "dotenv/config";

const oasesDirectory = path.join(process.cwd(), "oases");
const oasFilename = path.join(oasesDirectory, "open-ai.yaml");

const apiAgent = new ApiAgent({
  apiKey: process.env["OPEN_AI_KEY"] || "",
  model: "gpt-3.5-turbo-0613",
  api: oasFilename,
});

const handler = async (req, res) => {
  const userPrompt = req.body.userPrompt;
  let result;

  try {
    result = await apiAgent.execute({
      userPrompt,
      context: { token: process.env["OPEN_AI_KEY"] },
      verbose: true,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(422).json({
      error: {
        message: `Process failed with error. Please tweak your prompt for better result. \n${error.message}`,
      },
    });
  }
};

export default handler;
