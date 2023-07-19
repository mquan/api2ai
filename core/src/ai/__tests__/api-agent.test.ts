import * as path from "path";

import ApiAgent from "../api-agent";

let selectOperationResponse: any;
let parseArgsResponse: any;
let errorData: any;

let petResponse: Object;
let responseHeaders = { "X-Response-Status": "Complete" };
let responseStatus = 201;

global.fetch = jest.fn(() =>
  Promise.resolve({
    headers: responseHeaders,
    status: responseStatus,
    json: () => Promise.resolve(petResponse),
  })
) as jest.Mock;

jest.mock("openai", () => {
  return {
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createChatCompletion: ({ messages }: { messages: any }) => {
          if (errorData) {
            throw errorData;
          }

          if (
            messages[0].role === "system" &&
            messages[0].content.includes("Parse user input into arguments")
          ) {
            return Promise.resolve(parseArgsResponse);
          } else if (
            messages[0].content.includes("items in the following list")
          ) {
            return Promise.resolve(selectOperationResponse);
          }
        },
      };
    }),
    Configuration: jest.fn().mockImplementation(() => {}),
  };
});

describe("ApiAgent", () => {
  const filename: string = path.join(
    __dirname,
    "../../../fixtures/oases/petstore.yaml"
  );
  let context: Object;
  let userPrompt: string;

  describe("#execute", () => {
    let agent: ApiAgent;

    beforeEach(async () => {
      userPrompt = "add new pet named Skip";

      context = { token: "my-token" };

      const openAIKey = "openai-api-key";
      agent = new ApiAgent({
        apiKey: openAIKey,
        model: "gpt-3.5-turbo-0613",
        api: filename,
      });

      // Mocked data
      parseArgsResponse = {
        data: {
          choices: [
            { message: { function_call: { arguments: { name: "Sticky" } } } },
          ],
        },
      };

      selectOperationResponse = {
        data: { choices: [{ message: { content: "Create a pet." } }] },
      };

      petResponse = { id: 1, name: "Sticky" };
    });

    describe("when not verbose", () => {
      test("using a prompt that matches one of the operations", async () => {
        const result = await agent.execute({
          userPrompt,
          context,
        });

        expect(result).toEqual({
          userPrompt,
          selectedOperation: "createPets",
          response: {
            headers: responseHeaders,
            status: responseStatus,
            body: petResponse,
          },
        });
      });
    });

    describe("when verbose", () => {
      test("using a prompt that matches one of the operations", async () => {
        const result = await agent.execute({
          userPrompt,
          context,
          verbose: true,
        });

        expect(result).toEqual({
          userPrompt,
          selectedOperation: "createPets",
          request: {
            url: "http://petstore.swagger.io/v1/pets",
            method: "post",
            headers: {
              Authorization: "Bearer my-token",
              "Content-Type": "application/json",
            },
            body: { name: "Sticky" },
          },
          response: {
            headers: responseHeaders,
            status: responseStatus,
            body: petResponse,
          },
        });
      });
    });
  });
});
