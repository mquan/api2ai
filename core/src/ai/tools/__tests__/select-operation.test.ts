import path from "path";

import { selectOperation } from "../select-operation";
import { parse } from "../../../api/oas-loader";

let selectOperationResponse: any;
let errorData: any;

jest.mock("openai", () => {
  return {
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createChatCompletion: ({ messages }: { messages: any }) => {
          if (errorData) {
            throw errorData;
          }

          if (messages[0].content.includes("items in the following list")) {
            return Promise.resolve(selectOperationResponse);
          }
        },
      };
    }),
    Configuration: jest.fn().mockImplementation(() => {}),
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
      data: { choices: [{ message: { content: "Create a pet." } }] },
    };
    const result = await selectOperation({
      userPrompt: "Add a new pet named Sticky",
      openaiApiKey: "secretKey",
      model: "gpt-3.5-turbo-0613",
      operations,
    });

    expect(result?.summary()).toEqual("Create a pet");
  });

  test("When the operation cannot be found", async () => {
    selectOperationResponse = { data: { choices: [] } };
    const result = await selectOperation({
      userPrompt: "Add a new pet named Sticky",
      openaiApiKey: "secretKey",
      model: "gpt-3.5-turbo-0613",
      operations,
    });

    expect(result).toEqual(null);
  });

  test("When AI hallucinates", async () => {
    selectOperationResponse = {
      data: { choices: [{ message: { content: "Visit a zoo" } }] },
    };

    const result = await selectOperation({
      userPrompt: "Add a new pet named Sticky",
      openaiApiKey: "secretKey",
      model: "gpt-3.5-turbo-0613",
      operations,
    });

    expect(result).toEqual(null);
  });

  test("When there is a generic error with the request", async () => {
    errorData = new Error("A network error");

    await expect(
      selectOperation({
        userPrompt: "Add a new pet named Sticky",
        openaiApiKey: "secretKey",
        model: "gpt-3.5-turbo-0613",
        operations,
      })
    ).rejects.toThrow("There's an error selecting operation: A network error");
  });

  test("When there is an openAI error", async () => {
    errorData = {
      response: {
        status: 404,
        data: {
          error: {
            message: "The model `gpt-3.5-turbo-06139` does not exist",
            type: "invalid_request_error",
            param: null,
            code: null,
          },
        },
      },
    };

    await expect(
      selectOperation({
        userPrompt: "Add a new pet named Sticky",
        openaiApiKey: "secretKey",
        model: "gpt-3.5-turbo-0613",
        operations,
      })
    ).rejects.toThrow(
      `There's an error selecting operation: Response status 404, data: ${JSON.stringify(
        errorData.response.data
      )}`
    );
  });
});
