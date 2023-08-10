// Don't import from @api2ai/core b/c the build needs fix-ono.sh
import { ApiAgent } from "../../../core/index";
import path from "path";
import "dotenv/config";
import { configs } from "./api2ai.config";

const apiAgent = new ApiAgent(configs);

const handler = async (req, res) => {
  const userPrompt = req.body.userPrompt;
  let result;

  try {
    result = await apiAgent.execute({
      userPrompt,
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
