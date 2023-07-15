import * as path from "path";

import ApiAgent from "../api-agent";
import { parse } from "../../api/oas-loader";

let selectOperationResponse: any;
let parseArgsResponse: any;
let errorData: any;

let petResponse: Object;
global.fetch = jest.fn(() =>
  Promise.resolve({
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

  describe("#execute", () => {
    let agent: ApiAgent;

    beforeEach(async () => {
      const operations = await parse(filename);

      context = { token: "my-token" };

      const openAIKey = "openai-api-key";
      agent = new ApiAgent({
        apiKey: openAIKey,
        model: "gpt-3.5-turbo-0613",
        operations,
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

    test("using a prompt that matches one of the operations", async () => {
      const result = await agent.execute({
        userPrompt: "add new pet named Skip",
        context,
      });

      expect(result).toEqual(petResponse);
    });
  });
});
