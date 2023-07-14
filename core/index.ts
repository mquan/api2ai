import Security from "@core/api/security";

export const foo = () => new Security({ type: "http", scheme: "basic" }).scheme;
