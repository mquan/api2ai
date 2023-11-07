import path from "path";

import { selectOperation } from "../select-operation";
import { parse } from "../../../api/oas-loader";

let selectOperationResponse: any;
let errorData: any;

jest.mock("openai", () => {
  return class MockedOpenAI {
    apiKey: string;

    chat: any = {
      completions: {
        create: ({ model, messages, functions }: any) => {
          if (errorData) {
            throw errorData;
          }

          if (messages[0].content.includes("items in the following list")) {
            return Promise.resolve(selectOperationResponse);
          }
        },
      },
    };

    constructor({ apiKey }: any) {
      this.apiKey = apiKey;
    }
  };
});

describe("selectOperation", () => {
  const filename: string = path.join(
    __dirname,
    "../../../../fixtures/oases/petstore.yaml"
  );
  let operations: any;

  beforeEach(async () => {
    selectOperationResponse = {};
    errorData = null;
    operations = await parse({ filename });
  });

  test("When an operation is found", async () => {
    selectOperationResponse = {
      choices: [{ message: { content: "Create a pet." } }],
    };
    const result = await selectOperation({
      userPrompt: "Add a new pet named Sticky",
      openaiApiKey: "secretKey",
      model: "gpt-3.5-turbo-1106",
      operations,
    });

    expect(result?.summary()).toEqual("Create a pet");
  });

  test("When the operation cannot be found", async () => {
    selectOperationResponse = { choices: [] };
    const result = await selectOperation({
      userPrompt: "Add a new pet named Sticky",
      openaiApiKey: "secretKey",
      model: "gpt-3.5-turbo-1106",
      operations,
    });

    expect(result).toEqual(null);
  });

  test("When AI hallucinates", async () => {
    selectOperationResponse = {
      choices: [{ message: { content: "Visit a zoo" } }],
    };

    const result = await selectOperation({
      userPrompt: "Add a new pet named Sticky",
      openaiApiKey: "secretKey",
      model: "gpt-3.5-turbo-1106",
      operations,
    });

    expect(result).toEqual(null);
  });

  test("When there is an error with the request", async () => {
    errorData = new Error("The model `gpt-3.5-turbo-06139` does not exist");

    await expect(
      selectOperation({
        userPrompt: "Add a new pet named Sticky",
        openaiApiKey: "secretKey",
        model: "gpt-3.5-turbo-1106",
        operations,
      })
    ).rejects.toThrow(
      "There's an error selecting operation: The model `gpt-3.5-turbo-06139` does not exist"
    );
  });
});
