import Security from "../security";

describe("Security", () => {
  describe("#constructor", () => {
    describe("valid basic auth", () => {
      test("initializes a basic auth instance", () => {
        const security = new Security({ type: "http", scheme: "basic" });
        expect(security.scheme).toEqual("basic");
      });
    });

    describe("valid bearer auth", () => {
      test("initializes a bearer auth instance", () => {
        const security = new Security({ type: "http", scheme: "bearer" });
        expect(security.scheme).toEqual("bearer");
      });
    });

    describe("valid apiKey auth", () => {
      test("initializes a bearer auth instance", () => {
        const security = new Security({ type: "apiKey", name: "X-Api-Key" });
        expect(security.type).toEqual("apiKey");
      });

      describe("missing name for apiKey", () => {
        test("throws error", () => {
          expect(() => {
            new Security({ type: "apiKey", apiKey: "X-Api-Key" });
          }).toThrow("Security type apiKey requires `name`.");
        });
      });
    });

    describe("invalid type", () => {
      test("throws error", () => {
        expect(() => {
          new Security({ type: "foo", scheme: "basic" });
        }).toThrow("Security type 'foo' is not supported.");
      });
    });

    describe("invalid scheme", () => {
      test("throws error", () => {
        expect(() => {
          new Security({ type: "http", scheme: "complex" });
        }).toThrow("Security scheme 'complex' is not supported.");
      });
    });
  });

  describe("#authData", () => {
    let data: any;
    let authInput: any;
    let securityInstance: Security;

    describe("Basic auth", () => {
      beforeEach(() => {
        authInput = {
          type: "http",
          scheme: "basic",
        };

        securityInstance = new Security(authInput);
      });

      describe("when username and password are provided", () => {
        test("returns auth data", () => {
          data = { username: "user", password: "Pa$$word" };
          const encoded = Buffer.from("user:Pa$$word").toString("base64");

          expect(securityInstance.authData(data)).toEqual({
            Authorization: `Basic ${encoded}`,
          });
        });
      });

      describe("when password is not provided", () => {
        test("throws error", () => {
          data = { username: "user" };

          expect(() => {
            securityInstance.authData(data);
          }).toThrow("`username` and `password` are required for basic auth");
        });
      });

      describe("when password is not provided", () => {
        test("throws error", () => {
          data = { password: "Pa$$word" };

          expect(() => {
            securityInstance.authData(data);
          }).toThrow("`username` and `password` are required for basic auth");
        });
      });

      describe("when auth input is not defined", () => {
        test("throws error", () => {
          data = undefined;

          expect(() => {
            securityInstance.authData(data);
          }).toThrow("`username` and `password` are required for basic auth");
        });
      });
    });

    describe("Bearer auth", () => {
      beforeEach(() => {
        authInput = {
          type: "http",
          scheme: "bearer",
        };

        securityInstance = new Security(authInput);
      });

      describe("when token is provided", () => {
        test("returns auth data", () => {
          data = { token: "my-token" };
          expect(securityInstance.authData(data)).toEqual({
            Authorization: "Bearer my-token",
          });
        });
      });

      describe("when token is not provided", () => {
        test("throws error", () => {
          data = { apiKey: "foobar" };

          expect(() => {
            securityInstance.authData(data);
          }).toThrow("`token` is required for bearer auth");
        });
      });

      describe("when auth data is undefined", () => {
        test("throws error", () => {
          data = undefined;

          expect(() => {
            securityInstance.authData(data);
          }).toThrow("`token` is required for bearer auth");
        });
      });
    });

    describe("API key auth", () => {
      beforeEach(() => {
        authInput = {
          type: "apiKey",
          name: "X-Api-Key",
          in: "header",
        };

        securityInstance = new Security(authInput);
      });

      describe("when api key is provided", () => {
        test("returns auth data", () => {
          data = { "X-Api-Key": "abcdefg-1234" };
          expect(securityInstance.authData(data)).toEqual({
            "X-Api-Key": "abcdefg-1234",
          });
        });
      });

      describe("when api key is not provided", () => {
        test("throws errors", () => {
          data = { apiKey: "abcdefg-1234" };

          expect(() => {
            securityInstance.authData(data);
          }).toThrow('"X-Api-Key" is required for API key auth');
        });
      });

      describe("when auth data is undefined", () => {
        test("throws errors", () => {
          data = undefined;

          expect(() => {
            securityInstance.authData(data);
          }).toThrow('"X-Api-Key" is required for API key auth');
        });
      });
    });
  });
});
