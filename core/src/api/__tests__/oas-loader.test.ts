import path from "path";
import { parse } from "../oas-loader";

describe("#parse", () => {
  const filename: string = path.join(
    __dirname,
    "../../../fixtures/oases/petstore.yaml"
  );

  test("parsing open api spec into operations", async () => {
    const operations = await parse(filename);

    expect(operations.map((o) => o.summary())).toEqual([
      "List all pets",
      "Create a pet",
      "Info for a specific pet",
    ]);
  });

  describe("securities", () => {
    test("parses security specifications", async () => {
      const operations = await parse(filename);

      // When operation specifies security
      expect(operations[0].securities.length).toEqual(1);
      expect(operations[0].securities[0].type).toEqual("http");
      expect(operations[0].securities[0].scheme).toEqual("basic");

      // When operation does not specify security
      expect(operations[1].securities.length).toEqual(1);
      expect(operations[1].securities[0].type).toEqual("http");
      expect(operations[1].securities[0].scheme).toEqual("bearer");

      // When operation supports multiple security schemes
      const multipleSecurities = operations[2].securities;
      expect(multipleSecurities.length).toEqual(2);
      expect(multipleSecurities[0].type).toEqual("apiKey");
      expect(multipleSecurities[0].inKey).toEqual("header");
      expect(multipleSecurities[0].name).toEqual("X-Api-Key");
      expect(multipleSecurities[1].type).toEqual("http");
      expect(multipleSecurities[1].scheme).toEqual("bearer");
    });

    describe("when no security schemes defined", () => {
      test("parses yaml without security", async () => {
        console.warn = jest.fn();

        const noSecurityFile: string = path.join(
          __dirname,
          "../../../fixtures/oases/no-security.yaml"
        );
        const operations = await parse(noSecurityFile);

        expect(console.warn).toHaveBeenCalledWith(
          "No `securitySchemes` found in this API spec."
        );
        expect(operations.map((op) => op.securities)).toEqual([[]]);
      });
    });

    describe("when reference an invalid security", () => {
      test("throws an error", async () => {
        const invalidSecurityFile: string = path.join(
          __dirname,
          "../../../fixtures/oases/invalid-securities.yaml"
        );

        await expect(parse(invalidSecurityFile)).rejects.toThrow(
          "Invalid security 'basicAuth' reference."
        );
      });
    });
  });
});
