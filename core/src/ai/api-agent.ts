import Operation from "../api/operation";
import { parse } from "../api/oas-loader";
import { selectOperation } from "./tools/select-operation";
import { parseArguments } from "./tools/parse-arguments";

const DEFAULT_CHAT_MODEL = "gpt-3.5-turbo-0613";

interface AgentInput {
  apiKey: string;
  model: string;
  api: string;
}

export default class ApiAgent {
  apiKey: string;
  model: string = DEFAULT_CHAT_MODEL;
  operations: Operation[] | null = null;
  api: string;

  constructor({ apiKey, model, api }: AgentInput) {
    this.apiKey = apiKey;
    this.model = model; // TODO: support gpt-4
    this.api = api;
  }

  /*
    Perform the command in two AI calls because:
      1. OpenAI currently only supports only 64 functions, doesn't work for large OAS.
      2. Cost saving: including all functions + args defintions uses up a lot of tokens
    Strategy:
    Step 1: Select an operation based on user prompt text
    Step 2: Invoke function calling for the matched operation, leverage AI to parse user input into args in the same call.
    Step 3: Make the API call
  */
  async execute({
    userPrompt,
    context,
    verbose = false,
  }: {
    userPrompt: string;
    context: any;
    verbose?: boolean;
  }) {
    if (!this.operations) {
      this.operations = await parse(this.api);
    }

    const operation = await selectOperation({
      userPrompt,
      operations: this.operations,
      model: this.model,
      openaiApiKey: this.apiKey,
    });

    if (operation) {
      const args = await parseArguments({
        userPrompt,
        model: this.model,
        openaiApiKey: this.apiKey,
        operation,
      });

      const apiResult = await operation.sendRequest({
        body: args,
        headers: context?.headers || {},
        authData: context,
      });

      return {
        userPrompt,
        selectedOperation: operation.operationId(),
        ...(verbose ? apiResult : { response: apiResult.response }),
      };
    } else {
      throw new Error(`Cannot find API for '${userPrompt}'`);
    }
  }
}
