import Operation from "../operation";
import Security from "../security";

const group = "petstore";
const httpMethod = "post";
const baseUrl = "http://petstore.swagger.io/v1";
const path = "/pets";
const details = {
  summary: "Create a pet",
  description: "Create a pet from a pet name.",
  operationId: "createPets",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the pet",
              required: true,
            },
          },
        },
      },
    },
  },
  tags: ["pets"],
  responses: {
    "201": { description: "Null response" },
    default: {
      description: "unexpected error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "integer", format: "int32" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
};
let securities = [new Security({ type: "http", scheme: "basic" })];

let responseHeaders = { "X-Response-Status": "Complete" };
let responseStatus = 201;

const createOperation = () => {
  return new Operation({
    group,
    httpMethod,
    baseUrl,
    path,
    details,
    securities,
  });
};

let petResponse: Object;
global.fetch = jest.fn(() =>
  Promise.resolve({
    headers: responseHeaders,
    status: responseStatus,
    json: () => Promise.resolve(petResponse),
  })
) as jest.Mock;

describe("Operation", () => {
  let operation: Operation;

  beforeEach(() => {
    securities = [new Security({ type: "http", scheme: "basic" })];
    operation = createOperation();
  });

  describe("#url", () => {
    test("returns operation full URL", () => {
      expect(operation.url()).toEqual("http://petstore.swagger.io/v1/pets");
    });
  });

  describe("#group", () => {
    test("returns API group name", () => {
      expect(operation.group).toEqual("petstore");
    });
  });

  describe("#summary", () => {
    test("returns operation summary", () => {
      expect(operation.summary()).toEqual("Create a pet");
    });

    describe("when operation has a period at the end", () => {
      beforeEach(() => {
        const details2 = {
          summary: "Create a pet.",
          description: "Create a pet from a pet name.",
          operationId: "createPets",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Name of the pet",
                      required: true,
                    },
                  },
                },
              },
            },
          },
        };

        operation = new Operation({
          group,
          httpMethod,
          baseUrl,
          path,
          details: details2,
          securities,
        });
      });

      test("returns summary without the period", () => {
        expect(operation.summary()).toEqual("Create a pet");
      });
    });
  });

  describe("#description", () => {
    test("returns description", () => {
      expect(operation.description()).toEqual("Create a pet from a pet name.");
    });
  });

  describe("#toFunction", () => {
    describe("when requestBody is present", () => {
      test("returns function with parameters", () => {
        expect(operation.toFunction()).toEqual({
          name: "createPets",
          description: "Create a pet",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the pet",
              },
            },
            required: ["name"],
          },
        });
      });
    });

    describe("when parameter contains `required` field", () => {
      beforeEach(() => {
        const details2 = {
          summary: "Create a pet.",
          description: "Create a pet from a pet name.",
          operationId: "createPets",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Name of the pet",
                      required: true,
                    },
                  },
                },
              },
            },
          },
        };

        operation = new Operation({
          group,
          httpMethod,
          baseUrl,
          path,
          details: details2,
          securities,
        });
      });

      test("returns function with parameters", () => {
        expect(operation.toFunction()).toEqual({
          name: "createPets",
          description: "Create a pet",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the pet",
              },
            },
            required: ["name"],
          },
        });
      });
    });

    describe("when parameters contain an array", () => {
      beforeEach(() => {
        const details2 = {
          summary: "Create a chat completion",
          description: "Create a chat completion given user prompt",
          operationId: "createChatCompletion",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    messages: {
                      type: "array",
                      minItems: 1,
                      description: "List of chat messages",
                      items: {
                        type: "object",
                        properties: {
                          role: {
                            type: "string",
                            enum: ["system", "user", "assistant", "function"],
                          },
                          content: {
                            type: "string",
                            nullable: true,
                          },
                        },
                        required: ["role"],
                      },
                      required: true,
                    },
                  },
                },
              },
            },
          },
        };

        operation = new Operation({
          group,
          httpMethod,
          baseUrl,
          path,
          details: details2,
          securities,
        });
      });

      test("returns function with parsed parameters", () => {
        expect(operation.toFunction()).toEqual({
          name: "createChatCompletion",
          description: "Create a chat completion",
          parameters: {
            type: "object",
            properties: {
              messages: {
                type: "array",
                minItems: 1,
                description: "List of chat messages",
                items: {
                  type: "object",
                  properties: {
                    role: {
                      type: "string",
                      enum: ["system", "user", "assistant", "function"],
                    },
                    content: {
                      type: "string",
                      nullable: true,
                    },
                  },
                  required: ["role"],
                },
              },
            },
            required: ["messages"],
          },
        });
      });
    });

    describe("when requestBody is empty", () => {
      beforeEach(() => {
        const detailsWithoutResponseBody = {
          summary: "Create a pet",
          description: "Create a pet from a pet name.",
          operationId: "createPets",
          tags: ["pets"],
          requestBody: {
            content: {
              "application/xml": {},
            },
          },
          responses: {
            "201": { description: "Null response" },
            default: {
              description: "unexpected error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["code", "message"],
                    properties: {
                      code: { type: "integer", format: "int32" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        };

        operation = new Operation({
          group,
          httpMethod,
          baseUrl,
          path,
          details: detailsWithoutResponseBody,
          securities,
        });
      });

      test("returns empty parameters", () => {
        expect(operation.toFunction()).toEqual({
          name: "createPets",
          description: "Create a pet",
          parameters: {},
        });
      });
    });

    describe("when requestBody is not defined", () => {
      beforeEach(() => {
        const detailsWithoutResponseBody = {
          summary: "Create a pet",
          description: "Create a pet from a pet name.",
          operationId: "createPets",
          tags: ["pets"],
          responses: {
            "201": { description: "Null response" },
            default: {
              description: "unexpected error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["code", "message"],
                    properties: {
                      code: { type: "integer", format: "int32" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        };

        operation = new Operation({
          group,
          httpMethod,
          baseUrl,
          path,
          details: detailsWithoutResponseBody,
          securities,
        });
      });

      test("returns empty parameters", () => {
        expect(operation.toFunction()).toEqual({
          name: "createPets",
          description: "Create a pet",
          parameters: {},
        });
      });
    });
  });

  describe("#sendRequest", () => {
    let headers: Object;
    let parsedParams: any;
    let body: Object;
    let expectedBody: any;
    let authData: any;

    beforeEach(() => {
      headers = { "X-Content-Medata": "foobar" };
      body = { name: "Sticky" };
      expectedBody = JSON.stringify(body);
      parsedParams = { ...body, foo: "bar", a: 1 };
      authData = { username: "u$er", password: "Pa$$word" };
      petResponse = { id: 1, name: "Sticky" };
    });

    test("makes a request", async () => {
      const result = await operation.sendRequest({
        headers,
        parsedParams,
        authData,
      });

      expect(fetch).toHaveBeenCalledWith("http://petstore.swagger.io/v1/pets", {
        method: "post",
        body: expectedBody,
        headers: {
          Authorization: "Basic dSRlcjpQYSQkd29yZA==",
          "Content-Type": "application/json",
          "X-Content-Medata": "foobar",
        },
      });

      expect(result).toEqual({
        request: {
          url: "http://petstore.swagger.io/v1/pets",
          method: "post",
          headers: {
            Authorization: "Basic dSRlcjpQYSQkd29yZA==",
            "Content-Type": "application/json",
            "X-Content-Medata": "foobar",
          },
          body: expectedBody,
        },
        response: {
          headers: responseHeaders,
          status: responseStatus,
          body: { id: 1, name: "Sticky" },
        },
      });
    });

    describe("when request does not have body", () => {
      beforeEach(() => {
        operation = new Operation({
          group,
          httpMethod: "get",
          baseUrl,
          path,
          details,
          securities,
        });
      });

      test("makes a request without body", async () => {
        const result = await operation.sendRequest({
          headers,
          parsedParams,
          authData,
        });

        expect(fetch).toHaveBeenCalledWith(
          "http://petstore.swagger.io/v1/pets",
          {
            method: "get",
            headers: {
              Authorization: "Basic dSRlcjpQYSQkd29yZA==",
              "Content-Type": "application/json",
              "X-Content-Medata": "foobar",
            },
          }
        );

        expect(result).toEqual({
          request: {
            url: "http://petstore.swagger.io/v1/pets",
            method: "get",
            headers: {
              Authorization: "Basic dSRlcjpQYSQkd29yZA==",
              "Content-Type": "application/json",
              "X-Content-Medata": "foobar",
            },
          },
          response: {
            headers: responseHeaders,
            status: responseStatus,
            body: { id: 1, name: "Sticky" },
          },
        });
      });
    });

    describe("when auth data is not present", () => {
      beforeEach(() => {
        authData = undefined;
      });

      describe("when basic auth is required", () => {
        test("throws error", async () => {
          await expect(
            operation.sendRequest({ headers, parsedParams, authData })
          ).rejects.toThrow(
            "`username` and `password` are required for basic auth"
          );
        });
      });

      describe("when no securities required", () => {
        beforeEach(() => {
          securities = [];
          operation = createOperation();
        });

        test("makes request without authorization data", async () => {
          const result = await operation.sendRequest({
            headers,
            parsedParams,
            authData,
          });

          expect(fetch).toHaveBeenCalledWith(
            "http://petstore.swagger.io/v1/pets",
            {
              method: "post",
              body: expectedBody,
              headers: {
                "Content-Type": "application/json",
                "X-Content-Medata": "foobar",
              },
            }
          );

          expect(result).toEqual({
            request: {
              url: "http://petstore.swagger.io/v1/pets",
              method: "post",
              headers: {
                "Content-Type": "application/json",
                "X-Content-Medata": "foobar",
              },
              body: expectedBody,
            },
            response: {
              headers: responseHeaders,
              status: responseStatus,
              body: { id: 1, name: "Sticky" },
            },
          });
        });
      });

      describe("when operation is initialized with auth data", () => {
        beforeEach(() => {
          operation = new Operation({
            group,
            httpMethod,
            baseUrl,
            path,
            details,
            securities,
            auth: { username: "u$er", password: "Pa$$word" },
          });
        });

        test("makes a request with auth data", async () => {
          const result = await operation.sendRequest({
            headers,
            parsedParams,
            authData,
          });

          expect(fetch).toHaveBeenCalledWith(
            "http://petstore.swagger.io/v1/pets",
            {
              method: "post",
              body: expectedBody,
              headers: {
                Authorization: "Basic dSRlcjpQYSQkd29yZA==",
                "Content-Type": "application/json",
                "X-Content-Medata": "foobar",
              },
            }
          );

          expect(result).toEqual({
            request: {
              url: "http://petstore.swagger.io/v1/pets",
              method: "post",
              headers: {
                Authorization: "Basic dSRlcjpQYSQkd29yZA==",
                "Content-Type": "application/json",
                "X-Content-Medata": "foobar",
              },
              body: expectedBody,
            },
            response: {
              headers: responseHeaders,
              status: responseStatus,
              body: { id: 1, name: "Sticky" },
            },
          });
        });
      });
    });
  });
});
