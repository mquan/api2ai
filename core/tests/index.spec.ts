import Security from "../src/api/security";

describe("foo", () => {
  test("foo", () => {
    expect(new Security({ type: "http", scheme: "basic" }).scheme).toEqual(
      "basic"
    );
  });
});
