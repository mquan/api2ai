# ☁️⇨🤖🧠 api2ai

⚡ Create an API assistant from any Open API Spec ⚡

<img width="680" alt="api2ai demo with multiple APIs" src="https://github.com/mquan/api2ai/assets/138784/6719fdb2-6687-4768-a599-d61d7ab454a6">

## Features

**api2ai** lets you to interface with any API using English, or any natural language.

- Automatically parses open API spec and auth schemes
- Selects endpoint and parses arguments provided in user prompt
- Invokes the API call and return the response
- Comes with a local API

<img width="901" alt="api2ai demo with multiple languages" src="https://github.com/mquan/api2ai/assets/138784/aead4548-7d61-4ec6-8228-7c999e182cf0">

## Installation

`npm install --save @api2ai/core`

`yarn add --save @api2ai/core`

## Quickstart

The following example uses OpenAI API, essentially creating a single interface for all OpenAI endpoints. Please check out the [api code](https://github.com/mquan/api2ai/blob/main/server/pages/api/run.ts) for more details.

```typescript
import { ApiAgent } from "@api2ai/core";

const OPEN_AI_KEY = "sk-...";

const agent = new ApiAgent({
  apiKey: OPEN_AI_KEY,
  model: "gpt-3.5-turbo-0613", // "gpt-4-0613" also works
  apis: [
    {
      filename: "path/to/open-api-spec.yaml",
      auth: { token: "sk-...." },
    },
    {
      filename: "path/to/another-open-api-spec.yaml",
      auth: { username: "u$er", password: "pa$$word" },
    },
  ],
});

const result = await agent.execute({
  userPrompt: "Create an image of Waikiki beach",
  verbose: true, // default: false
});
```

## Using the agent via the API

To run the server in your machine, please clone the repo and follow the instruction in [Development & Contributing section](#development--contributing).

We use `dotenv` to store environment variables. Please create an `.env` file in the project's root directory and add your openai key

`OPEN_AI_KEY=sk-...`

Start the server

`yarn dev`

Make an api call

```typescript
fetch("http://localhost:5555/api/run", {
  headers: { "Content-Type": "application/json" },
  method: "POST",
  body: JSON.stringify({
    userPrompt:
      "Create an image of an astronaut swimming with dolphins in clear water ocean",
  }),
});
```

Configure the `server/pages/api/api2ai.config.ts` file to add your own APIs. Please follow the existing template in this file. You may add as many files as you want.

## Open API Spec

**api2ai** parses valid OAS files to determine which endpoint and parameters to use. Please ensure your OAS contains descriptive parameters and requestBody schema definition. We currently support OAS version 3.0.0 and above.

Tips: We leverage the `summary` fields to determine which endpoint to use. You can tweak your prompt according to the summary text for better result.

### Authentication

Configure your API auth credentials under the `auth` key for applicable APIs:

```typescript
// server/pages/api/api2ai.config.ts
export const configs = {
  model: "gpt-3.5-turbo-0613",
  token: process.env["OPEN_AI_KEY"],
  apis: [
    {
      file: "path/to/your-open-api-spec.yaml",
      auth: { token: process.env["MY_API_KEY"] },
    },
  ],
};
```

Currently, we support the following auth schemes:

- [Bearer authentication](https://swagger.io/docs/specification/authentication/bearer-authentication/)
- [API keys](https://swagger.io/docs/specification/authentication/api-keys/)
- [basic auth](https://swagger.io/docs/specification/authentication/basic-authentication/)

Please ensure `securitySchemes` fields are properly defined. Refer to the [Swagger doc](https://swagger.io/docs/specification/authentication/) for more details.

## Development & Contributing

We use yarn and [turbo](https://turbo.build/). Please clone the repo and install both in order to run the demo and build packages in your machine.

```
yarn install
yarn build
```

To run the server

`yarn dev`

Access the app from `http://localhost:5555/`

To run all tests

`yarn test`

Run a single test file

`turbo run test -- core/src/api/__tests__/operation.test.ts`
