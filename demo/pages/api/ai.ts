import ApiAgent from "@core/ai/api-agent";
import * as path from "path";
import "dotenv/config";

const oasesDirectory = path.join(process.cwd(), "oases");
const oasFilename = path.join(oasesDirectory, "open-ai.yaml");

const apiAgent = new ApiAgent({
  apiKey: process.env.OPEN_AI_KEY,
  model: "gpt-3.5-turbo-0613",
  api: oasFilename,
});

const handler = async (req, res) => {
  const userPrompt = req.body.userPrompt;
  let result;

  try {
    result = await apiAgent.execute({
      userPrompt,
      context: { token: process.env.OPEN_AI_KEY },
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(422).json({
      error: {
        message: `Prcoess failed with error ${error.message}. You can try to tweak your prompt for better result.`,
      },
    });
  }
};

export default handler;
